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

  it('rejects an unauthenticated forwarding request before writing to the database',async()=>{
    const client={query:vi.fn()};
    const res=response();
    const json=(target,status,body)=>target.json(status,body);
    await handleEvolutionWebhook({headers:{}},res,{client,json,readJson:async()=>payload,env:{EVOLUTION_WEBHOOK_SECRET:'secret'}});
    expect(res.status).toBe(401);
    expect(client.query).not.toHaveBeenCalled();
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
