# Etapa 10 — Matriz final de requisitos

Estados permitidos: `PENDENTE`, `EM DESENVOLVIMENTO`, `IMPLEMENTADO`, `EM TESTE`, `PASS`, `FAIL`, `BLOCKED`.

| ID | Requisito | Status | Arquivos/evidência | Teste/resultado |
|---|---|---|---|---|
| E10-R001 | Escopo fechado; sem Etapas 11/12 | PASS | `ETAPA10_AUDITORIA.md` | Scope audit PASS |
| E10-R002 | Auditar e reutilizar antes de criar | PASS | Auditoria e plano técnico | Diff audit PASS |
| E10-R003 | Fonte única em `commercial_plan_contracts` | PASS | migration 0010, `customer-success.js` | Migration contract PASS |
| E10-R004 | Gateway como fonte financeira | BLOCKED | Mutação manual removida; sincronização implementada | Falta webhook sandbox real |
| E10-R005 | Modelo completo de ciclo e períodos | PASS | migration 0010 | Contract test PASS |
| E10-R006 | Mapeamento explícito de estados | PASS | `mapProviderSubscriptionStatus` | Unit PASS |
| E10-R007 | Webhook autenticado, consultado e anti-replay | BLOCKED | `server.js`, retry seguro | Falta assinatura/payload sandbox real |
| E10-R008 | Webhook duplicado tem um efeito | PASS | índices/eventos/outbox | Unit/integration simulada PASS |
| E10-R009 | Evento falho aceita retry seguro | PASS | upsert somente para `failed` | Code/security test PASS |
| E10-R010 | Renovação sem duplicar cliente/assinatura | BLOCKED | `syncRecurringPayment` | Unit PASS; gateway real pendente |
| E10-R011 | Renovação registra pagamento/histórico/outbox | PASS | backend transacional | Unit PASS |
| E10-R012 | Falha recorrente atualiza estado e ação | BLOCKED | `past_due`, sinal, outbox | Unit PASS; evento real pendente |
| E10-R013 | Falha não cancela automaticamente | PASS | backend | Unit PASS |
| E10-R014 | Histórico imutável/auditável | PASS | `subscription_events` | Migration/API PASS |
| E10-R015 | Cancelamento rastreia solicitante/motivo/efeito | PASS | API/migration | Integration simulada PASS |
| E10-R016 | Fluxo de cancelamento sem dark pattern | PASS | `CustomerSuccessPage.tsx` | Build/typecheck PASS |
| E10-R017 | Motivos estruturados e “outro” | PASS | backend/UI | Unit PASS |
| E10-R018 | Reativação não duplica assinatura | PASS | solicitação na assinatura existente | Unit/code review PASS |
| E10-R019 | Estado ativo/inativo/ex-cliente por fatos | PASS | consulta agregada + helper | Unit PASS |
| E10-R020 | Histórico do ex-cliente preservado | PASS | sem deletes; APIs históricas | Regression/code audit PASS |
| E10-R021 | Timeline pós-venda consolidada | PASS | overview cliente e visão 360 | API review PASS |
| E10-R022 | Follow-up pós-entrega via Automation Engine | PASS | seed 0010 + `project.completed` | Contract/full suite PASS |
| E10-R023 | Feedback simples e contextual | PASS | `customer_feedback`, UI/API | Build/API review PASS |
| E10-R024 | Retenção objetiva e auditável | PASS | `retention_signals` | Unit/API PASS |
| E10-R025 | Risco cria sinal/tarefa/notificação | PASS | outbox + automação existente | Contract/code review PASS |
| E10-R026 | Sem health score fictício | PASS | nenhum score criado | Scope audit PASS |
| E10-R027 | Expansão apenas sugere | PASS | sugestões não cobram/ativam | Unit/code review PASS |
| E10-R028 | Não sugerir serviço já contratado | PASS | exclusões SQL por serviço/assinatura | Integration review PASS |
| E10-R029 | Não duplicar sugestão/oportunidade | PASS | índices + verificações CRM | Unit/integration PASS |
| E10-R030 | Regras centralizadas/configuráveis | PASS | `expansion_rules` | Migration contract PASS |
| E10-R031 | Estados da sugestão | PASS | migration/API | API review PASS |
| E10-R032 | Dispensa bloqueia recorrência por 90 dias | PASS | `dismissed_until` | API review PASS |
| E10-R033 | Conversão usa CRM/proposta/checkout existentes | PASS | oportunidade no CRM existente | Unit integration PASS |
| E10-R034 | Preço vem do catálogo backend | PASS | join `commercial_services` | Unit contra mass assignment PASS |
| E10-R035 | Add-ons usam catálogo existente | PASS | nenhum catálogo paralelo | Scope audit PASS |
| E10-R036 | Painel cliente autenticado de recorrência | BLOCKED | rota/UI compiladas | Falta credencial para E2E autenticado |
| E10-R037 | Cliente não altera dados financeiros | PASS | somente solicitações; backend bloqueia mutação | Security review PASS |
| E10-R038 | Admin mostra recorrência/risco/MRR real | PASS | `AdminCustomerSuccessPage.tsx` | Build/typecheck PASS |
| E10-R039 | Admin mostra risco/motivo/próxima ação | PASS | admin/API | Build/API review PASS |
| E10-R040 | Admin revisa/dispensa/converte expansão | PASS | admin/API | Unit integration PASS |
| E10-R041 | Visão 360 pós-venda | PASS | endpoint + painel admin | Build/API review PASS |
| E10-R042 | Eventos usam outbox/Automation Engine | PASS | outbox idempotente + seeds | Full suite PASS |
| E10-R043 | Preferências/frequência evitam spam | PASS | automação externa desativada; dedupe | Code audit PASS |
| E10-R044 | Sem novo WhatsApp/e-mail/IA | PASS | nenhuma integração criada | Scope audit PASS |
| E10-R045 | Analytics somente com eventos necessários | PASS | eventos de assinatura/retenção/expansão | Event contract PASS |
| E10-R046 | MRR só de contratos ativos mensais BRL | PASS | helper + SQL | Unit PASS |
| E10-R047 | Sem ARR/LTV/CAC/ROI/churn inventado | PASS | métricas não criadas | Scope audit PASS |
| E10-R048 | Migration incremental executada em banco | BLOCKED | migration 0010 é incremental e sem destruição | PostgreSQL descartável indisponível |
| E10-R049 | Backfill somente de fatos comprováveis | PASS | estado/data existente; sem inferência financeira | Migration contract PASS |
| E10-R050 | Regras críticas no backend | PASS | `customer-success.js` | Code review PASS |
| E10-R051 | RBAC, ownership, validação, auditoria/rate limit | PASS | API backend | Security tests PASS |
| E10-R052 | Cliente A não acessa Cliente B | PASS | filtros por `user_id` | IDOR tests PASS |
| E10-R053 | Minimização e controle LGPD | PASS | respostas limitadas/paginadas | Security review PASS |
| E10-R054 | Paginação e limites | PASS | `page`/`limit`, máximo 100 | API review PASS |
| E10-R055 | Testes do domínio | PASS | `customer-success.test.js` | 15/15 PASS |
| E10-R056 | Regressão autenticada relevante | BLOCKED | suíte local completa verde | Falta credencial cliente/admin para E2E |
| E10-R057 | Build/typecheck/lint | PASS | comandos oficiais | Build PASS; lint PASS |
| E10-R058 | Diff sem arquivo fora do escopo | PASS | artefatos de build restaurados | Diff audit PASS |
| E10-R059 | Relatório final e blockers exatos | PASS | `ETAPA10_FINAL_REPORT.md` | Audit PASS |
| E10-R060 | Sem push sem autorização/gates | PASS | branch local `main` | Nenhum push executado |

## Totais

- Requisitos: 60
- PASS: 53
- BLOCKED: 7
- FAIL: 0
- PENDENTE: 0
