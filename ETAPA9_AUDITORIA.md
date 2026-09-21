# Etapa 9 — Auditoria inicial

Data da auditoria: 2026-09-16
Commit auditado: `94550fb` (`main`, sincronizado previamente com `origin/main`)
Escopo: área do cliente, gestão de projetos e evolução SaaS descritos no Prompt Mestre da Etapa 9.

## Resultado executivo

**ETAPA 9 — NÃO CONCLUÍDA.**

A aplicação possui uma base aproveitável: autenticação e RBAC existentes, clientes com múltiplos `service_engagements`, projetos vinculados a engajamentos/pedidos, marcos, briefing, arquivos no Cloudinary, solicitações, notificações e painel administrativo básico. Essa base não satisfaz, por si só, a Etapa 9.

As principais lacunas são tarefas com visibilidade, entregáveis e aprovação auditável, comentários contextuais, timeline segura, painel de pendências real, detalhe administrativo consolidado, download autorizado de arquivos e testes específicos de integração/E2E/IDOR. O progresso atual pode ser alterado manualmente e não é derivado dos marcos.

## Evidências auditadas

- Banco e bootstrap de schema: `app-api.js`, migrations `0000` a `0008` e SQLs de `database/`.
- API do cliente/admin: rotas `/api/app/*` e `/api/admin/app/*` em `app-api.js`.
- Autenticação/sessão: sessão única existente em `server.js`; guards de rota em `src/components/auth/ProtectedRoute.tsx`.
- Frontend do cliente: `src/pages/dashboard/*`, `ProjectContext`, `ServiceEngagementContext`.
- Frontend administrativo: `AdminProjectsPage`, `AdminRequestsPage`, `AdminContext`.
- Storage: upload Cloudinary autenticado em `/api/app/project/file`.
- Testes: oito arquivos, 50 testes; nenhum cobre especificamente o domínio da Etapa 9.
- Git: árvore limpa no início da auditoria; não havia diff ou arquivo órfão da tentativa anterior.

## Matriz resumida de divergências

| ID | Requisito | Estado inicial | Evidência / divergência |
|---|---|---|---|
| E9-R001 | Reutilizar autenticação e RBAC existentes | PASS | Sessão única e guards client/admin já existem. |
| E9-R002 | Cliente listar 1..N serviços/projetos próprios | PARTIAL | `service_engagements` suporta N serviços, mas o dashboard consolidado não lista projetos e pendências completas. |
| E9-R003 | Projeto central ligado a cliente, pedido, proposta, serviço, plano, briefing e responsável | PARTIAL | Cliente/engagement/order/contract/service/workflow/briefing existem; proposta e responsável não estão relacionados ao projeto. |
| E9-R004 | Criação manual/autônoma preservando relações comerciais | PARTIAL | Webhook e admin criam projeto; criação admin perde proposta/pedido e não é idempotente por origem. |
| E9-R005 | Impedir projetos duplicados | PASS | Índices únicos por `engagement_id`, `source_order_id` e `source_contract_id`; webhook transacional/idempotente. |
| E9-R006 | Status coerente e progresso verificável | FAIL | `progress_percent` é editável manualmente; não deriva de marcos válidos. |
| E9-R007 | Etapas/marcos adequados ao serviço | PARTIAL | Existem marcos, mas o admin cria sempre o mesmo conjunto para site/e-commerce. |
| E9-R008 | Tarefas de projeto | MISSING | Não há entidade/API/UI de tarefas. |
| E9-R009 | Diferenciar tarefa interna e ação do cliente | MISSING | Não há tarefas nem regra de visibilidade. |
| E9-R010 | Visibilidade interno/cliente/ambos no backend | MISSING | Recursos atuais não têm política geral de visibilidade. |
| E9-R011 | Arquivos por projeto com metadados | PARTIAL | Metadados principais existem; falta visibilidade e endpoint seguro de acesso. |
| E9-R012 | Upload seguro | PARTIAL | Allowlist e limite de 20 MB existem; UI anuncia SVG/ZIP/50 MB incorretamente e não há validação de assinatura do conteúdo. |
| E9-R013 | Download/visualização autorizados e sem URL privada permanente | FAIL | Cliente recebe `secure_url/url` e usa link direto; não há endpoint de autorização/download. |
| E9-R014 | Entregáveis versionados | MISSING | Não há entidade/API/UI de entregáveis. |
| E9-R015 | Aprovação auditável de entregável | MISSING | `approval_requests` da Etapa 8 é de automação e não equivale a aprovação de entrega. |
| E9-R016 | Solicitar ajuste sobre entrega | MISSING | Solicitação genérica existe, mas não referencia entrega/versão. |
| E9-R017 | Solicitações contextuais do cliente | PARTIAL | `change_requests` existe e é escopado pelo projeto; não cobre resposta/ação solicitada e apresenta cota mensal não comprovada. |
| E9-R018 | Comentários contextuais autorizados | MISSING | Não há comentários de projeto/entrega. |
| E9-R019 | Histórico/timeline consolidado e seguro | MISSING | Não há eventos de domínio visíveis do projeto. |
| E9-R020 | Reutilizar eventos/automações da Etapa 8 | PARTIAL | Outbox e engine existem; eventos específicos da Etapa 9 ainda não são emitidos consistentemente. |
| E9-R021 | Reutilizar notificações centrais | PARTIAL | Sistema é reutilizado, mas notificações são disparadas pelo frontend e podem ser omitidas/duplicadas. |
| E9-R022 | Admin listar projetos e filtrar | PARTIAL | Lista existe; faltam cliente/responsável/próxima etapa/pendência/última atualização e filtros mínimos. |
| E9-R023 | Detalhe admin consolidado do projeto | MISSING | A tela atual é lista/edição simples, sem detalhe operacional único. |
| E9-R024 | Cliente abrir projeto e operar entregas/aprovações/histórico | PARTIAL | Abre projeto, marcos, arquivos e solicitações; faltam tarefas, entregas, aprovações, comentários e timeline. |
| E9-R025 | Dashboard de pendências reais | FAIL | Banner deriva apenas do status do projeto e inclui revisão sem entregável real. |
| E9-R026 | Reaproveitar briefing e dados conhecidos | PASS | Briefing existente é vinculado a engagement/projeto e não foi duplicado. |
| E9-R027 | Autserviço sem alterar dados internos/comerciais | PARTIAL | Ações atuais são limitadas, mas faltam as ações obrigatórias de aprovação/comentário. |
| E9-R028 | Isolamento horizontal em todos os recursos | NOT TESTED | Queries principais filtram `user_id`, mas não há testes IDOR de projeto/arquivo/entrega/tarefa/solicitação. |
| E9-R029 | Admin/client RBAC no backend | PARTIAL | Admin gate e escopo por cliente existem; faltam helpers por recurso e cobertura. |
| E9-R030 | Migrations incrementais, seguras e testadas | NOT TESTED | Migrations anteriores são incrementais; ainda não há migration da Etapa 9 nem teste em banco descartável. |
| E9-R031 | UX responsiva, acessível e com loading/empty/error | PARTIAL | Há responsividade/loading/empty em telas atuais; erros de upload/solicitação podem ficar apenas no console/Promise. |
| E9-R032 | Auditoria de alterações e concorrência | MISSING | Falta histórico de domínio e controle de versão para atualizações críticas. |
| E9-R033 | Testes unitários da Etapa 9 | MISSING | Os 50 testes existentes são de outras áreas. |
| E9-R034 | Testes de integração da Etapa 9 | MISSING | Não existem. |
| E9-R035 | E2E cliente/admin da Etapa 9 | MISSING | Não existe framework/cenário E2E do fluxo. |
| E9-R036 | Segurança IDOR/RBAC/upload | MISSING | Não há suíte específica. |
| E9-R037 | Typecheck, lint e build | PASS | `npm run lint` e `npm run build` passaram; build inclui `tsc -b`. |
| E9-R038 | Testes existentes sem regressão | PASS | `npm run test`: 8 arquivos, 50/50 testes passaram. |
| E9-R039 | Mobile/desktop/console QA | NOT TESTED | Ainda não executado no fluxo final da Etapa 9. |
| E9-R040 | Sem funcionalidades fora do escopo | PASS | Tentativa anterior fora do contexto foi removvida; árvore estava limpa antes desta documentação. |

