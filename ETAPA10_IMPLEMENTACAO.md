# Etapa 10 — Plano técnico

## Fonte de verdade

- Assinatura: `commercial_plan_contracts` (mantida e evoluída).
- Estado financeiro: Mercado Pago validado no backend.
- Pagamentos: `payment_transactions` e `invoices`.
- Cliente: `profiles.id`.
- Serviços: `service_engagements` e catálogo comercial.
- Expansão: sugestão da Etapa 10; oportunidade, proposta e checkout permanecem no CRM existente.
- Automação: `outbox_events` + Automation Engine da Etapa 8.

## Alterações autorizadas

1. Migration 0010 incremental para completar contratos e criar histórico, sinais, sugestões, regras e feedback.
2. Serviço backend de customer success com ownership/RBAC, paginação, cancelamento por solicitação e conversão humana em oportunidade.
3. Sincronização de webhooks recorrentes com idempotência e eventos.
4. Painel cliente de assinaturas/pós-venda e painel admin de recorrência/risco/expansão.
5. Eventos internos para follow-up e retenção usando a automação existente.
6. Testes unitários, integração simulada, segurança e contrato da migration.

## Decisões de segurança/comércio

- Cancelamento no painel será uma solicitação rastreada, porque não há política comercial comprovada para cancelamento automático.
- Reativação também será solicitada para validação; nenhum status financeiro será alterado pelo frontend.
- MRR soma apenas contratos `active`, em ciclo mensal e moeda BRL.
- Não haverá proration, ARR, churn, LTV, CAC, ROI ou score de churn.
- Sugestões nunca cobram, ativam ou criam proposta automaticamente.
