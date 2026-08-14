# NEXTIA — Status de Implementação Pós-Auditoria (Fases 0 a 14)

**Data de Início**: 14/08/2026  
**Branch de Implementação**: `feat/pos-auditoria-fases-0-14`  
**Baseline**: Commit `24b9ed9` (main)  
**Ambiente Alvo**: Coolify / Contabo (PostgreSQL local)  

---

## 1. Fase Atual

- **Fase em Execução**: Fase 3 — Painel Multi-Serviço

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

---

## 3. Requisitos Pendentes

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

- `server.js`
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

1. **Cotação Autoritativa (`quoteId`)**: Todo pedido passa pelo `POST /api/commerce/preview`, garantindo que os preços sejam calculados 100% no servidor.
2. **Taxa de Domínio**: Adicionado item de R$ 50,00 (`5000` centavos) quando `mode === 'register'`, e R$ 0,00 para `connect`.

---

## 9. Próximo Passo Exato

- Executar a **Fase 3 — Painel Multi-Serviço**:
  1. Criar `src/context/ServiceEngagementContext.tsx` listando todos os engajamentos ativos/contratados do cliente.
  2. Adicionar o seletor de serviços no topo do dashboard em `src/components/dashboard/DashboardLayout.tsx`.
  3. Suportar rotas por engajamento `/painel/servicos/:engagementId` e rotas genéricas `/painel/projeto`, `/painel/briefing`, `/painel/arquivos`, `/painel/alteracoes`, `/painel/pagamentos`.
  4. Adicionar endpoint backend `GET /api/app/engagements` e `GET /api/app/engagements/:id`.
