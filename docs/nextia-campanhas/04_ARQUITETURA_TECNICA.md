# Arquitetura técnica

O módulo é vertical e isolado:

- frontend: `src/features/acquisition` e página pública carregada sob demanda;
- API: `acquisition-api.js`, registrada antes do fallback `/api/*`;
- persistência: migration `0014_acquisition_funnel.sql`;
- integrações: catálogo comercial, cotação autoritativa, checkout, CRM, outbox e projetos;
- identidade anônima: `session_key` público + `access_token_hash`; o token bruto existe apenas no navegador;
- eventos: append-only e deduplicados por `session_id + event_key` quando aplicável.

Entidades: `acquisition_campaigns`, `acquisition_campaign_variants`, `acquisition_funnel_sessions`, `acquisition_preview_projects`, `acquisition_funnel_events`, `acquisition_pricing_rules`, `acquisition_abandonment_contacts` e `acquisition_provisioning_jobs`.

O servidor é a autoridade para variante, expiração, preço, consentimento, vínculo ao usuário/pedido e estado do provisionamento.
