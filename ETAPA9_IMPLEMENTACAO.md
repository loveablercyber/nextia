# Etapa 9 — Plano de implementação

## Princípios

- Evoluir `projects`, `milestones`, `files`, `change_requests`, autenticação, notificações, outbox e layouts existentes.
- Uma migration incremental (`0009`) sem apagar ou inventar dados históricos.
- Autorizar todo recurso no backend; o frontend nunca será a barreira de segurança.
- Não implementar IA nova, WhatsApp, cobrança, recorrência, CRM paralelo ou etapas futuras.

## Ordem de execução

1. Criar o domínio mínimo da Etapa 9: relações ausentes do projeto, tarefas, entregáveis/versões/aprovações, comentários e eventos.
2. Centralizar helpers de autorização e serialização segura para cliente/admin.
3. Evoluir APIs atuais preservando rotas e contratos compatíveis.
4. Tornar progresso derivado de marcos, com atualização transacional e evento auditável.
5. Proteger arquivos por endpoint autorizado e alinhar upload/UI aos limites reais.
6. Criar APIs de tarefas, entregáveis, aprovação/ajuste, solicitações, comentários e timeline.
7. Evoluir dashboard/lista/detalhe do cliente com pendências reais.
8. Evoluir lista, filtros e detalhe administrativo na rota existente `/admin/projetos`.
9. Emitir eventos/outbox e notificações pela camada de servidor nas operações críticas.
10. Implementar testes unitários, integração, IDOR/RBAC/upload e fluxos E2E viáveis na stack.
11. Testar migration em banco descartável/configurado, executar test/lint/typecheck/build e QA de browser.
12. Revisar diff/segredos/escopo e gerar `ETAPA9_FINAL_REPORT.md`.

## Arquivos previstos

- Novo: `database/migrations/0009_project_operations.sql`.
- Novo: módulo de domínio/API da Etapa 9 separado de `app-api.js` apenas se reduzir risco sem duplicar roteamento.
- Alterar: `app-api.js`, tipos/contextos e páginas de projeto/admin existentes.
- Novo: componentes/página de detalhe somente quando necessários às rotas atuais.
- Novo: testes específicos da Etapa 9 e relatório final.

## Gates intermediários

- Após schema/domínio: testes unitários e migration syntax/schema.
- Após APIs: integração, RBAC e IDOR.
- Após frontend: typecheck, lint e testes de componentes.
- Antes de finalizar: suíte completa, build, browser mobile/desktop/console e diff review.
