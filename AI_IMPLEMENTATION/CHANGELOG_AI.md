# Changelog do agente visual

## 2026-09-22 — ETAPA 00 / 01

- Criados: `AI_IMPLEMENTATION/MASTER_PLAN.md`, `IMPLEMENTATION_STATUS.md`, `DECISIONS.md`, `CHANGELOG_AI.md`, `HANDOFF.md`.
- Auditorados: frontend, backend, autenticação, admin, IA existente, migrations, PWA, dependências e Git.
- Dependências adicionadas/removidas: nenhuma.
- Migration: nenhuma.
- Evidência: busca integral sem implementação Live2D; revisão de `ai-service.js`, `automation-api.js` e rotas administrativas.
- Risco encontrado: modelos 22/33 têm licença GPL-2.0 e titularidade visual declarada da Bilibili.

## 2026-09-22 — ETAPAS 02–20 (implementação local parcial)

- Assets: runtime Cubism 2, modelos 22/33, roupa default segura, motions, fallbacks SVG, licença e atribuição locais.
- Frontend: registry, renderer lazy, fallback em três níveis, estados, event bus, widget, chat, voz nativa e preferências mínimas.
- Backend: rotas públicas/admin, filtro de escopo e injection, FAQ local, rate limit/anti-repetição, contexto limitado, whitelist de ações e integração com `AIService` existente.
- Admin: kill switches, modelo, dispositivos, tamanho, posição, voz, contexto, personalidade e limites.
- Banco: criada `0012_visual_ai_agent.sql`; não aplicada nesta sessão por ausência de PostgreSQL descartável confirmado.
- Groq: `qwen/qwen3.8-27b` confirmado na documentação oficial; fallback corrigido para `openai/gpt-oss-20b` porque Llama 3.3 foi descontinuado.
- Testes: 19 arquivos / 120 testes PASS; typecheck, lint e build PASS.
- Correções: callbacks de unsubscribe, import type-only, idle callback, callback estável do renderer e uso real dos tamanhos responsivos configurados.
- Contexto e custo: resumo determinístico das mensagens antigas, janela recente limitada e orçamento global diário por chamadas/tokens antes do provider.
- UX/admin: feedback 👍/👎 relacionado à resposta e à sessão, arraste persistido no desktop, perfil de fallback estático e controles administrativos para desempenho/orçamento.
- Analytics: overview administrativo inclui consumo diário e feedback agregado, sem expor conteúdo de conversa.
- Pendências comprovadas: E2E browser/WebGL/DB/Groq, cache persistente além da FAQ local, tool calls de dados, confirmação crítica, amplitude real de lip-sync, controle real de FPS nos perfis alto/equilibrado/economia e validações PWA/mobile/teclado.

## 2026-09-22 — Correção pós-deploy

- Corrigido o ciclo de conexão PostgreSQL de `visual-agent-api.js`: conexão explícita e encerramento garantido em `finally`.
- Incluído `visual-agent-api.js` explicitamente no estágio final da imagem Docker.
- Adicionado teste de regressão para abertura e encerramento da conexão.
- Evidência local: 19 arquivos / 121 testes PASS; typecheck, lint e build PASS.

## 2026-09-22 — Conformidade visual Live2D 22/33

- Auditoria de origem: os binários `.moc` e as oito texturas locais foram comparados por SHA-256 com `xb2016/poster-girl-l2d-2233` no commit `6fca7999e2c865a55b795a96b911aa4018e0060b`; todos são idênticos à origem.
- Origem, commit, licença e mapeamento exato dos assets ficaram registrados em `public/live2d/ATTRIBUTION.md`.
- O preview genérico do admin foi substituído pelo mesmo renderer Live2D real usado no frontend, com seleção verificável entre os modelos 22 e 33 e estados explícitos de carregamento, renderização e falha.
- O widget público passou a manter chat e personagem lado a lado no desktop; o SVG aparece somente após falha real do runtime/assets e é identificado como modo alternativo.
- O renderer ganhou IDs únicos por instância, preflight dos manifests/assets locais, callback de prontidão, timeout e cursor configurável.
- O widget público não é montado nas rotas `/admin`, evitando disputa do runtime Cubism 2 global com o preview administrativo.
- Restauradas nos dois manifests as áreas de toque oficiais (`hit_areas_custom`); a ausência delas causava erro do runtime ao clicar no avatar.
- Corrigidos aliases SQL reservados de rate limit (`minute`, `hour`, `day`, `repeated`) e incluído teste de regressão.
- Evidência visual local: modelos 22 e 33 renderizados como personagens distintos no admin; modelo 22 animado no frontend; clique no canvas sem erros ou avisos novos no console.
- Evidência automatizada final: 19 arquivos / 123 testes PASS; typecheck PASS; lint PASS; build de produção PASS (1970 módulos).
