# Status de desenvolvimento

Atualizado em 2026-10-07.

| Área | Estado | Observação |
|---|---|---|
| Auditoria e desenho | concluído | matriz inicial e contratos definidos |
| Banco do funil | implementado, não aplicado | migration aditiva 0014; sem execução em produção |
| APIs públicas | implementado | sessão, prévia, eventos, preço, contato e rate limit |
| Landing/configurador/prévia | implementado | rota `/crie-seu-site`, responsiva e sem cadastro inicial |
| Integração checkout | implementado | valor e adicionais recalculados no servidor; pedido vinculado |
| Painel administrativo | implementado | campanha, limites, métricas A/B e fila de abandono |
| Testes e gates | aprovado no código | 138 testes, lint do escopo, typecheck e build PASS |
| Deploy | não autorizado | nenhuma publicação será feita |

Pendências reais: aplicar a migration em homologação, executar E2E com PostgreSQL/Mercado Pago e validar visualmente o fluxo completo. A inspeção local por navegador não abriu porque o servidor local não respondeu dentro do prazo; não foi tratada como aprovação.
