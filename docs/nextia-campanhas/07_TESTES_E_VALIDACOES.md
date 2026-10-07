# Testes e validações

## Linha de base e validação atual

- primeira tentativa conjunta: inconclusiva por timeout; processos órfãos foram encerrados seletivamente.
- `npm run test -- --run`: **PASS**, 21 arquivos e 138 testes.
- teste novo do funil: **PASS**, garante entrega de valor antes de contato/cadastro.
- ESLint nos arquivos alterados: **PASS**.
- `node --check acquisition-api.js` e `node --check server.js`: **PASS**.
- `npm run build`: **PASS**; inclui geração SEO, TypeScript e Vite (1.972 módulos).
- inspeção visual local: **NOT TESTED**, navegação local excedeu o prazo porque o servidor de desenvolvimento não respondeu.
- migration 0014: **NOT TESTED EM BANCO**, deliberadamente não executada contra produção.
- Mercado Pago e provisionamento E2E: **NOT TESTED EXTERNAMENTE**.

## Matriz exigida

- unidade: seleção de variante, validação de preço, sanitização e transições;
- integração: criar/retomar sessão, salvar prévia, eventos, consentimento, vínculo ao checkout;
- segurança: token incorreto, expiração, rate limit, payload excessivo, acesso administrativo;
- frontend: fluxo móvel e desktop, teclado, foco, contraste e estados de erro;
- regressão: checkout, webhook, autenticação, CRM, PWA e SEO;
- operação: migration em banco de homologação, rollback lógico, métricas e logs sem PII.
