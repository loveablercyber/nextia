# Eventos operacionais

A Etapa 8 reutiliza `public.outbox_events`. O produtor grava a mudança de negócio e o evento na mesma transação sempre que o fluxo já é transacional. O worker reivindica lotes com `FOR UPDATE SKIP LOCKED`, aplica idempotência e move falhas esgotadas para `dead_letter`.

Eventos canônicos atualmente publicados: `lead.created`, `lead.updated`, `lead.assigned`, `lead.qualified`, `opportunity.created`, `opportunity.stage_changed`, `deal.won`, `deal.lost`, `activity.created`, `activity.completed`, `proposal.created`, `proposal.sent`, `proposal.accepted`, `payment.confirmed` e `engagement.activated`.

Todo evento possui `idempotency_key` e `correlation_id`. Payloads não devem conter credenciais e devem carregar apenas IDs e fatos necessários ao consumidor.

## Contrato mínimo e compatibilidade

Novos consumidores devem aceitar o envelope persistido: `event_type`, `aggregate_type`, `aggregate_id`, `payload`, `idempotency_key`, `correlation_id`, `created_at`. O `payload` contém apenas fatos específicos do evento e IDs de relacionamento; não substitui a entidade transacional.

Os nomes seguem `substantivo.ação` em inglês e no passado quando representam fato (`lead.created`, `deal.won`, `project.completed`, `subscription.renewed`). Aliases legados não devem ser renomeados ou removidos em massa. Quando o payload precisar mudar de forma incompatível, o produtor deve emitir versão explícita no payload ou novo tipo de evento e manter a transição documentada.

Dimensões analíticas (`source`, `city`, `segment`, `service`, `content`) devem ser copiadas somente quando já existem na fonte e precisam preservar o relacionamento com o registro original. Ausência de dimensão permanece `null`; nunca inferir ou inventar.
