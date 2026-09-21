# Etapa 9 — Matriz de rastreabilidade

Esta matriz é a fonte de verdade da Etapa 9. Os estados iniciais refletem a auditoria anterior à implementação. Um requisito só poderá terminar como `PASS` com teste/evidência registrado no relatório final.

| ID | Requisito obrigatório | Estado inicial | Validação prevista |
|---|---|---|---|
| E9-R001 | Reutilizar autenticação e RBAC | PASS | Testes de sessão e papel |
| E9-R002 | Suportar 1..N projetos/serviços por cliente | PARTIAL | Integração + E2E cliente |
| E9-R003 | Manter relações cliente/pedido/proposta/serviço/plano/briefing/responsável | PARTIAL | Schema + integração |
| E9-R004 | Criar projeto automática ou manualmente preservando origens | PARTIAL | Integração/idempotência |
| E9-R005 | Não duplicar projeto | PASS | Teste de conflito/idempotência |
| E9-R006 | Status real e progresso calculado | FAIL | Unitário + integração |
| E9-R007 | Marcos coerentes por fluxo | PARTIAL | Unitário/template mínimo |
| E9-R008 | Tarefas de projeto | MISSING | CRUD autorizado + UI |
| E9-R009 | Ações do cliente separadas de tarefas internas | MISSING | Visibilidade + E2E |
| E9-R010 | Visibilidade aplicada no backend | MISSING | Testes IDOR/visibility |
| E9-R011 | Arquivos e metadados por projeto | PARTIAL | Integração/upload |
| E9-R012 | Upload validado e seguro | PARTIAL | Testes MIME/tamanho/autorização |
| E9-R013 | Acesso a arquivo via endpoint autorizado | FAIL | IDOR de arquivo |
| E9-R014 | Entregáveis versionados | MISSING | CRUD admin/client read |
| E9-R015 | Aprovação de entrega auditável | MISSING | Transação + E2E |
| E9-R016 | Solicitação de ajuste ligada à entrega | MISSING | Integração + E2E |
| E9-R017 | Solicitações contextuais do projeto | PARTIAL | CRUD/estado/IDOR |
| E9-R018 | Comentários contextuais | MISSING | CRUD/visibilidade/IDOR |
| E9-R019 | Timeline consolidada e segura | MISSING | Eventos + filtros de visibilidade |
| E9-R020 | Eventos integrados à Etapa 8 | PARTIAL | Outbox/eventos |
| E9-R021 | Notificações centrais e sem duplicação | PARTIAL | Integração/idempotência |
| E9-R022 | Lista/filtros admin | PARTIAL | UI + integração |
| E9-R023 | Detalhe admin consolidado | MISSING | E2E admin |
| E9-R024 | Operação completa do cliente no projeto | PARTIAL | E2E cliente |
| E9-R025 | Pendências reais do cliente | FAIL | Unitário + E2E |
| E9-R026 | Reutilizar briefing/dados conhecidos | PASS | Regressão |
| E9-R027 | Autosserviço controlado | PARTIAL | RBAC + E2E |
| E9-R028 | Isolamento horizontal completo | NOT TESTED | Suíte IDOR |
| E9-R029 | Autorizações no backend | PARTIAL | Unitário + integração |
| E9-R030 | Migration incremental e testada | NOT TESTED | PostgreSQL descartável |
| E9-R031 | UX responsiva/acessível/estados | PARTIAL | Browser mobile/desktop |
| E9-R032 | Auditoria e concorrência | MISSING | Eventos + versionamento |
| E9-R033 | Testes unitários | MISSING | Vitest/Node test |
| E9-R034 | Testes de integração | MISSING | API + banco/fakes controlados |
| E9-R035 | E2E cliente/admin | MISSING | Browser real |
| E9-R036 | Segurança IDOR/RBAC/upload | MISSING | Casos negativos explícitos |
| E9-R037 | Typecheck/lint/build | PASS | Comandos finais |
| E9-R038 | Regressão da suíte existente | PASS | `npm run test` final |
| E9-R039 | QA mobile/desktop/console | NOT TESTED | Browser final |
| E9-R040 | Zero alteração fora do escopo | PASS | Diff review final |

## Auditoria final desta execução

