# NEXTIA — Status de Implementação Pós-Auditoria (Fases 0 a 14)

**Data de Início**: 14/08/2026  
**Branch de Implementação**: `feat/pos-auditoria-fases-0-14`  
**Baseline**: Commit `24b9ed9` (main)  
**Ambiente Alvo**: Coolify / Contabo (PostgreSQL local)  

---

## 1. Fase Atual

- **Fase em Execução**: Fase 9 — Ferramentas Administrativas e Observabilidade de Domínio

---

## 2. Requisitos Concluídos

- [x] Auditado repositório atual e baseline inicial.
- [x] Leitura integral de `PLANO_IMPLEMENTACAO_COMPLETA_POS_AUDITORIA.md`, `RELATORIO_AUDITORIA_2026-08-04.md` e `NEXTIA_RULES.md`.
- [x] Criada branch dedicada `feat/pos-auditoria-fases-0-14`.
- [x] **Fase 0 Concluída**: `AppErrorBoundary`, `useOptionalProject()`, sanitização de cadastro, migração 0000.
- [x] **Fase 1 Concluída**: Migração versionada 0001 e runner `scripts/migrate.js`.
- [x] **Fase 2 Concluída**: Cálculo autoritativo, preview `quoteId`, taxa R$ 50 para registro de domínio.
- [x] **Fase 3 Concluída**: Multi-serviços, `ServiceEngagementContext`, seletor no header.
- [x] **Fase 4 Concluída**: Workflows dinâmicos por categoria de serviço.
- [x] **Fase 5 Concluída**: Upload real de arquivos (20MB max), Cloudinary fallback, `FileReader`.
- [x] **Fase 6 Concluída**: 3 demonstrações de e-commerce distintas (`loja-moda-premium`, `loja-gourmet`, `loja-tech-store`) e 404 fallback.
- [x] **Fase 7 Concluída**: Endpoint `/api/partners/public-stats` dinâmico e estatísticas reais na landing page de parceiros.
- [x] **Fase 8 Concluída**:
  - Criado o script resumível de migração e alinhamento `scripts/backfill-engagements.js` com suporte a `--dry-run` e `--limit`.
  - Mapeamento de registros legados para `service_engagements` (estados `exact`, `inferred`) e registro de pendências em `data_migration_issues` (estado `needs_review`).
  - Adicionado o script `"db:backfill": "node scripts/backfill-engagements.js"` em `package.json`.

---

## 3. Requisitos Pendentes

- [ ] **Fase 9**: Ferramentas administrativas (Central de serviços contratados, gestor de domínios, fila de integridade).
- [ ] **Fase 10**: QA e Homologação (Testes unitários, integração, E2E com Playwright, build e lint).
- [ ] **Fase 11**: Dual-write e canário interno.
- [ ] **Fase 12**: Liberação gradual em produção.
- [ ] **Fase 13**: Estabilização e observabilidade.
- [ ] **Fase 14**: Retirada controlada do legado.

---

## 4. Arquivos Alterados

- `scripts/backfill-engagements.js` (novo)
- `package.json`
- `IMPLEMENTATION_STATUS.md`

---

## 5. Migrações Executadas

- `database/migrations/0000_phase0_fixes.sql`
- `database/migrations/0001_initial_core_schema.sql`

---

## 6. Testes Executados e Resultados

- `npx tsc --noEmit`: Aprovado (0 erros)

---

## 7. Erros Encontrados e Resolvidos

- Nenhum.

---

## 8. Decisões Arquiteturais

1. **Migração Idempotente de Histórico**: O script de backfill consulta registros não vinculados e grava evidências em `data_migration_issues` quando encontrar inconformidades sem forçar falha no banco de produção.

---

## 9. Próximo Passo Exato

- Executar a **Fase 9 — Ferramentas Administrativas e Observabilidade de Domínio**:
  1. Adicionar endpoints administrativos em `server.js` / `app-api.js`:
     - `GET /api/admin/engagements`: Lista central de todos os serviços contratados.
     - `GET /api/admin/domains`: Gestor unificado de registros e apontamentos de domínios.
     - `GET /api/admin/migration-issues`: Fila de revisão de divergências de dados.
     - `PATCH /api/admin/migration-issues/:id`: Resolução de divergência com nota técnica.
  2. Adicionar páginas/views no painel administrativo.
