// @vitest-environment node
import { describe,expect,it,vi } from 'vitest';
import { processWhatsAppInbound } from './whatsapp-ai-service.js';

describe('WhatsApp AI service safeguards',()=>{
  it('does not call providers when the bot or instance is disabled',async()=>{
    const client={query:vi.fn(async(sql)=>{
      if(String(sql).includes('FROM public.whatsapp_messages m'))return{rows:[{
        message_id:'11111111-1111-4111-8111-111111111111',conversation_id:'22222222-2222-4222-8222-222222222222',
        enabled:false,bot_enabled:false,ai_enabled:true,conversation_status:'ai',
      }]};
      return{rows:[]};
    })};
    const fetchImpl=vi.fn();
    const result=await processWhatsAppInbound(client,{payload:{messageId:'11111111-1111-4111-8111-111111111111'}},{fetchImpl});
    expect(result).toEqual({skipped:'bot_disabled_or_human'});
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
