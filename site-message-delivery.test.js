import { describe, expect, it, vi } from 'vitest';
import { AutomationEngine } from './automation-engine.js';
import { deliverSiteMessage, markSiteMessageFailed } from './site-message-delivery.js';

const event = {
  payload: {
    siteId:'11111111-1111-4111-8111-111111111111',
    conversationId:'22222222-2222-4222-8222-222222222222',
    messageId:'33333333-3333-4333-8333-333333333333',
  },
};

function message(overrides={}){
  return {
    id:event.payload.messageId,body:'Sua solicitação foi aprovada.',delivery_status:'queued',delivery_channel:'email',
    conversation_id:event.payload.conversationId,subject:'Orçamento',conversation_channel:'web_form',contact_name:'Ana',
    contact_email:'ana@example.com',contact_phone:'11999999999',site_id:event.payload.siteId,business_name:'Empresa Exemplo',
    owner_email:'contato@empresa.example',...overrides,
  };
}

function database(row){
  const calls=[];
  return {calls,query:vi.fn(async(sql,params)=>{calls.push({sql:String(sql),params});if(String(sql).includes('FROM public.site_messages sm'))return {rows:[row],rowCount:1};return {rows:[],rowCount:1};})};
}

describe('site message delivery',()=>{
  it('sends email through Resend with an idempotency key and records delivery',async()=>{
    const client=database(message());
    const fetchImpl=vi.fn().mockResolvedValue({ok:true,status:200,text:async()=>JSON.stringify({id:'email-provider-id'})});
    const result=await deliverSiteMessage(client,event,{fetchImpl,env:{RESEND_API_KEY:'secret',RESEND_SITE_FROM:'Empresa <sites@example.com>'}});
    expect(result).toMatchObject({channel:'email',provider:'resend',reference:'email-provider-id'});
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [,request]=fetchImpl.mock.calls[0];
    expect(request.headers['Idempotency-Key']).toBe(`site-message/${event.payload.messageId}`);
    expect(JSON.parse(request.body)).toMatchObject({to:['ana@example.com'],reply_to:'contato@empresa.example'});
    expect(client.calls.some(call=>call.sql.includes("delivery_status='sent'")&&call.params[1]==='resend')).toBe(true);
  });

  it('sends a WhatsApp text through the configured Cloud API endpoint',async()=>{
    const client=database(message({delivery_channel:'whatsapp',contact_email:null}));
    const fetchImpl=vi.fn().mockResolvedValue({ok:true,status:200,text:async()=>JSON.stringify({messages:[{id:'wamid.123'}]})});
    const result=await deliverSiteMessage(client,event,{fetchImpl,env:{WHATSAPP_ACCESS_TOKEN:'token',WHATSAPP_PHONE_NUMBER_ID:'12345',WHATSAPP_API_VERSION:'24.0',WHATSAPP_REPLY_TEMPLATE_NAME:'resposta_site'}});
    expect(result).toMatchObject({channel:'whatsapp',provider:'whatsapp-cloud-api',reference:'wamid.123'});
    expect(fetchImpl.mock.calls[0][0]).toBe('https://graph.facebook.com/v24.0/12345/messages');
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toMatchObject({to:'5511999999999',type:'template',template:{name:'resposta_site'}});
  });

  it('does not retry a missing provider configuration indefinitely',async()=>{
    const client=database(message());
    await expect(deliverSiteMessage(client,event,{fetchImpl:vi.fn(),env:{}})).rejects.toMatchObject({code:'RESEND_NOT_CONFIGURED',retryable:false});
    expect(client.calls.some(call=>call.sql.includes('delivery_error='))).toBe(true);
  });

  it('marks the message failed when the worker exhausts retries',async()=>{
    const client=database(message());
    await markSiteMessageFailed(client,event,new Error('provider unavailable'));
    expect(client.calls.at(-1).sql).toContain("delivery_status='failed'");
    expect(client.calls.at(-1).params[1]).toBe('provider unavailable');
  });

  it('is processed by the central automation worker instead of being silently completed',async()=>{
    const client=database(message());
    const fetchImpl=vi.fn().mockResolvedValue({ok:true,status:200,text:async()=>JSON.stringify({id:'worker-email-id'})});
    const previousKey=process.env.RESEND_API_KEY;
    process.env.RESEND_API_KEY='worker-secret';
    try{
      const outcome=await new AutomationEngine(client,{fetchImpl,maxAttempts:3}).processEvent({...event,id:'44444444-4444-4444-8444-444444444444',event_type:'site.message_reply_requested',attempts:1});
      expect(outcome).toBe('completed');
      expect(fetchImpl).toHaveBeenCalledOnce();
      expect(client.calls.at(-1).sql).toContain("status='completed'");
    }finally{
      if(previousKey===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=previousKey;
    }
  });
});
