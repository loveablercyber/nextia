import { describe,expect,it,vi } from 'vitest';
import { handleEvolutionWebhook,parseEvolutionMessage } from './evolution-whatsapp.js';

const payload={
  event:'messages.upsert',instance:'nextia',apikey:'must-not-be-persisted',
  data:{key:{id:'MSG-123',remoteJid:'5511999999999@s.whatsapp.net',fromMe:false},pushName:'Ana',message:{conversation:'Quero saber mais sobre o plano Pro.'}},
};

function response(){
  return {status:null,body:null,json(status,body){this.status=status;this.body=body;return body;}};
}

describe('Evolution WhatsApp webhook',()=>{
  it('extracts text and ignores messages sent by the connected account',()=>{
    expect(parseEvolutionMessage(payload)).toMatchObject({eventId:'MSG-123',instance:'nextia',phone:'5511999999999',contactName:'Ana'});
    expect(parseEvolutionMessage({...payload,data:{...payload.data,key:{...payload.data.key,fromMe:true}}})).toBeNull();
  });

  it('uses the alternate phone JID when Baileys identifies the sender by LID',()=>{
    const lidPayload={...payload,data:{...payload.data,key:{
      ...payload.data.key,
      remoteJid:'123456789012345@lid',
      remoteJidAlt:'5511999999999@s.whatsapp.net',
    }}};
    expect(parseEvolutionMessage(lidPayload)).toMatchObject({phone:'5511999999999'});
  });

  it('does not treat an unresolved LID as a phone number',()=>{
    const lidPayload={...payload,data:{...payload.data,key:{
      ...payload.data.key,
      remoteJid:'123456789012345@lid',
    }}};
    expect(parseEvolutionMessage(lidPayload)).toBeNull();
  });

  it('routes an inbound reply to the established site conversation idempotently',async()=>{
    const calls=[];
    const client={query:vi.fn(async(sql,params)=>{
      calls.push({sql:String(sql),params});
      if(String(sql).includes('INSERT INTO public.provider_webhook_events'))return {rows:[{id:'webhook-1'}],rowCount:1};
      if(String(sql).includes('SELECT c.id,c.contact_id,c.site_id'))return {rows:[{id:'conversation-1',contact_id:'contact-1',site_id:'site-1'}],rowCount:1};
      return {rows:[],rowCount:1};
    })};
    const res=response();
    const json=(target,status,body)=>target.json(status,body);
    await handleEvolutionWebhook({headers:{'x-webhook-secret':'forward-secret'}},res,{
      client,json,readJson:async()=>payload,env:{EVOLUTION_WEBHOOK_SECRET:'forward-secret'},
    });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({received:true,routed:true});
    expect(calls.some(call=>call.sql.includes('INSERT INTO public.site_messages')&&call.params[3]==='MSG-123')).toBe(true);
    const eventInsert=calls.find(call=>call.sql.includes('INSERT INTO public.provider_webhook_events'));
    expect(eventInsert.params[4]).not.toContain('must-not-be-persisted');
  });

  it('uses the predicate of the partial message id index when storing a managed conversation',async()=>{
    const calls=[];
    const client={query:vi.fn(async(sql,params)=>{
      const statement=String(sql);calls.push({sql:statement,params});
      if(statement.includes('INSERT INTO public.provider_webhook_events'))return {rows:[{id:'webhook-managed'}],rowCount:1};
      if(statement.includes('FROM public.whatsapp_instances i LEFT JOIN'))return {rows:[{id:'instance-1',organization_id:null,bot_enabled:true,allow_new_contacts:true,crm_context_enabled:false,opt_out_keywords:[]}],rowCount:1};
      if(statement.includes('SELECT * FROM public.whatsapp_contacts'))return {rows:[],rowCount:0};
      if(statement.includes('INSERT INTO public.whatsapp_contacts'))return {rows:[{id:'contact-1',name:'Ana',crm_lead_id:null}],rowCount:1};
      if(statement.includes('INSERT INTO public.whatsapp_conversations'))return {rows:[{id:'conversation-1'}],rowCount:1};
      if(statement.includes('INSERT INTO public.whatsapp_messages'))return {rows:[{id:'message-1'}],rowCount:1};
      return {rows:[],rowCount:1};
    })};
    const res=response();
    const json=(target,status,body)=>target.json(status,body);
    await handleEvolutionWebhook({headers:{'x-webhook-secret':'forward-secret'}},res,{
      client,json,readJson:async()=>payload,env:{EVOLUTION_WEBHOOK_SECRET:'forward-secret'},
    });

    const messageInsert=calls.find(call=>call.sql.includes('INSERT INTO public.whatsapp_messages'));
    expect(messageInsert?.sql).toContain('ON CONFLICT(provider_message_id) WHERE provider_message_id IS NOT NULL DO NOTHING');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({received:true,managedRouted:true,siteRouted:false});
  });

  it('rejects an unauthenticated forwarding request before writing to the database',async()=>{
    const client={query:vi.fn()};
    const res=response();
    const json=(target,status,body)=>target.json(status,body);
    const warning=vi.spyOn(console,'warn').mockImplementation(()=>{});
    await handleEvolutionWebhook({headers:{}},res,{client,json,readJson:async()=>payload,env:{EVOLUTION_WEBHOOK_SECRET:'secret'}});
    expect(res.status).toBe(401);
    expect(client.query).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith('[EVOLUTION_WEBHOOK_REJECTED]',expect.objectContaining({event:'MESSAGES_UPSERT',instance:'nextia',hasWebhookSecret:false}));
    warning.mockRestore();
  });

  it('stores the QR image received asynchronously from Evolution',async()=>{
    const calls=[];
    const client={query:vi.fn(async(sql,params)=>{
      calls.push({sql:String(sql),params});
      if(String(sql).includes('INSERT INTO public.provider_webhook_events'))return {rows:[{id:'webhook-qr'}],rowCount:1};
      return {rows:[],rowCount:1};
    })};
    const res=response();
    const json=(target,status,body)=>target.json(status,body);
    await handleEvolutionWebhook({headers:{'x-webhook-secret':'forward-secret'}},res,{
      client,json,readJson:async()=>({event:'qrcode.updated',instance:'nextia',data:{qrcode:{base64:'data:image/png;base64,QR'}}}),env:{EVOLUTION_WEBHOOK_SECRET:'forward-secret'},
    });

    const update=calls.find(call=>call.sql.includes("connection_status='qrcode'"));
    expect(update?.params).toEqual(['nextia','data:image/png;base64,QR']);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({received:true,ignored:true});
  });

  it('preserves QR state when Evolution emits connecting after the QR image',async()=>{
    const calls=[];
    const client={query:vi.fn(async(sql,params)=>{
      calls.push({sql:String(sql),params});
      if(String(sql).includes('INSERT INTO public.provider_webhook_events'))return {rows:[{id:'webhook-connecting'}],rowCount:1};
      return {rows:[],rowCount:1};
    })};
    const res=response();
    const json=(target,status,body)=>target.json(status,body);
    await handleEvolutionWebhook({headers:{'x-webhook-secret':'forward-secret'}},res,{
      client,json,readJson:async()=>({event:'connection.update',instance:'nextia',data:{state:'connecting'}}),env:{EVOLUTION_WEBHOOK_SECRET:'forward-secret'},
    });

    const update=calls.find(call=>call.sql.includes("$2='connecting' AND qr_code_data IS NOT NULL"));
    expect(update?.params).toEqual(['nextia','connecting']);
    expect(update?.sql).toContain("THEN 'qrcode'");
    expect(res.status).toBe(200);
  });
});
