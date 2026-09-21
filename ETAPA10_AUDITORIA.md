# Etapa 10 — Auditoria inicial

Data: 2026-09-16
Escopo: recorrência, upsell, retenção e pós-venda.
Estado auditado: branch `main`, com alterações locais da Etapa 9 ainda não commitadas.

## Resumo executivo

A Etapa 10 não estava implementada como domínio completo. Há estruturas anteriores que devem ser reutilizadas:

- `commercial_plan_contracts` é a única entidade existente que representa assinatura;
- Mercado Pago é o gateway financeiro oficial;
- `provider_webhook_events` e `outbox_events` fornecem idempotência e integração assíncrona;
- `payment_transactions`, `invoices`, `commercial_orders` e `service_engagements` representam pagamentos e serviços;
- CRM, propostas, checkout, Automation Engine, notificações e painel do cliente já existem.

As lacunas obrigatórias são: modelo de ciclo da assinatura, histórico imutável, renovação e falha recorrente, cancelamento rastreável, reativação segura, pós-venda, sinais objetivos de retenção, sugestões de expansão sem duplicidade, visão 360, APIs com ownership/RBAC e telas integradas.

## Matriz da auditoria

| Componente | Status | Localização | Fonte da verdade | Reutilizável? | Alteração necessária? | Risco | Ação |
|---|---|---|---|---|---|---|---|
| Clientes | EXISTE E FUNCIONA | `profiles`, `crm_leads` | `profiles.id` para clientes autenticados | Sim | Derivar estado ativo/inativo/ex-cliente sem novo cadastro | Médio | Reutilizar |
| Catálogo/planos/add-ons/preços | EXISTE E FUNCIONA | `commercial_services`, `commercial_plans`, `commercial_addons` | Banco/catálogo backend | Sim | Apenas consultar; nunca confiar em preço do frontend | Baixo | Reutilizar |
| Pedidos | EXISTE E FUNCIONA | `commercial_orders`, `commercial_order_items` | Banco | Sim | Relacionar ao ciclo sem duplicar | Baixo | Reutilizar |
| Pagamentos/faturas | EXISTE PARCIALMENTE | `invoices`, `payment_transactions`, `payments` legado | Gateway + `payment_transactions` | Sim | Registrar pagamentos recorrentes e falhas | Alto | Adaptar |
| Assinaturas | EXISTE PARCIALMENTE | `commercial_plan_contracts` | Contrato interno sincronizado pelo gateway | Sim | Completar período, datas, ciclo, versão, cancelamento e histórico | Alto | Evoluir, sem tabela paralela |
| Schema de assinaturas | EXISTE MAS POSSUI BUG | `database/commercial-catalog.sql` | Schema runtime | Parcial | Tornar evolução incremental parte das migrations | Alto | Migration 0010 |
| Gateway | EXISTE E FUNCIONA PARCIALMENTE | Mercado Pago em `server.js` | API/webhook Mercado Pago | Sim | Mapear renovação/falha/cancelamento e confirmar dados no provider | Alto | Adaptar |
| Webhook | EXISTE MAS POSSUI BUG | `/api/commerce/webhook` | Evento validado + consulta ao gateway | Sim | Evento de assinatura retorna sem marcar webhook processado; falha não é reprocessável; recorrência é ignorada | Crítico | Corrigir |
| Idempotência | EXISTE PARCIALMENTE | `provider_webhook_events`, índices únicos, outbox | IDs do provider | Sim | Permitir retry seguro de evento falho e deduplicar efeitos comerciais | Alto | Evoluir |
| Histórico de assinatura | NÃO EXISTE | — | — | Não | Criar `subscription_events` | Alto | Criar |
| Cancelamento/reativação | NÃO EXISTE | Apenas PATCH administrativo de status | — | Não | Processo rastreável sem dark pattern nem alteração financeira pelo cliente | Alto | Criar/integrar |
| Pós-venda | EXISTE PARCIALMENTE | CRM activities, project events, support | Eventos existentes | Sim | Consolidar timeline e feedback simples | Médio | Evoluir |
| Retenção | NÃO EXISTE | — | Regras objetivas | Não | Sinais explicáveis, auditáveis e sem decisão automática | Médio | Criar camada mínima |
| Customer health | NÃO EXISTE | — | — | Não necessário | Não criar score fictício; expor somente sinais e motivos | Baixo | Não implementar score |
| Upsell/cross-sell | NÃO EXISTE | CRM aceita oportunidades | Catálogo + serviços/assinaturas + CRM | Sim | Sugestões configuráveis, humanas e deduplicadas | Alto | Criar sugestão; converter no CRM existente |
| CRM/propostas/checkout | EXISTE E FUNCIONA | `crm_*`, `/api/crm`, checkout comercial | CRM existente | Sim | Converter sugestão em oportunidade existente | Médio | Integrar |
| Automation Engine | EXISTE E FUNCIONA | `automation-*`, migration 0008 | Outbox + engine | Sim | Emitir eventos e seeds de automações internas de baixo risco | Médio | Reutilizar |
| WhatsApp/e-mail | EXISTE DESATIVADO POR PADRÃO | settings da automação | Preferências/settings | Sim | Não criar provider nem disparo agressivo | Baixo | Manter |
| Preferências | EXISTE | `notification_preferences` | Banco | Sim | Respeitar na automação | Médio | Reutilizar |
| Painel do cliente | EXISTE PARCIALMENTE | `/painel/pedidos`, serviços e pagamentos | APIs autenticadas | Sim | Adicionar visão de assinaturas e solicitação clara de cancelamento | Médio | Evoluir sem duplicar design |
| Painel admin | EXISTE PARCIALMENTE | Pedidos, clientes, CRM | APIs admin | Sim | Visão de recorrência, risco e expansão | Médio | Evoluir |
| Analytics | EXISTE PARCIALMENTE | eventos/outbox e dashboards | Dados reais | Sim | MRR somente de assinaturas ativas; não criar ARR/LTV/CAC/ROI/churn sem série confiável | Médio | Implementar apenas MRR suportado |
| Segurança | EXISTE PARCIALMENTE | sessões, admin guard, ownership em APIs | Backend | Sim | Cobrir IDOR de assinatura, eventos, cancelamento e expansão | Alto | Testar/corrigir |
| Observabilidade | EXISTE PARCIALMENTE | logs, webhook status, automação | Backend | Sim | Registrar incidentes e eventos críticos | Médio | Evoluir |
| Testes | EXISTE, sem Etapa 10 | Vitest | suíte local | Sim | Criar unitários, integração simulada, RBAC/IDOR e migration contract | Alto | Ampliar |

