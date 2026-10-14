// @vitest-environment node
import { describe,expect,it,vi } from 'vitest';
import {
  configureEvolutionWebhook,evolutionConfig,evolutionQr,getEvolutionQr,getEvolutionStatus,normalizeEvolutionStatus,
  normalizeWhatsAppNumber,sendEvolutionText,
} from './evolution-client.js';

const instance={instance_name:'nextia',api_url_env:'EVO_URL',api_key_env:'EVO_KEY'};
const env={EVO_URL:'https://evo.example.com/',EVO_KEY:'super-secret'};

function provider(data,status=200){return{ok:status>=200&&status<300,status,text:async()=>JSON.stringify(data)}}

describe('Evolution API client',()=>{
  it('resolves credentials from allow-listed environment variable names without exposing them',()=>{
    expect(evolutionConfig(instance,env)).toEqual({baseUrl:'https://evo.example.com',apiKey:'super-secret',instanceName:'nextia'});
    expect(()=>evolutionConfig({...instance,api_key_env:'not-valid'},env)).toThrow(/credencial inválida/i);
  });

  it('normalizes Brazilian numbers and rejects unsupported values',()=>{
    expect(normalizeWhatsAppNumber('(14) 99640-5496')).toBe('5514996405496');
    expect(normalizeWhatsAppNumber('5514996405496')).toBe('5514996405496');
    expect(()=>normalizeWhatsAppNumber('123')).toThrow(/telefone brasileiro/i);
  });

  it('reads provider status and sends text to the configured instance',async()=>{
    const fetchImpl=vi.fn()
      .mockResolvedValueOnce(provider({instance:{state:'open'}}))
      .mockResolvedValueOnce(provider({key:{id:'EVO-1'}}));
    const status=await getEvolutionStatus(instance,{fetchImpl,env});
    expect(normalizeEvolutionStatus(status)).toBe('connected');
    const sent=await sendEvolutionText(instance,{number:'14996405496',text:'Olá'}, {fetchImpl,env});
    expect(sent.providerMessageId).toBe('EVO-1');
    expect(fetchImpl.mock.calls[0][0]).toBe('https://evo.example.com/instance/connectionState/nextia');
    expect(fetchImpl.mock.calls[1][0]).toBe('https://evo.example.com/message/sendText/nextia');
    expect(fetchImpl.mock.calls[1][1].headers.apikey).toBe('super-secret');
  });

  it('configures a direct webhook with only the required events',async()=>{
    const fetchImpl=vi.fn().mockResolvedValue(provider({ok:true}));
    await configureEvolutionWebhook(instance,'https://painel.example.com/api/webhooks/evolution',{fetchImpl,env});
    const request=fetchImpl.mock.calls[0][1];
    expect(JSON.parse(request.body)).toMatchObject({webhook:{enabled:true,url:'https://painel.example.com/api/webhooks/evolution',byEvents:false}});
    expect(request.body).not.toContain('super-secret');
  });

  it('waits for the QR image instead of treating its textual code as base64',async()=>{
    const fetchImpl=vi.fn()
      .mockResolvedValueOnce(provider({code:'raw-qr-payload'}))
      .mockResolvedValueOnce(provider({qrcode:{base64:'data:image/png;base64,IMAGE'}}));

    const result=await getEvolutionQr(instance,{fetchImpl,env,qrAttempts:2,qrDelayMs:0});

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(evolutionQr({code:'raw-qr-payload'})).toBeNull();
    expect(evolutionQr(result)).toBe('data:image/png;base64,IMAGE');
  });
});
