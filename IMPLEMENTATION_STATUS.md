# NEXTIA — Status de Implementação Pós-Auditoria (Fases 0 a 14)

**Data de Início**: 14/08/2026  
**Branch de Implementação**: `feat/pos-auditoria-fases-0-14`  
**Baseline**: Commit `24b9ed9` (main)  
**Ambiente Alvo**: Coolify / Contabo (PostgreSQL local)  

---

## 1. Fase Atual

- **Fase em Execução**: Fase 4 — Workflows Específicos por Categoria de Serviço

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
  - Migração `0001_initial_core_schema.sql` (schema de fundação completo com `service_engagements`, `commercial_order_items`, `service_domains`, etc.).
  - Runner `scripts/migrate.js` com advisory lock (ID 987654321) e verificação SHA-256.
- [x] **Fase 2 Concluída**:
  - Implementada função de cálculo comercial autoritativo `calculateCommercialSelection` em `server.js`.
  - Adicionado `POST /api/commerce/preview` (gera `quoteId` com validade de 30min, taxas discriminadas, incluindo **R$ 50,00 autoritativos** para `domain.mode = 'register'`).
  - Adicionados endpoints de catálogo em `server.js`: `/api/catalog/services`, `/api/catalog/services/:slug`, `/api/catalog/addons`.
  - Atualizado `POST /api/commerce/orders` para consumir `quoteId`, suportar `Idempotency-Key` e gravar itens discriminados em `commercial_order_items`.
  - Atualizado webhook `/api/commerce/webhook` para instanciar `service_engagements` (código público `ENG-XXXXXX`) e `service_domains` com taxa de registro de R$ 50,00 quando aplicável.
- [x] **Fase 3 Concluída**:
  - Criado `GET /api/app/engagements` e `GET /api/app/engagements/:id` em `app-api.js` retornando engajamentos, domínio e projeto vinculados.
  - Criado `src/context/ServiceEngagementContext.tsx` (`ServiceEngagementProvider`, `useServiceEngagements`, `useOptionalServiceEngagements`).
  - Adicionado `ServiceEngagementProvider` em `src/App.tsx`.
  - Adicionado seletor de serviço contratado no topo do `DashboardLayout.tsx` permitindo ao cliente alternar dinamicamente entre múltiplos engajamentos ativos sem selecionar implicitamente `projects[0]`.

---

## 3. Requisitos Pendentes

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

- `app-api.js`
- `src/context/ServiceEngagementContext.tsx` (novo)
- `src/App.tsx`
- `src/components/dashboard/DashboardLayout.tsx`
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

1. **Contexto de Engajamento Autônomo**: `ServiceEngagementContext` gerencia a lista de engajamentos do usuário de forma reativa e fornece seleção explícita para os componentes do dashboard.

---

## 9. Próximo Passo Exato

- Executar a **Fase 4 — Workflows Específicos por Categoria de Serviço**:
  1. Criar componente de briefing dinâmico específico para E-commerce em `src/pages/dashboard/BriefingPage.tsx` (configurações da loja virtual: formas de pagamento Pix/Cartão, integração de frete/Correios, logotipo, banners, redes sociais).
  2. Esconder módulo irrelevante "Tecnologia" ou customizá-lo para exibir apenas se o serviço for desenvolvimento técnico.
  3. Garantir preenchimento dos detalhes da loja em `/painel/projeto` e `/painel/briefing`.
