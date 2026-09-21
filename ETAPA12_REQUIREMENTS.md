# Etapa 12 — Matriz de requisitos

Os IDs agrupam requisitos correlatos do prompt sem ampliar o escopo. `PASS` exige implementação, integração, teste, medição aplicável e evidência.

| ID | Requisito | Status | Arquivos | Implementação | Teste | Resultado | Evidência |
|---|---|---|---|---|---|---|---|
| E12-R001 | Escopo fechado, consolidação, não recriar Etapas 1–11 nem inventar Etapa 13 | PASS | auditoria/diff | limite registrado | revisão estática | PASS | nenhuma função E12 criada antes da auditoria |
| E12-R002 | Reuse first para service/cache/worker/fila/dashboard/dados/API/infra | PASS | `ETAPA12_AUDITORIA.md` | inventário existente | revisão do repo | PASS | fontes oficiais listadas |
| E12-R003 | Fase Zero, auditoria geral/performance, relatório, matriz e continuidade | PASS | docs E12, estado | auditoria concluída | evidências locais | PASS | baseline e matriz criados antes de código E12 |
| E12-R004 | Escala regional configurável sem aplicações por cidade | PASS | `cities.ts` | status operacional/editorial e serviços habilitados por cidade | teste regional | PASS | aplicação única e duas cidades ativas |
| E12-R005 | Cidade/região como dado/contexto, não multi-tenancy | PASS | `cities.ts`, rotas locais | contexto regional no mesmo catálogo/aplicação | teste regional | PASS | nenhum tenant ou app duplicado |
| E12-R006 | Não gerar SEO em massa; respeitar gates da Etapa 11 | PASS | gerador/manifesto | somente cidade ativa, validada e serviço habilitado | manifesto + auditor SEO | PASS | 74 indexáveis; 0 links quebrados |
| E12-R007 | Processo controlado cadastrar→disponibilidade→serviços→conteúdo→preço→teste→ativar | PASS | `cities.ts`, gerador | gate explícito operacional/editorial/serviço; preço segue catálogo único | teste regional | PASS | cidade incompleta não é publicada |
| E12-R008 | Flags proporcionais por cidade/região/serviço/produto, reutilizando mecanismo | PASS | `cities.ts` | flags de status e allowlist de serviços | teste regional | PASS | sem framework novo |
| E12-R009 | Não duplicar catálogo/preços por cidade | PASS | catálogo/cidades | catálogo único preservado | revisão estática | PASS | sem cópia regional do catálogo |
| E12-R010 | Métricas regionais com dados existentes | PASS | `crm-api.js`, dashboard CRM | leads/conversão por cidade, segmento e serviço | typecheck/build | PASS | cálculo derivado de `crm_leads` |
| E12-R011 | Não criar multi-tenancy sem necessidade | PASS | arquitetura | operação única mantida | revisão | PASS | ausência de tenant |
| E12-R012 | Medir performance antes de alterar e registrar problema/evidência/resultado | PASS | auditoria | baseline inicial registrado | build/HTTP local | PASS | métricas antes documentadas |
| E12-R013 | Frontend: bundle, splitting, lazy, requests, render e áreas pública/autenticada | PASS | `App.tsx` | rotas públicas secundárias e áreas autenticadas em chunks lazy | build antes/depois | PASS | principal 1.557,33→476,80 kB (-69,4%) |
| E12-R014 | Imagens: compressão, dimensões, formatos e lazy quando aplicável | PARTIAL | assets/componentes | imagem PNG de 1,60 MB comprovadamente órfã/não empacotada; páginas de catálogo usam lazy/dimensões, demos legadas não são uniformes | inventário/build | PARTIAL | não apagar ativo legado sem autorização |
| E12-R015 | Cache frontend existente sem dados sensíveis | PASS | `sw.js`, server | cache público e exclusões privadas | revisão | PASS | prefixes privados não cacheados |
| E12-R016 | Backend: latência, serialização, payloads, loops, síncrono e conexões | PARTIAL | server/APIs | duração global e limites adicionados; conexão por request preservada sem benchmark DB seguro | benchmark local | PARTIAL | mudança de pool exige evidência em staging |
| E12-R017 | Query audit com EXPLAIN/ANALYZE seguro | BLOCKED | SQL/PostgreSQL | não executado | DB descartável necessário | BLOCKED | banco seguro ausente |
| E12-R018 | Índices somente com query/benefício e custo justificados | BLOCKED | migrations | índices existentes auditados | EXPLAIN necessário | BLOCKED | não criar preventivamente |
| E12-R019 | Corrigir N+1 somente quando comprovado | BLOCKED | APIs | candidatos mapeados | dados/EXPLAIN | BLOCKED | sem dataset real |
| E12-R020 | Paginação/limites seguros para listas, uploads, exports, queries e filtros | PASS | CRM/app APIs, páginas admin | paginação 50/max 100 e JSON 1 MB; upload isolado 28 MB/arquivo 20 MB | lint/typecheck/build | PASS | listas ilimitadas identificadas foram limitadas |
| E12-R021 | Cache backend somente com benefício e invalidação definida | PASS | arquitetura | nenhum cache/Redis novo | revisão | PASS | sem necessidade comprovada |
| E12-R022 | Reutilizar fila/jobs Etapa 8; tarefas longas assíncronas se justificadas | PASS | automation/outbox | uma fila PostgreSQL | testes existentes | PASS | retry/dead-letter/locks cobertos |
| E12-R023 | Concorrência e idempotência em pagamentos, webhooks, projetos e automações | BLOCKED | módulos/migrations | proteções locais existem | sandbox/concorrência real | BLOCKED | ambiente externo ausente |
| E12-R024 | Rate limiting em auth, forms, APIs públicas/webhooks/endpoints caros | PARTIAL | guards/auth/app/CS | um limitador compartilhado cobre auth, lead público e mutações CS; memória é por processo | teste unitário + 429 local | PARTIAL | limite distribuído requer infraestrutura comprovada |
| E12-R025 | Storage/permissões/órfãos/retenção/CDN existente; não apagar automaticamente | BLOCKED | Cloudinary/backups/files | controles e limites preservados; nenhum órfão apagado | integração storage | BLOCKED | credenciais/storage descartável ausentes |
| E12-R026 | Dependências externas com timeout e retry idempotente; circuit breaker só se provado | PARTIAL | server/app-api/automation | fetches externos críticos têm timeout; SDK Cloudinary permanece dependente do próprio transporte | teste unitário | PARTIAL | integração externa indisponível |
| E12-R027 | Logs estruturados sem segredos e correlation/request ID ponta a ponta | PARTIAL | server/guards | request ID e duração estruturados; token de reset removido; logs legados internos ainda heterogêneos | teste guard + HTTP local | PARTIAL | correlação de integrações exige ambiente |
| E12-R028 | Error tracking existente, métricas, alertas acionáveis e health/readiness seguros | PARTIAL | server/admin/runbook | liveness/readiness reais, painel operacional e alertas acionáveis documentados | HTTP local | PARTIAL | plataforma externa de alertas/tracking não identificada |
| E12-R029 | Fonte única, taxonomia de eventos e contratos/versionamento compatíveis | PASS | outbox/docs | envelope, versão e compatibilidade documentados sobre outbox existente | revisão | PASS | sem renomeação ou barramento paralelo |
| E12-R030 | Consolidar analytics de aquisição→retenção sem sistema paralelo | PARTIAL | CRM/outbox/dashboards | dimensões regionais consolidadas no CRM; jornada total depende de integração real | testes locais | PARTIAL | E2E externo bloqueado |
| E12-R031 | Fórmulas documentadas; não inventar KPI/LTV/CAC/ROI/forecast | PASS | runbook | fórmulas e fontes de leads, conversão, receita, MRR, churn, upsell, latência, webhook e fila | revisão | PASS | LTV/CAC/ROI/forecast explicitamente não inventados |
| E12-R032 | Visão executiva mínima e filtros período/cidade/serviço/origem/segmento | PARTIAL | admin/CRM APIs | período e recortes por cidade/segmento/serviço/origem existem; filtros combinados não foram ampliados sem validação DB | typecheck/build | PARTIAL | BI paralelo não criado |
| E12-R033 | LGPD, minimização, finalidade, acesso, retenção e anonimização | PARTIAL | runbook/backend | minimização/logs/RBAC e política operacional documentados | revisão | PARTIAL | retenção/anonimização depende de regra legal aprovada |
| E12-R034 | Auditar backup; distinguir DR; restore seguro; plano proporcional | BLOCKED | backup/docs | implementação existe | restore real | BLOCKED | sem PostgreSQL/storage descartável |
| E12-R035 | CI/CD com build/test/lint/typecheck; deploy repetível e rollback | PASS | workflow/scripts/runbook | CI com npm ci, lint, serial tests, SEO, typecheck e build; rollback documentado | revisão local | PASS | deploy não automatizado nesta sessão |
| E12-R036 | Migrations ordenadas/não destrutivas; ambientes, config e secrets separados | PARTIAL | migrations/env/deploy | segredo agora obrigatório em produção e verificação exige DB; DDL duplicado legado permanece | checks locais | PARTIAL | staging/migration real bloqueados |
| E12-R037 | Feature flags e experimentos proporcionais sem quebrar SEO | PASS | cidades/gerador | gate regional proporcional reaproveita configuração e manifesto | testes regional/SEO | PASS | sem framework de experimentos novo |
| E12-R038 | Ciclo medir→priorizar→alterar→testar→remedir; custos e IA sem inventar | PASS | auditoria/relatório/runbook | baseline, priorização, correção e nova medição registrados | antes/depois | PASS | custos externos declarados indisponíveis |
| E12-R039 | Admin operacional mínimo para saúde/jobs/webhooks/erros/fila | PASS | endpoint/página admin | DB, fila, dead-letter, webhooks e processo em visão protegida | lint/typecheck/build | PASS | sem dados sensíveis |
| E12-R040 | Segurança: auth/RBAC/RLS/IDOR/rate/secrets/headers/uploads/webhooks | PARTIAL | backend/migrations | segredo, auth rate, logs, body e timeouts corrigidos; RBAC/RLS real exige DB | testes locais | PARTIAL | validação externa bloqueada |
| E12-R041 | Load/stress proporcional, seguro e plausível | PASS | `scripts/load-test-local.js` | harness recusa host externo; carga local executada | 100 requests | PASS | 0 erros; métricas no relatório |
| E12-R042 | Concorrência e webhooks duplicado/fora de ordem/atrasado/falha | BLOCKED | pagamentos/outbox | unitário parcial | sandbox real | BLOCKED | credenciais/DB ausentes |
| E12-R043 | Testes regional e SEO: ativa/nova/desativada/serviço indisponível | PASS | config/SEO/teste | ativação e indisponibilidade cobertas; manifesto limitado | testes automatizados | PASS | suíte regional e SEO verde |
| E12-R044 | Analytics, métricas, permissões e paginação testados | BLOCKED | APIs/testes | testes unitários e estáticos passam; integração real exige DB e sessões | integração | BLOCKED | PostgreSQL descartável ausente |
| E12-R045 | Typecheck, lint, build, unit e integração | PASS | scripts/testes | gates locais finais executados | 104 testes + lint/typecheck/build | PASS | 15 arquivos de teste verdes |
| E12-R046 | E2E das jornadas críticas quando ambiente permitir | BLOCKED | aplicação completa | não executado | staging/browser | BLOCKED | DB/sessões/browser ausentes |
| E12-R047 | Regressão Etapas 1–11 e jornada SEO→retenção com contexto preservado | BLOCKED | módulos anteriores | suíte local passa | E2E representativo | BLOCKED | ambiente integrado ausente |
| E12-R048 | Auditoria git/diff, justificar arquivos, órfãos e busca de marcadores/segredos | PASS | git/docs | diff/status/marcadores/segredos revisados; artefatos de build restaurados antes do commit | diff final | PASS | mudanças E9–E12 rastreadas |
| E12-R049 | Auditar dependências; sem upgrade geral | PASS | package files | nenhuma dependência E12 adicionada | diff | PASS | inventário atual somente |
| E12-R050 | Relatório final, auditoria requisito a requisito e zero erros introduzidos | PASS | `ETAPA12_FINAL_REPORT.md` | relatório e gates locais consolidados | auditoria final | PASS | nenhum erro local introduzido |
| E12-R051 | Separar erro legado de erro E12 e corrigir legado apenas se bloqueante | PASS | auditoria | divergências classificadas como preexistentes | revisão | PASS | nenhuma correção infinita iniciada |
| E12-R052 | Gate de fases e ordem preferencial com atualização contínua | PASS | matriz/estado | Fase Zero antecedeu código; lotes P0→regional→gates registrados | auditoria | PASS | ordem preservada |
| E12-R053 | Não push/deploy automático; pré/pós-deploy somente com autorização | PASS | git/estado | push explicitamente autorizado em 2026-09-21; deploy não autorizado | histórico/status | PASS | sem publicação de ambiente |
| E12-R054 | Auditoria final da Etapa 12 e do roadmap; só concluir com zero obrigatório pendente | BLOCKED | relatório final | auditoria final concluída, mas evidências externas continuam bloqueadas | auditoria final | BLOCKED | Etapa 12 não declarada concluída |

## Ordem técnica autorizável após a Fase Zero

1. P0 segurança/observabilidade: secret obrigatório em produção, auth rate limit, remover token de log, timeout externo, health/readiness real e request/correlation ID.
2. P0 performance frontend: lazy loading por família de rota; medir bundle antes/depois.
3. P0 limites: paginação compatível nas listas ilimitadas e limites JSON por endpoint.
4. Configuração regional mínima, reutilizando dados/catálogo/SEO existentes e com gate explícito.
5. Contratos de eventos, fórmulas e visão operacional mínima somente sobre dados reais.
6. Testes locais, carga proporcional e gates; validações DB/browser/externas permanecem bloqueadas até ambiente seguro.
