# Status de implementação

Legenda: `[ ]` pendente · `[~]` em andamento · `[x]` concluído · `[!]` bloqueado · `[-]` não aplicável

- [x] ETAPA 00 — Auditoria
- [x] ETAPA 01 — Estrutura de continuidade
- [x] ETAPA 02 — Assets Live2D locais
- [x] ETAPA 03 — Renderer isolado
- [x] ETAPA 04 — 22/33 Model Registry
- [~] ETAPA 05 — Fallback
- [~] ETAPA 06 — Responsividade do avatar/widget
- [x] ETAPA 07 — Avatar State Controller
- [x] ETAPA 08 — Event Bus
- [~] ETAPA 09 — AI Gateway
- [~] ETAPA 10 — Groq
- [~] ETAPA 11 — Context Manager
- [x] ETAPA 12 — Controle de escopo
- [~] ETAPA 13 — Anti-spam / Rate Limit
- [~] ETAPA 14 — Tool Calling
- [~] ETAPA 15 — Voz
- [~] ETAPA 16 — Lip-sync
- [~] ETAPA 17 — Backend Admin
- [~] ETAPA 18 — Analytics / Logs
- [~] ETAPA 19 — Segurança
- [~] ETAPA 20 — Testes integrados
- [~] ETAPA 21 — Auditoria final

## Baseline auditado

- Não havia Live2D, registry, controller, event bus ou widget de agente.
- Já existem providers/modelos/prompts de IA, failover por prioridade, timeout, logs e painel de execuções. Serão estendidos, não duplicados.
- APIs administrativas existentes validam sessão e papel no servidor.
- Nenhum asset ou referência ao Moedog existia no produto.
- Árvore Git estava limpa no início.

## Evidência atual

- Typecheck: PASS.
- Testes: 19 arquivos / 123 testes PASS.
- Lint: PASS.
- Build: PASS; widget, renderer e admin gerados em chunks lazy separados.
- Assets: binários `.moc` e oito texturas 22/33 idênticos à origem pelo SHA-256; manifests, motions e áreas de toque validados por teste.
- Browser: modelos 22 e 33 renderizados no admin, modelo 22 no frontend e clique no canvas sem novos erros/avisos no console.
- Banco: migration `0012_visual_ai_agent.sql` confirmada no ambiente de produção em rodada anterior; aliases SQL reservados do rate limit corrigidos nesta rodada.
- Ainda não comprovado: captura visual final isolada em tablet/mobile (a repetição local foi interceptada pelo estado offline do service worker), chamada Groq real, cada falha forçada do fallback, PWA/teclado, pausa efetiva do loop do runtime legado e amplitude real de lip-sync.

## Avanço local desta rodada

- Resumo compacto de histórico e janela recente implementados; integração SQL ainda depende da migration em banco descartável.
- Orçamento global diário por chamadas e tokens implementado antes do provider.
- Feedback por resposta/sessão, métricas agregadas e arraste desktop persistido implementados.
- O fallback estático não é mais um perfil selecionável nem substitui o Live2D silenciosamente; ele só aparece após falha real e fica identificado.
- Perfis alto/equilibrado/economia ainda não controlam FPS do runtime legado.
