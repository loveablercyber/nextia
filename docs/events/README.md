# Eventos operacionais

A Etapa 8 reutiliza `public.outbox_events`. O produtor grava a mudança de negócio e o evento na mesma transação sempre que o fluxo já é transacional. O worker reivindica lotes com `FOR UPDATE SKIP LOCKED`, aplica idempotência e move falhas esgotadas para `dead_letter`.

Eventos canônicos atualmente publicados: `lead.created`, `lead.updated`, `lead.assigned`, `lead.qualified`, `opportunity.created`, `opportunity.stage_changed`, `deal.won`, `deal.lost`, `activity.created`, `activity.completed`, `proposal.created`, `proposal.sent`, `proposal.accepted`, `payment.confirmed` e `engagement.activated`.

Todo evento possui `idempotency_key` e `correlation_id`. Payloads não devem conter credenciais e devem carregar apenas IDs e fatos necessários ao consumidor.
