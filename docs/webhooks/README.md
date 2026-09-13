# Webhooks de saída

Webhooks exigem simultaneamente: ação aprovada, `automation.external_actions_enabled=true`, host HTTPS na lista `webhooks.allowed_hosts` e `NEXTIA_WEBHOOK_SECRET` configurado.

O pedido inclui timestamp, chave de idempotência e assinatura HMAC SHA-256. Endereços locais e redes privadas são bloqueados. Respostas transitórias são repetidas com backoff; esgotadas as tentativas, o evento segue para dead-letter.
