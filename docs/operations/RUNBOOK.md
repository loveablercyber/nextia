# Operação, métricas, deploy e recuperação

## Saúde e alertas

- `GET /health`: liveness do processo; não consulta dependências.
- `GET /healthz` e `GET /api/health`: readiness; retornam `503` quando PostgreSQL não está configurado ou indisponível.
- `/admin` exibe uma visão restrita de banco, fila, dead-letter e webhooks falhos nas últimas 24 horas.
- Alertas acionáveis: readiness `503`, dead-letter maior que zero, webhook falho em 24 horas, build/deploy falho. Não alertar por métricas sem ação definida.
- Logs HTTP são JSON e incluem `timestamp`, `level`, `service`, `event`, `request_id`, `method`, `path`, `duration_ms` e `status`. Senhas, tokens, cookies, cartões e payloads completos não devem ser registrados.

## Definições de métricas

| Métrica | Fórmula/fonte |
|---|---|
| Leads criados | `COUNT(crm_leads.id)` no período, excluindo arquivados quando a visão for carteira ativa |
| Conversão lead→ganho | oportunidades `won` ligadas a lead ÷ leads elegíveis no mesmo recorte; o período deve ser declarado |
| Receita confirmada | soma de `payment_transactions.amount_cents` somente com status confirmado e moeda BRL |
| MRR | soma de `monthly_amount_cents` de contratos `active`, ciclo mensal e moeda BRL |
| Churn | cancelamentos efetivos no período ÷ contratos ativos no início do período; solicitação não é cancelamento efetivo |
| Upsell | oportunidades ganhas originadas de `expansion_suggestions`, rastreadas pelo relacionamento persistido |
| Latência HTTP | `duration_ms` dos logs de requests concluídos, sem excluir casos lentos |
| Falha de webhook | eventos em `provider_webhook_events.status='failed'` no período |
| Profundidade da fila | eventos `pending`, `retry` ou `processing` em `outbox_events` |

Não calcular LTV, CAC, ROI ou forecast sem fonte, janela e fórmula aprovadas. Dados transacionais continuam sendo a fonte da verdade; dashboards são derivados.

## Deploy

1. Confirmar branch/commit e revisar `git diff`.
2. Executar `npm ci`, lint, testes, auditor SEO e build (o CI replica esses gates).
3. Confirmar `JWT_SECRET`/`SESSION_SECRET`, `DATABASE_URL`, configurações externas e backup recente quando houver migration.
4. Executar migrations uma única vez pelo runner com advisory lock e checksum.
5. Executar `npm run verify:deploy` com banco do ambiente explicitamente configurado.
6. Publicar pelo mecanismo atual e rodar smoke tests. Nenhum deploy é autorizado por este documento.

## Rollback

- Aplicação: republicar a imagem/commit anterior conhecido; não apagar o commit com falha.
- Configuração: restaurar o valor anterior no gerenciador de secrets, nunca no repositório.
- Migration: preferir correção forward. Reversão destrutiva exige backup verificado, janela aprovada e script específico revisado.
- Validar depois do rollback: liveness, readiness, login, landing, formulário, CRM, checkout, painel cliente e admin.

## Backup, restore e disaster recovery

Backup não é disaster recovery. A central existente cria/exporta e registra backups, mas só pode ser considerada garantia após restore em ambiente descartável.

Procedimento seguro de teste:

1. criar PostgreSQL e storage descartáveis;
2. registrar responsável, backup escolhido e horário;
3. restaurar sem apontar DNS/tráfego de produção;
4. executar migrations/checksum e consultas de contagem/integridade;
5. executar smoke tests representativos;
6. registrar duração real (RTO observado) e ponto recuperado (RPO observado);
7. destruir o ambiente descartável somente após guardar a evidência aprovada.

Falha de banco: bloquear deploy, manter liveness, readiness `503`, acionar responsável e restaurar conforme evidência. Falha de storage: bloquear uploads/backups, preservar registros e não remover órfãos automaticamente. Falha de gateway: manter eventos idempotentes/retry apropriado e nunca repetir cobrança não idempotente.

RPO/RTO alvo não é definido aqui porque não existe decisão operacional fornecida; inventar números contrariaria o escopo.

## Retenção e LGPD

- Preservar histórico financeiro/auditoria conforme regra oficial; não apagar automaticamente.
- Tokens de reset expiram e nunca aparecem em logs.
- Logs guardam identificadores mínimos; payloads e PII completos não entram no log HTTP.
- Arquivos órfãos são apenas candidatos até comprovação de ausência de referência no banco e aprovação de remoção.
- Exportações e dados analíticos mantêm RBAC e finalidade do dado original.
