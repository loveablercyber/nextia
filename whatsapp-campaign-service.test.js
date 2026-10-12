// @vitest-environment node
import { describe,expect,it,vi } from 'vitest';
import { inQuietHours,processWhatsAppCampaigns,renderCampaignMessage } from './whatsapp-campaign-service.js';

describe('WhatsApp campaign safeguards',()=>{
  it('keeps campaign execution disabled by default',async()=>{
    const client={query:vi.fn(async()=>({rows:[]}))};
    await expect(processWhatsAppCampaigns(client)).resolves.toEqual({skipped:'campaigns_disabled',claimed:0,sent:0,failed:0});
    expect(client.query).toHaveBeenCalledTimes(1);
  });

  it('renders only supported contact variables',()=>{
    expect(renderCampaignMessage('Olá {{ nome }}, da {{empresa}}! {{desconhecido}}',{name:'Ana',company_name:'ACME'})).toBe('Olá Ana, da ACME! {{desconhecido}}');
  });

  it('blocks overnight quiet hours using the configured timezone',()=>{
    const config={enabled:true,start:'20:00',end:'08:00',timezone:'America/Sao_Paulo'};
    expect(inQuietHours(config,new Date('2026-10-11T02:00:00.000Z'))).toBe(true);
    expect(inQuietHours(config,new Date('2026-10-10T15:00:00.000Z'))).toBe(false);
  });
});
