# Runbook de automações

1. Confirme no painel que `automation.enabled` está ligado.
2. Verifique a fila e a dead-letter em **Admin > Automações > Execuções e erros**.
3. Abra o erro e use reprocessamento somente depois de corrigir a causa. A idempotência impede repetir efeitos já concluídos.
4. Em incidente amplo, desligue o motor. Para incidentes de terceiros, desligue apenas ações externas ou IA.
5. Para operação sem worker residente, invoque `POST /api/internal/automation/process` com `x-automation-secret`; nunca exponha esse segredo no frontend.
6. Monitore crescimento da fila, taxa de falhas, latência e tentativas. Eventos mortos não são descartados automaticamente.

Rollback: pause a automação afetada ou use o kill switch; não apague histórico. A migration é aditiva e não remove tabelas existentes.
