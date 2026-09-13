# Auditoria inicial — Automação e IA

Data da auditoria: 2026-09-13

## 1. Arquitetura atual

- Frontend React 19 + TypeScript + Vite.
- Backend HTTP em Node.js, sem framework, centralizado em `server.js` e módulos de API.
- PostgreSQL acessado diretamente com `pg`; não existe ORM.
- Autenticação por sessão persistida e cookies; rotas administrativas validam `role = admin` no backend.
- Migrations SQL incrementais executadas por `scripts/migrate.js` com checksum e advisory lock.

## 2. Inventário obrigatório

| Item | Estado encontrado | Decisão |
|---|---|---|
| Event bus/outbox | Existe: `public.outbox_events` | Reutilizar e ampliar |
| Webhooks | Existe para Mercado Pago | Reutilizar e emitir eventos canônicos |
| Queue | Existe parcialmente como outbox PostgreSQL | Adaptar; não adicionar Redis/BullMQ |
| Worker | Não existe em produção | Implementar sobre PostgreSQL |
| Cron/scheduler | Não existe | Implementar scheduler conservador no mesmo worker |
| Notificações | Existe: `public.notifications` e APIs | Reutilizar |
| E-mail | Não existe serviço funcional | Não simular; manter capacidade desativada |
| WhatsApp/Evolution | Não existe integração backend funcional | Não duplicar nem simular; preparar adaptador desativado |
| Audit log | Existe: `public.audit_log` | Reutilizar |
| Analytics operacional | Não existe para automações | Implementar agregações reais das execuções |
| IA/LLM | Não existe | Implementar abstração central e desativável |
| Prompt service | Não existe | Implementar prompts versionados no banco |
| Storage | Cloudinary já utilizado | Sem alteração nesta etapa |
| Knowledge base/RAG | Não existe necessidade comprovada | Não implementar RAG |
| Projetos | Existe: `public.projects`, `milestones` e `service_engagements` | Reutilizar |
| Tarefas | Existe parcialmente como `milestones` e atividades CRM | Reutilizar, sem criar segundo gestor de projetos |
| Suporte | Existe: `public.support_tickets` | Reutilizar para triagem assistida |
| Briefing | Existe: `public.briefing_submissions` | Reutilizar |
| Pagamentos | Mercado Pago, invoices, transactions e webhook idempotente | Reutilizar |
| n8n | Não encontrado | Não introduzir |

## 3. Eventos existentes

O CRM já grava eventos em `public.outbox_events`, mas usa nomes parcialmente divergentes (`crm.lead.created`, `crm.opportunity.created`, entre outros). O webhook de pagamento grava `engagement.activated`. A Etapa 8 deverá padronizar novos eventos canônicos sem perder compatibilidade e consumir aliases legados durante a transição.

## 4. Implementação anterior da Etapa 8

A implementação local anterior foi reprovada porque:

- criou a fila paralela `automation_event_log` apesar de `outbox_events` já existir;
- contém migration PostgreSQL inválida;
- contém TypeScript que não compila;
- não é importada pelo backend;
- declara integrações de pagamento, e-mail, WhatsApp e IA que são apenas logs/placeholders;
- não implementa transação correta para `FOR UPDATE SKIP LOCKED`;
- não implementa idempotência, retry, dead-letter ou execução auditável;
- substituiu variáveis essenciais em `.env.example`;
- adicionou demonstrações e documentos que afirmam conclusão sem evidência.

## 5. Riscos

1. Eventos duplicados de webhook poderiam causar efeitos repetidos sem chave por automação.
2. Locks fora de transação permitiriam dois workers processarem o mesmo evento.
3. Payloads e respostas de IA poderiam expor PII ou segredos em logs.
4. Ações externas sem feature flag, kill switch, timeout e aprovação poderiam causar prejuízo.
5. Alterações diretas no banco sem reutilizar regras atuais poderiam quebrar CRM, preço, pagamento e projetos.
6. O backend monolítico exige integração pequena e modular para reduzir regressões.

## 6. Lacunas e plano incremental

1. Evoluir `outbox_events` com disponibilidade, lock, correlação e dead-letter.
2. Criar automações versionadas, execuções, ações, aprovações, configurações e registros de IA.
3. Implementar engine e worker idempotentes com backoff limitado.
4. Reutilizar operações reais: atividades CRM, atribuição, notificações, briefings, projetos/marcos e suporte.
5. Implementar IA como adaptador central, com provider configurável, schema validado, sanitização e degradação segura.
6. Criar APIs administrativas com RBAC, dry-run, retry, pause/activate e kill switches.
7. Criar painéis administrativos responsivos para automações, execuções, IA e aprovações.
8. Integrar eventos canônicos nos pontos transacionais existentes.
9. Cobrir condições, ações, idempotência, retry, aprovação, sanitização e fallback com testes.
10. Validar migration, lint, typecheck, testes e build antes de qualquer push.

## 7. Decisões técnicas

- **Fila:** PostgreSQL/outbox existente, evitando dependência nova.
- **Worker:** módulo Node independente e acionável pelo servidor ou por endpoint interno autenticado.
- **IA:** provider HTTP compatível configurado por ambiente; operação essencial nunca depende de IA.
- **WhatsApp/e-mail:** somente adaptadores com configuração explícita; nenhuma mensagem externa automática por padrão.
- **Projetos/tarefas:** `projects`, `service_engagements`, `milestones` e `crm_activities` continuam sendo fontes oficiais.
- **Segurança:** admin configura; aprovação é verificada novamente no backend; logs armazenam metadados sanitizados.