## Problemas específicos confirmados

1. `AdminProjectsPage` permite editar percentuais arbitrariamente, contrariando o progresso verificável.
2. O arquivo privado é exposto por URL direta no objeto carregado e na âncora de download.
3. A UI aceita `multiple`, mas processa apenas o primeiro arquivo.
4. A UI anuncia SVG, ZIP e 50 MB; a API recusa esses MIME types e limita 20 MB.
5. O upload guarda `scan_status='pending'`, mas disponibiliza o arquivo sem um fluxo de liberação/scan comprovado.
6. `ChangeRequestsPage` promete renovação mensal automática da cota sem rotina comprovada.
7. Notificações de projeto são criadas pelo browser após a operação principal, sem atomicidade.
8. A API admin de progresso/status não verifica existência nem conflito de versão e sempre responde sucesso.
9. O painel admin não oferece detalhe consolidado nem filtros mandatórios.
10. Não há tarefas, entregáveis, aprovações de entrega, comentários ou eventos/timeline de projeto.

## Duplicações, órfãos e fora de escopo

- Nenhum arquivo órfão da tentativa incorreta permaneceu: `src/hooks/useProjectSync.ts` e o relatório inválido foram removidos antes desta auditoria.
- Não foi encontrada duplicação de autenticação, storage, CRM, pagamento, notificações ou motor de automação.
- `approval_requests` deve permanecer reservado ao fluxo de automações da Etapa 8; reutilizá-lo como aceite de entregável misturaria domínios.
- Não será implementado IA, WhatsApp, cobrança avançada, recorrência ou qualquer item das Etapas 10–12.

## Baseline técnico

- Git: limpo em `94550fb` no início.
- Testes: PASS — 8 arquivos, 50 testes.
- Lint: PASS — zero erro.
- Typecheck: PASS — `tsc -b` dentro do build.
- Build: PASS — 1.955 módulos; apenas aviso legado de chunk acima de 500 kB.
- Migration real/test DB: NOT TESTED nesta fase; precisa de banco PostgreSQL descartável/configurado.
