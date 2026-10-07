# Auditoria inicial

Data: 2026-10-07. Escopo comparado com o Prompt Mestre de Aquisição Inteligente.

| Requisito | Estado inicial | Evidência |
|---|---|---|
| React/Vite/TypeScript e backend Node/PostgreSQL | IMPLEMENTADO, NÃO VALIDADO | `package.json`, `src/App.tsx`, `server.js` |
| Autenticação e papéis | IMPLEMENTADO, NÃO VALIDADO | cookie HttpOnly/SameSite e `ProtectedRoute` |
| Catálogo, planos, adicionais e templates | IMPLEMENTADO, NÃO VALIDADO | migrations 0001/0005, APIs `/api/catalog/*` |
| Checkout com cotação autoritativa | IMPLEMENTADO, NÃO VALIDADO | `/api/commerce/preview`, orders e `CheckoutPage` |
| Mercado Pago, webhook e idempotência | IMPLEMENTADO, NÃO VALIDADO EXTERNAMENTE | assinatura, consulta ao provedor e tabela de eventos |
| Projeto após pagamento | PARCIAL | engagement/projeto idempotentes; publicação real não comprovada |
| CRM e atribuição UTM | PARCIAL | CRM completo e first/last touch; sem sessão própria do funil |
| Landing de campanha | INEXISTENTE | nenhuma rota ou campanha gerenciável |
| Experimentos A/B persistentes | INEXISTENTE | sem campanha, variante ou atribuição |
| Configurador curto anônimo | INEXISTENTE | orçamento atual não produz prévia |
| Prévia personalizada, privada e editável | INEXISTENTE | demos estáticas não são projetos do visitante |
| Preço flexível com piso/limite | INEXISTENTE | preços fixos atuais |
| Métricas do funil/experimentos | INEXISTENTE | CRM não mede etapas da aquisição |
| Recuperação de abandono consentida | INEXISTENTE | sem captura progressiva própria |
| PWA | IMPLEMENTADO, NÃO VALIDADO | manifest, `sw.js`, registro em `main.tsx` |
| SEO | PARCIAL | sitemap/metadados existem; novas rotas ainda ausentes |
| Testes/build/lint | BLOQUEADO NA LINHA DE BASE | processos excederam 120/180 s e foram encerrados |

## Divergências e riscos

- `README.md` continua genérico do Vite e não documenta a operação real.
- migrations 0004 e 0005 repetem grande parte da reconciliação comercial; não remover sem comparar bancos implantados.
- `server.js` concentra muitas responsabilidades e exige integração modular para limitar regressões.
- não foi acessado nem alterado o banco de produção durante a auditoria.
- alterações locais preexistentes em `dist`, cache TypeScript, manifesto SEO e `cline-model-test.txt` não pertencem a este módulo e serão preservadas.