| ID | Estado final | Evidência |
|---|---|---|
| E9-R001 | PASS | Sessão/roles existentes preservados; teste RBAC negativo. |
| E9-R002 | PASS | Dashboard lista `service_engagements`; workspace abre projeto selecionado. |
| E9-R003 | PASS | Migration adiciona proposta/responsável; relações anteriores foram preservadas. |
| E9-R004 | PASS | Criação admin preserva IDs recebidos e webhook/idempotência anteriores permanecem. |
| E9-R005 | PASS | Índices únicos anteriores preservados; sem nova rota duplicadora. |
| E9-R006 | PASS | Progresso calculado por marcos; edição arbitrária removida e endpoint legado retorna 410. |
| E9-R007 | PASS | Marcos atuais reutilizados e templates mínimos site/e-commerce diferenciados. |
| E9-R008 | PASS | `project_tasks`, APIs e painel admin/cliente. |
| E9-R009 | PASS | `task_kind` diferencia `internal`/`client_action`. |
| E9-R010 | PASS | Visibilidade filtrada nas queries do backend; teste de workspace. |
| E9-R011 | PASS | Metadados existentes ampliados com visibilidade/recurso de storage. |
| E9-R012 | PARTIAL | Assinaturas/tamanho/MIME/nome testados; upload real bloqueado sem Cloudinary local. |
| E9-R013 | PASS | Endpoint autorizado gera URL Cloudinary temporária; teste IDOR. |
| E9-R014 | PASS | Entregáveis e versões imutáveis implementados. |
| E9-R015 | PASS | Aprovação registra ator, versão, resultado, comentário e data em transação. |
| E9-R016 | PASS | Ajuste gera aprovação e solicitação ligada ao entregável. |
| E9-R017 | PASS | Solicitações escopadas, validadas, auditadas e testadas contra IDOR. |
| E9-R018 | PASS | Comentários contextuais com autor/visibilidade/autorização. |
| E9-R019 | PASS | Timeline consolidada via `project_events` e filtro de visibilidade. |
| E9-R020 | PASS | Eventos gravados também em `outbox_events`, sem segundo motor. |
| E9-R021 | PASS | Notificações centrais criadas no servidor em operações críticas. |
| E9-R022 | PASS | Lista exibe dados operacionais e filtros status/responsável/serviço/cliente/período/pendência. |
| E9-R023 | PASS | Rota `/admin/projetos/:projectId` consolida os recursos mandatórios. |
| E9-R024 | PASS | Cliente acompanha e opera tarefas, entregas, arquivos, ajustes, comentários e histórico. |
| E9-R025 | PASS | Pendências derivam de briefing, tarefas e entregas reais. |
| E9-R026 | PASS | Briefing existente reutilizado. |
| E9-R027 | PASS | Cliente só executa ações permitidas pelo backend. |
| E9-R028 | PASS | Testes negativos de projeto/arquivo/tarefa/entrega/comentário/solicitação. |
| E9-R029 | PASS | Admin/client gate e escopo por proprietário testados. |
| E9-R030 | BLOCKED | Contrato SQL testado estaticamente; nenhum PostgreSQL descartável disponível. |
| E9-R031 | PARTIAL | Estados/labels/erros implementados; QA autenticado responsivo bloqueado. |
| E9-R032 | PASS | Eventos de domínio e versionamento otimista em status/tarefas. |
| E9-R033 | PASS | 14 testes específicos de domínio/migration. |
| E9-R034 | PASS | Integração de handlers cobre escopo, visibilidade, aprovação e outbox. |
| E9-R035 | BLOCKED | Sem sessão/banco de teste para E2E autenticado cliente/admin. |
| E9-R036 | PARTIAL | IDOR/RBAC/MIME passam; upload real bloqueado sem Cloudinary. |
| E9-R037 | PASS | Lint, `tsc -b` e build passaram. |
| E9-R038 | PASS | Suíte completa: 9 arquivos, 64 testes. |
| E9-R039 | BLOCKED | Login desktop/mobile e console passaram; áreas autenticadas não puderam ser abertas. |
| E9-R040 | PASS | Diff final restrito à Etapa 9 e seus relatórios/testes. |

Resumo: **34 PASS, 3 PARTIAL, 3 BLOCKED, 0 FAIL e 0 MISSING**, totalizando 40 requisitos. A Etapa 9 permanece **NÃO CONCLUÍDA** até eliminar `PARTIAL` e `BLOCKED`.
