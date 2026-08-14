# NEXTIA — Status de Implementação Pós-Auditoria (Fases 0 a 14)

**Data de Início**: 14/08/2026  
**Branch de Implementação**: `feat/pos-auditoria-fases-0-14`  
**Baseline**: Commit `24b9ed9` (main)  
**Ambiente Alvo**: Coolify / Contabo (PostgreSQL local)  

---

## 1. Fase Atual

- **Fase em Execução**: Fase 1 — Fundação de Dados

---

## 2. Requisitos Concluídos

- [x] Auditado repositório atual e baseline inicial.
- [x] Leitura integral de `PLANO_IMPLEMENTACAO_COMPLETA_POS_AUDITORIA.md`, `RELATORIO_AUDITORIA_2026-08-04.md` e `NEXTIA_RULES.md`.
- [x] Criada branch dedicada `feat/pos-auditoria-fases-0-14`.
- [x] **Fase 0 Concluída**:
  - Implementado `AppErrorBoundary` global em `src/components/common/AppErrorBoundary.tsx` com `errorId` amigável.
  - Envolvida a aplicação principal em `src/App.tsx` com `AppErrorBoundary`.
  - Exportado `useOptionalProject()` em `src/context/ProjectContext.tsx` e atualizado `src/pages/ProfilePage.tsx` para não quebrar `/perfil` se acessado fora de `ProjectProvider`.
  - Sanitizado `POST /api/auth/register` em `server.js` para criar estritamente conta/credenciais sem instanciar projetos, contratos ou aceitar valores monetários do cliente.
  - Criada migração versionada `database/migrations/0000_phase0_fixes.sql` garantindo colunas e índices para `source_order_id` e `source_contract_id`.
  - Validados build e tsc sem erros.

---

## 3. Requisitos Pendentes

- [ ] **Fase 1**: Fundação de dados (Migration versionada 0001 com `service_engagements`, `commercial_order_items`, `service_domains`, `briefing_submissions`, `invoices`, `invoice_items`, `payment_transactions`, `webhook_events`).
- [ ] **Fase 2**: Comércio e domínio (Catálogo único, preview autoritativo, draft anônimo + claim, taxa R$ 50 para registro de domínio).
- [ ] **Fase 3**: Painel multi-serviço (`ServiceEngagementContext`, seletor no topo, rotas por `engagementId`).
- [ ] **Fase 4**: Workflows específicos (Website, E-commerce, Automação, Bot WhatsApp, TechCare, Redes, Câmeras, Backup).
- [ ] **Fase 5**: Upload real de arquivos (Cloudinary/Storage seguro com validação de MIME, cota e checksum).
- [ ] **Fase 6**: Modelos de loja (Demos próprias interativas para `loja-moda-premium`, `loja-gourmet`, `loja-tech-store` com fallback 404 explícito).
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

- `src/components/common/AppErrorBoundary.tsx` (novo)
- `src/App.tsx`
- `src/context/ProjectContext.tsx`
- `src/pages/ProfilePage.tsx`
- `server.js`
- `database/migrations/0000_phase0_fixes.sql` (novo)
- `IMPLEMENTATION_STATUS.md`

---

## 5. Migrações Executadas

- `database/migrations/0000_phase0_fixes.sql`

---

## 6. Testes Executados e Resultados

- `npx tsc --noEmit`: Aprovado (0 erros)
- `npm run build`: Aprovado (1920 módulos transformados)

---

## 7. Erros Encontrados e Resolvidos

- Resolvido crash potencial em `ProfilePage.tsx` via `useOptionalProject()`.
- Criado `AppErrorBoundary` para capturar exceções React sem tela branca.

---

## 8. Decisões Arquiteturais

1. **Phase 0 Contenção**: Sanitização total do cadastro para não criar projetos sem contratação financeira real.
2. **Resiliência do Perfil**: Permite carregar informações do usuário mesmo quando não houver projeto ativo.

---

## 9. Próximo Passo Exato

- Executar a **Fase 1 — Fundação de dados**:
  - Criar `database/migrations/0001_initial_core_schema.sql` contendo o DDL completo para:
    - `service_engagements`
    - `commercial_order_items`
    - `service_domains`
    - `briefing_submissions`
    - `invoices`
    - `invoice_items`
    - `payment_transactions`
    - `webhook_events`
    - `commercial_service_variants`
    - `commercial_addons`
    - `service_engagement_addons`
    - `service_workflow_policies`
    - `commercial_pricing_quotes`
    - `provider_webhook_events`
    - `outbox_events`
    - `data_migration_issues`
    - `schema_migrations` (com controle de checksum e versão)
  - Criar o executor formal de migrações em `scripts/migrate.js` com advisory lock PostgreSQL.
