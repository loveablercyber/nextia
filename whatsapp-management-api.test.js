// @vitest-environment node
import { describe,expect,it } from 'vitest';
import { importRow,parseCsv } from './whatsapp-management-api.js';

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
