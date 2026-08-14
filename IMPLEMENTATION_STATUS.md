# NEXTIA — Status de Implementação Pós-Auditoria (Fases 0 a 14)

**Data de Início**: 14/08/2026  
**Branch de Implementação**: `feat/pos-auditoria-fases-0-14`  
**Baseline**: Commit `24b9ed9` (main)  
**Ambiente Alvo**: Coolify / Contabo (PostgreSQL local)  

---

## 1. Fase Atual

- **Fase em Execução**: Fase 7 — Consistência Comercial de Parceiros

---

## 2. Requisitos Concluídos

- [x] Auditado repositório atual e baseline inicial.
- [x] Leitura integral de `PLANO_IMPLEMENTACAO_COMPLETA_POS_AUDITORIA.md`, `RELATORIO_AUDITORIA_2026-08-04.md` e `NEXTIA_RULES.md`.
- [x] Criada branch dedicada `feat/pos-auditoria-fases-0-14`.
- [x] **Fase 0 Concluída**:
  - `AppErrorBoundary` global e rotas autenticadas.
  - `useOptionalProject()` prevenindo crash em `/perfil`.
  - Sanitização de `POST /api/auth/register`.
  - Migração `0000_phase0_fixes.sql`.
- [x] **Fase 1 Concluída**:
  - Migração `0001_initial_core_schema.sql` (schema de fundação completo).
  - Runner `scripts/migrate.js` com advisory lock e SHA-256.
- [x] **Fase 2 Concluída**:
  - Cálculo comercial autoritativo `calculateCommercialSelection`.
  - `POST /api/commerce/preview` (gera `quoteId`, R$ 50,00 autoritativos para registro de domínio).
  - Catalog endpoints e `commercial_order_items` discriminados.
  - Webhook com `service_engagements` e `service_domains`.
- [x] **Fase 3 Concluída**:
  - `GET /api/app/engagements` e `ServiceEngagementContext.tsx`.
  - Seletor de serviço no topo do `DashboardLayout.tsx`.
- [x] **Fase 4 Concluída**:
  - Workflows adaptativos de briefing e acompanhamento.
- [x] **Fase 5 Concluída**:
  - Upload real de arquivos com validação de 20MB, Cloudinary upload e `FileReader`.
- [x] **Fase 6 Concluída**:
  - Implementados 3 modelos e demonstrações interativas de e-commerce distintas (`loja-moda-premium`, `loja-gourmet`, `loja-tech-store`) em `src/pages/TemplateDemoPage.tsx`.
  - Adicionado fallback 404 explícito para modelos não encontrados no catálogo.

---

## 3. Requisitos Pendentes

- [ ] **Fase 7**: Parceiros e consistência comercial (Remoção de estatísticas públicas estáticas e sincronia com o catálogo oficial).
- [ ] **Fase 8**: Backfill e integridade (Migração com checkpoint, dry-run, fila de revisão `data_migration_issues`).
- [ ] **Fase 9**: Ferramentas administrativas (Central de serviços contratados, gestor de domínios, fila de integridade).
- [ ] **Fase 10**: QA e Homologação (Testes unitários, integração, E2E com Playwright, build e lint).
- [ ] **Fase 11**: Dual-write e canário interno.
- [ ] **Fase 12**: Liberação gradual em produção.
- [ ] **Fase 13**: Estabilização e observabilidade.
- [ ] **Fase 14**: Retirada controlada do legado.

---

## 4. Arquivos Alterados

- `src/pages/TemplateDemoPage.tsx`
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

1. **Catálogo de Demos Reais**: `TemplateDemoPage.tsx` carrega especificações visuais e produtos distintos por nicho sem fallback silencioso para evitar ambiguidade de escolha.

---

## 9. Próximo Passo Exato

- Executar a **Fase 7 — Consistência Comercial de Parceiros**:
  1. Revisar as páginas de parceiros `src/pages/partner/Partner*` e endpoints em `partner-api.js` / `server.js`.
  2. Sincronizar com os planos autoritativos do catálogo oficial (`commercial_plans`, `commercial_services`).
  3. Remover estatísticas estáticas simuladas ou torná-las dinâmicas a partir de agregações do banco de dados.
