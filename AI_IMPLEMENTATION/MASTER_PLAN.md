# Plano mestre — Agente visual de IA

## Objetivo

Integrar um assistente especializado na plataforma Nextia com corpo visual Live2D 22/33, backend Groq, voz opcional e governança administrativa, sem tornar o site dependente do avatar ou do provedor.

## Arquitetura confirmada

- Frontend: React 19, TypeScript, Vite, React Router e Tailwind CSS.
- Backend: servidor Node.js próprio (`server.js`) com PostgreSQL (`pg`) e cookies de sessão.
- Admin: rotas React protegidas por papel `admin` e APIs `/api/admin/*` com autorização no servidor.
- IA existente: `AIService` OpenAI-compatible, providers/modelos/prompts persistidos, timeout, prioridade/failover e telemetria em `ai_runs`.
- Deploy: Docker/Coolify. Não há `.openai/hosting.json`.
- Live2D anterior: inexistente no projeto. A origem 22/33 usa Cubism 2 e GPL-2.0; o runtime remoto será substituído por arquivo local.

## Princípios

1. Live2D, agente, voz e UI comunicam-se apenas por estados/eventos abstratos.
2. Falhas do avatar, voz ou Groq nunca derrubam a aplicação.
3. API key existe somente no servidor.
4. Ferramentas usam whitelist e autorização server-side.
5. Configuração administrativa tem defaults seguros e desligamentos independentes.
6. Assets permitidos são definidos em registry; URLs arbitrárias são proibidas.
7. Perguntas fora do produto são bloqueadas antes do provider quando possível.

## Etapas

| Etapa | Entrega | Dependências | Evidência/testes |
|---|---|---|---|
| 00 | Auditoria do código, dados, auth, IA, admin e assets | — | relatório e diff limpo |
| 01 | Documentação de continuidade | 00 | cinco arquivos presentes e coerentes |
| 02 | Assets 22/33 e runtime locais, licença e versionamento | 01 | nenhum hotlink; arquivos resolvem localmente |
| 03 | Renderer isolado e lazy | 02 | erro de runtime não afeta app |
| 04 | Model Registry 22/33 | 02 | paths centralizados e modelos validados |
| 05 | Fallback Live2D → imagem → botão | 03–04 | testes dos três níveis |
| 06 | Desktop/tablet/mobile, safe areas e conflitos | 05 | testes de viewport/teclado |
| 07 | AvatarStateController | 04 | mapeamento de estados sem paths externos |
| 08 | Event Bus | 07 | eventos de IA/tool/idle atualizam estado |
| 09 | Gateway conversacional | 00 | frontend chama apenas backend |
| 10 | Groq configurável e failover | 09 | 429/timeout/model-not-found cobertos |
| 11 | Context Manager | 09 | janela e resumo limitados |
| 12 | Escopo/injection/input/output | 09 | cenários obrigatórios aprovados |
| 13 | Anti-spam/rate limit/orçamento/cache | 09 | limites por sessão/usuário/IP |
| 14 | Tool Calling seguro | 09,12 | whitelist, RBAC e confirmação crítica |
| 15 | Voz nativa opcional | 05 | autoplay off; preferências persistem |
| 16 | Lip-sync desacoplado | 15 | falha não interrompe voz/IA |
| 17 | Admin Assistente IA/Live2D | 04,09 | persistência e desligamentos sem deploy |
| 18 | Analytics e logs | 09,17 | sem secrets/conteúdo sensível |
| 19 | Hardening de segurança | 02–18 | revisão de SSRF/XSS/RBAC/secrets |
| 20 | Testes integrados | 02–19 | unitários, API, UI, falhas e performance |
| 21 | Auditoria final | 20 | matriz final e nenhum erro introduzido |

## Arquivos previstos

- `public/live2d/` — runtime, modelos, fallbacks, licença e manifestos locais.
- `src/features/avatar/` — registry, estados, event bus, renderer, UI, voz e preferências.
- `visual-agent-service.js` e `visual-agent-api.js` — agente especializado e rotas.
- `database/migrations/0012_visual_ai_agent.sql` — configuração, sessões, limites, feedback e métricas.
- `src/pages/automation/AdminVisualAgentPage.tsx` — configuração/preview/consumo.
- testes JS/TS específicos do agente.

## Riscos

- Os modelos são Cubism 2 e dependem de runtime legado WebGL; isolamento e fallback são obrigatórios.
- O upstream está arquivado e é GPL-2.0. A licença será redistribuída com os arquivos.
- O README upstream informa que 22/33 pertencem à Bilibili. Uso comercial deve ser validado pelo titular do projeto; isso não pode ser resolvido tecnicamente.
- Não há `GROQ_API_KEY` configurada no repositório; a experiência deve operar em FAQ/fallback até configuração segura no Coolify.

## Critério de conclusão

Uma etapa só recebe `[x]` após implementação real e seus testes. Documentação nunca substitui a confirmação no código.
