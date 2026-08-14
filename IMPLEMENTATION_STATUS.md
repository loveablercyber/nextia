# NEXTIA — Status de Implementação Pós-Auditoria (Fases 0 a 14)

**Data de Início**: 14/08/2026  
**Branch de Implementação**: `feat/pos-auditoria-fases-0-14`  
**Baseline**: Commit `24b9ed9` (main)  
**Ambiente Alvo**: Coolify / Contabo (PostgreSQL local)  

---

## 1. Fase Atual

- **Fase em Execução**: Fase 8 — Backfill de Integridade e Migração Resumível

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
- [x] **Fase 7 Concluída**:
  - Criado endpoint `GET /api/partners/public-stats` em `server.js` calculando estatísticas públicas reais a partir do banco de dados.
  - Atualizado `src/pages/partner/PartnerLandingPage.tsx` para renderizar total de parceiros ativos e comissões de forma dinâmica.

---

## 3. Requisitos Pendentes

- [ ] **Fase 8**: Backfill e integridade (Migração com checkpoint, dry-run, fila de revisão `data_migration_issues`).
- [ ] **Fase 9**: Ferramentas administrativas (Central de serviços contratados, gestor de domínios, fila de integridade).
- [ ] **Fase 10**: QA e Homologação (Testes unitários, integração, E2E com Playwright, build e lint).
- [ ] **Fase 11**: Dual-write e canário interno.
- [ ] **Fase 12**: Liberação gradual em produção.
- [ ] **Fase 13**: Estabilização e observabilidade.
- [ ] **Fase 14**: Retirada controlada do legado.

---

## 4. Arquivos Alterados

- `server.js`
- `src/pages/partner/PartnerLandingPage.tsx`
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

1. **Estatísticas Públicas Autênticas**: `public-stats` agrega `partner_profiles` e `partner_commissions` eliminando números estáticos na landing page.

---

## 9. Próximo Passo Exato

- Executar a **Fase 8 — Backfill de Integridade e Migração Resumível**:
  1. Criar o script de migração resumível de dados legados `scripts/backfill-engagements.js`.
  2. Ler registros legados em `projects`, `commercial_orders`, `commercial_plan_contracts`.
  3. Mapear cada registro para um `service_engagements` correspondente. Registros ambíguos ou incompletos gravam ocorrência em `data_migration_issues` com status `needs_review`.
  4. Suportar `--dry-run` para simulação sem efeitos colaterais.
