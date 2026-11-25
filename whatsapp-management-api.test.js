// @vitest-environment node
import { describe,expect,it } from 'vitest';
import { importRow,parseCsv,publicEvolutionWebhook,publicInstance } from './whatsapp-management-api.js';

describe('WhatsApp contact CSV import',()=>{
  it('parses quoted values and semicolon separated Brazilian exports',()=>{
    const parsed=parseCsv('nome;telefone;empresa\r\n"Ana Silva";"(14) 99640-5496";"ACME; Brasil"');
    expect(parsed.headers).toEqual(['nome','telefone','empresa']);
    expect(parsed.rows[0].data).toEqual({nome:'Ana Silva',telefone:'(14) 99640-5496',empresa:'ACME; Brasil'});
  });

  it('normalizes mapped fields and rejects invalid phone or email',()=>{
    const valid=importRow({rowNumber:2,data:{nome:'Ana',celular:'(14) 99640-5496',email:'ANA@EXAMPLE.COM',tags:'cliente|vip'}},{name:'nome',phone:'celular',email:'email',tags:'tags'});
    expect(valid).toMatchObject({valid:true,normalized:{name:'Ana',phone:'5514996405496',email:'ana@example.com',tags:['cliente','vip']}});
    const invalid=importRow({rowNumber:3,data:{nome:'Bia',celular:'123',email:'invalido'}},{name:'nome',phone:'celular',email:'email'});
    expect(invalid.valid).toBe(false);
    expect(invalid.error).toMatch(/Telefone inválido/);
  });

  it('rejects unclosed quotes and oversized imports',()=>{
    expect(()=>parseCsv('nome;telefone\n"Ana;5514996405496')).toThrow(/aspas não encerradas/i);
    const large=['nome;telefone',...Array.from({length:5001},(_,i)=>`Pessoa ${i};5514996405496`)].join('\n');
    expect(()=>parseCsv(large)).toThrow(/5.000 contatos/i);
  });
});

describe('WhatsApp instance QR serialization',()=>{
  it('keeps a pending QR visible while Evolution reports connecting',()=>{
    const instance=publicInstance({connection_status:'connecting',qr_code_data:'data:image/png;base64,QR'});
    expect(instance.qr_code_data).toBe('data:image/png;base64,QR');
  });

  it('does not expose a stale QR after the instance connects',()=>{
    const instance=publicInstance({connection_status:'connected',qr_code_data:'data:image/png;base64,STALE'});
    expect(instance.qr_code_data).toBeNull();
  });
});

describe('Evolution webhook serialization',()=>{
  it('reports signed configuration without exposing the secret header',()=>{
    const provider=publicEvolutionWebhook({enabled:true,url:'https://nextia.dev.br/api/webhooks/evolution',headers:{'x-webhook-secret':'secret-value'}});
    expect(provider).toMatchObject({enabled:true,headersConfigured:true});
    expect(provider).not.toHaveProperty('headers');
    expect(JSON.stringify(provider)).not.toContain('secret-value');
  });
});


describe('forwardSupportTicketToWhatsApp', () => {
  it('forwards support ticket to connected admin WhatsApp instance', async () => {
    const { forwardSupportTicketToWhatsApp } = await import('./whatsapp-management-api.js');
    const sentCalls = [];
    const client = {
      async query() {
        return {
          rows: [{
            id: 'inst-1',
            instance_name: 'nextia',
            enabled: true,
            connection_status: 'connected',
            phone_number_masked: '+55 (11) 99999-8888',
            configuration: {},
          }],
        };
      },
    };
    const result = await forwardSupportTicketToWhatsApp(
      client,
      {
        ticketId: 't-123',
        name: 'Maria',
        email: 'maria@exemplo.com',
        phone: '11988887777',
        subject: 'Dúvida no painel',
        message: 'Preciso de ajuda com acesso.',
        trackingLink: 'https://nextia.app/suporte/ticket/t-123?token=abc',
      },
      async (instance, payload) => {
        sentCalls.push({ instanceId: instance.id, ...payload });
        return { data: { ok: true } };
      },
    );
    expect(result).toEqual({ sent: true, instanceId: 'inst-1', phone: '5511999998888' });
    expect(sentCalls).toHaveLength(1);
    expect(sentCalls[0].number).toBe('5511999998888');
    expect(sentCalls[0].text).toContain('*Novo chamado de suporte*');
    expect(sentCalls[0].text).toContain('Maria');
    expect(sentCalls[0].text).toContain('Dúvida no painel');
  });

  it('returns not sent when no connected WhatsApp instance exists', async () => {
    const { forwardSupportTicketToWhatsApp } = await import('./whatsapp-management-api.js');
    const client = { async query() { return { rows: [] }; } };
    const result = await forwardSupportTicketToWhatsApp(client, { name: 'João', email: 'j@e.com', subject: 'Teste', message: 'Oi' });
    expect(result).toEqual({ sent: false, reason: 'no_connected_instance' });
  });
});