## 8. Auditoria final requisito por requisito

| Requisito | Estado | Evidência |
|---|---|---|
| Auditoria e reutilização | PASS | Este documento e inventário das migrations/APIs existentes |
| Event bus/outbox único | PASS | `outbox_events` evoluída pela migration 0008; implementação paralela removida |
| Eventos CRM e pagamento | PASS | produtores canônicos em `crm-api.js`, `app-api.js` e `server.js` |
| Worker concorrente | PASS | claim transacional com `FOR UPDATE SKIP LOCKED`, recuperação de lock e lote limitado |
| Engine trigger/condição/ação | PASS | `AutomationEngine`, condições AND/OR e catálogo restrito de ações |
| Agendamento e execução manual | PASS | scheduler persistente por `next_trigger_at` e evento manual enfileirado |
| Versões e histórico | PASS | `automation_versions`, versão registrada por execução e snapshots históricos |
| Runs e action runs | PASS | tabelas e APIs de lista/detalhe/retry |
| Idempotência | PASS | chaves únicas no evento, execução, ação e efeitos internos; testes unitários |
| Retry e dead-letter | PASS | backoff 30s/2m/10m/30m/1h, limite e reprocessar/descartar |
| IA centralizada | PASS | `AIService`; frontend não possui credencial nem chama provider |
| Providers/modelos/fallback | PASS | registros centrais, prioridades e fallback apenas para falhas transitórias |
| Prompts/structured output | PASS | cinco prompts iniciais versionados e schemas validados |
| AI runs/custo/latência | PASS | `ai_runs` e dashboard administrativo |
| Human-in-the-loop | PASS | aprovação, edição limitada ao mesmo tipo de ação, rejeição e execução assíncrona |
| Distribuição de leads | PASS | atribuição simples ao admin com menor carteira aberta + primeira atividade |
| Follow-up | PASS | proposta enviada gera atividade futura, sem mensagem automática |
| Briefing/projeto/tarefas | PASS | reutiliza projeto criado pelo pagamento, pré-preenche briefing e usa milestones existentes |
| Notificações | PASS | reutiliza `notifications`; preferências por canal preparadas com defaults conservadores |
| WhatsApp e e-mail | BLOCKED | não há provider/backend real no projeto; flags permanecem desligadas e nenhuma integração foi simulada |
| Webhook de saída | PASS | HTTPS/allowlist, HMAC, timestamp, idempotência, timeout, rate limit, retry e aprovação |
| RBAC/auditoria | PASS | todas as APIs administrativas revalidam sessão admin e registram `audit_log` |
| LGPD/logs/segredos | PASS | contexto mínimo, hash de entrada, sanitização e credenciais somente por variável de ambiente |
| Feature flags/kill switch | PASS | motor, IA, ações externas, WhatsApp e e-mail controláveis separadamente |
| Painel desktop/mobile | PARTIAL | quatro rotas responsivas cobrem operação crítica e criação básica; edição visual avançada permanece pela API |
| Documentação/runbook | PASS | `docs/automations`, `docs/ai`, `docs/events` e `docs/webhooks` |
| Testes automatizados | PASS | 50 testes, incluindo condições, sanitização, dry-run, retry, dead-letter e schema de IA |
| Integração/E2E com PostgreSQL real | BLOCKED | banco configurado não resolveu DNS; não foi possível provar os fluxos completos em banco sem arriscar o ambiente remoto |
| Typecheck | PASS | `npx tsc -b --pretty false` |
| Lint | PASS | `npm run lint`, zero erros e zero avisos |
| Build de produção | PASS | typecheck isolado + `npx vite build`; 1.955 módulos transformados |
| Migration em banco real | BLOCKED | `DATABASE_URL` configurada não resolveu DNS durante a auditoria; nenhuma alteração remota foi forçada |

## 9. Arquivos fora do escopo e regressões corrigidas

- Removidos demos, simulações e relatórios que declaravam a Etapa 8 concluída sem integração real.
- Removida a fila duplicada `automation_event_log` e substituída pela outbox já oficial.
- Restaurados `node_modules`, `dist`, manifests e `.env.example` alterados indevidamente; somente variáveis seguras da Etapa 8 foram acrescentadas depois.
- Corrigido hook condicional real em `TemplateDemoPage`, dependências de effects, imports/catches sem uso e política de lint incompatível com o legado.
- O build não deixa artefatos gerados no diff.

## 10. Riscos e débitos remanescentes

1. A migration precisa ser executada e validada no PostgreSQL do ambiente quando o DNS estiver disponível.
2. E-mail e WhatsApp exigem escolha e credenciais de providers reais; ativá-los sem isso contrariaria a regra de não simular integrações.
3. Métricas de negócio e avaliações com leads históricos dependem de volume real e dataset anonimizado; não foram inventados dados de avaliação.
4. O bundle principal já possuía aviso de tamanho; as páginas da Etapa 8 usam lazy loading e não aumentaram esse acoplamento.

## 11. Conclusão da auditoria

O código está limpo em testes, typecheck, lint e build. A implementação não deve ser enviada ou publicada ainda: os itens `PARTIAL`/`BLOCKED` acima impedem declarar a Etapa 8 integralmente validada no ambiente real, e o prompt exige autorização explícita antes de push.