## Problemas concretos encontrados

1. `commercial_plan_contracts` é criada em `database/commercial-catalog.sql`, fora da sequência versionada de migrations.
2. O status atual é insuficiente e mistura ativação, autorização e estado financeiro.
3. O webhook de `subscription_preapproval` não finaliza `provider_webhook_events` como processado antes de retornar.
4. Um evento previamente marcado `failed` não pode ser tentado novamente porque o conflito único retorna `already_processed`.
5. Pagamentos mensais com referência `contract:*:subscription` não atualizam período, fatura, transação ou histórico.
6. Não há histórico imutável das mudanças de assinatura.
7. O admin pode editar status financeiro manualmente e excluir contratos/pedidos, contrariando gateway como fonte e preservação de histórico.
8. O painel mostra assinatura, mas não exibe ciclo, próxima cobrança ou histórico real.
9. Não há processo formal de cancelamento, motivo estruturado ou reativação.
10. Não há sinais de retenção nem sugestões de expansão deduplicadas.
11. Não há visão 360 pós-venda conectando serviços, assinatura, pagamentos, suporte e CRM.

## Baseline verificada

- Testes: PASS — 9 arquivos, 64 testes.
- Lint: execução inicial expirou sem diagnóstico; deve ser repetida no gate final.
- Build/typecheck: já havia passado na auditoria final da Etapa 9; será repetido após a Etapa 10.
- Banco real: não validado nesta fase; `DATABASE_URL` não foi usado por não estar comprovado como banco descartável.
- Gateway real: não exercitado nesta fase; credenciais/test-mode e payloads reais não foram disponibilizados para teste destrutivo seguro.

## Fora do escopo registrado

- SEO, conteúdo, campanhas, data warehouse, multi-região e modelos preditivos.
- Novo gateway, novo CRM, novo checkout, novo provider de e-mail/WhatsApp ou nova capacidade de IA.
- ARR, LTV, CAC, ROI e probabilidade de churn sem dados confiáveis.
- Cobrança automática inventada, proration próprio ou alteração direta de preço pelo cliente.
