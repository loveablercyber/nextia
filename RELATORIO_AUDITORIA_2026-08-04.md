# Relatorio de auditoria - Nextia 2.0

Data: 04/08/2026
Escopo: deploy, administracao de parceiros, painel do parceiro e afiliacao.
Modo: somente leitura. Nenhuma correcao, commit ou deploy foi executado nesta auditoria.

## Resumo executivo

O deploy falha antes de gerar a aplicacao por erro TypeScript. As correcoes recentes adicionaram o modal e as acoes administrativas, mas essa versao ainda nao chegou a producao. O painel do parceiro continua parcialmente simulado. O link de afiliacao grava um cookie, mas nao existe codigo que consuma esse cookie ou crie uma indicacao; portanto a atribuicao de afiliados nao funciona de ponta a ponta.

## Problemas confirmados

### P0 - Deploy bloqueado por erro TypeScript

- Evidencia: `npm run build` falha em `src/pages/admin/AdminPartnerCommissionsPage.tsx:178` e `:179`.
- Erro: `Cannot find name 'pendingWithdrawalCount'. Did you mean 'pendingWithdrawals'?`
- Causa: a tela calcula `pendingWithdrawals` como valor monetario, mas tenta renderizar um contador inexistente chamado `pendingWithdrawalCount`.
- Impacto: o build para em `tsc -b`; nenhuma mudanca posterior e publicada pelo Coolify.
- Correcao recomendada: criar o contador com `withdrawals.filter(w => w.status === 'pendente').length`, mantendo separada a soma monetaria.

### P0 - Link de afiliacao nao atribui cadastros

- Evidencia: `server.js:1839-1847` trata `/ref/:code` e grava `nextia_ref` por 30 dias.
- Evidencia: a busca global encontra `nextia_ref` somente no ponto onde o cookie e gravado.
- Evidencia: nao existe `INSERT INTO public.partner_referrals` no fluxo de cadastro, compra ou ativacao.
- Impacto: visitas podem ser redirecionadas, mas cadastro, cliente, comissao e ranking nunca sao vinculados ao parceiro.
- Correcao recomendada: validar o codigo na entrada, consumir o cookie no cadastro/contratacao, persistir a atribuicao de forma idempotente e criar comissao apenas a partir de evento financeiro confirmado.

### P1 - Rotas de parceiro nao exigem perfil de parceiro

- Evidencia: `src/App.tsx:119-130` usa `<ProtectedRoute>` sem papel no `PartnerContainer`.
- Evidencia: `src/components/auth/ProtectedRoute.tsx:4-33` so aceita `client` ou `admin`; nao oferece `partner` como papel exigivel.
- Evidencia: `server.js:1357-1368` cria automaticamente `partner_profiles` para qualquer sessao autenticada que chame `/api/partner/*`.
- Impacto: qualquer cliente autenticado pode acessar o painel e gerar um perfil de parceiro pendente, poluindo a fila administrativa e quebrando a separacao de autorizacao.
- Correcao recomendada: aceitar `partner` em `requireRole`, proteger o container e exigir papel/parceiro aprovado no backend.

### P1 - Conteudo simulado permanece no painel do parceiro

- Evidencia: `src/context/PartnerContext.tsx:31-72` define conquistas com datas e desbloqueios fixos.
- Evidencia: `src/context/PartnerContext.tsx:74-82` define oito materiais com `via.placeholder.com` e `downloadUrl: '#'.`
- Evidencia: `src/context/PartnerContext.tsx:93-95` injeta esses arrays diretamente no estado.
- Impacto: conquistas podem aparecer desbloqueadas sem corresponder ao usuario; materiais exibem dados ficticios e botoes de download sem acao.
- Correcao recomendada: calcular conquistas a partir dos dados reais e criar fonte persistente para materiais, ocultando a secao enquanto nao houver conteudo valido.

### P1 - Aprovacao administrativa nao possui estado de recusa

- Evidencia: `src/pages/admin/AdminPartnersPage.tsx:38` limita status a `ativo`, `pendente` e `suspenso`.
- Evidencia: a interface oferece Aprovar, Suspender e Reativar; nao existe Recusar.
- Evidencia: `server.js:1347-1353` aceita atualizacao de status sem validacao de enum ou motivo.
- Impacto: o requisito de recusar conta nao foi implementado; valores arbitrarios podem ser persistidos se a API for chamada diretamente.
- Correcao recomendada: adicionar `recusado`, motivo, data e administrador responsavel; validar transicoes e valores no servidor.

### P1 - Feedback de acoes administrativas e insuficiente

- Evidencia: `handleUpdateStatus` apenas atualiza a lista quando `res.ok`; respostas de erro nao sao exibidas.
- Evidencia: o modal fecha imediatamente apos disparar a chamada, sem aguardar sucesso.
- Impacto: aprovacoes que falham parecem ter sido executadas; o administrador nao recebe o erro real.
- Correcao recomendada: aguardar a API, manter o modal aberto durante processamento, exibir erro retornado e confirmar o novo estado.

### P2 - Dados de perfil podem ser incompletos

- Evidencia: a consulta administrativa fornece nome, email, telefone, CPF/CNPJ, PIX e metricas, mas nao existe endpoint de detalhe dedicado nem historico de decisao.
- Evidencia: `server.js:1378` le `partnerProfile.whatsapp`, coluna que nao e criada na tabela `partner_profiles`; o telefone real esta em `profiles.phone`.
- Impacto: algumas telas podem exibir WhatsApp vazio e o administrador nao possui trilha de auditoria da aprovacao.
- Correcao recomendada: definir uma unica fonte para telefone e registrar eventos administrativos.

### P2 - Qualidade estatica nao esta operacional

- Evidencia: `npm run lint` nao concluiu dentro de 120 segundos e nao produziu diagnostico.
- Impacto: a verificacao automatica nao e confiavel para CI/deploy e pode esconder novos problemas.
- Correcao recomendada: excluir artefatos e pastas geradas do lint, revisar configuracao do ESLint e executar lint focado em `src`, `api` e `server.js`.

## Itens que existem no codigo, mas nao estao publicados

- Modal de detalhes do parceiro com nome, email, WhatsApp, CPF/CNPJ, PIX, codigo, nivel e metricas.
- Acoes de aprovar, suspender e reativar na tabela e no modal.
- Paginas registradas para dashboard, indicacoes, comissoes, financeiro, ranking, materiais, conquistas e perfil.
- APIs de listagem de parceiros, comissoes, saques, ranking e atualizacao de status.

Esses itens nao podem ser considerados funcionais em producao enquanto o build estiver bloqueado e os fluxos autenticados nao forem testados apos um deploy bem-sucedido.

## Fluxo de afiliacao atual

1. O parceiro copia `nextia.dev.br/ref/{codigo}`.
2. O servidor redireciona para `/?ref={codigo}`.
3. O servidor grava `nextia_ref`.
4. O fluxo termina: nenhum cadastro le o cookie e nenhuma indicacao e persistida.

Status: parcialmente implementado, nao funcional de ponta a ponta.

## Ordem recomendada de correcao

1. Corrigir o erro TypeScript e tornar build/lint obrigatorios antes do deploy.
2. Corrigir autorizacao do painel e APIs de parceiro.
3. Implementar atribuicao de afiliacao e testes de idempotencia.
4. Implementar recusa com motivo, auditoria e feedback de erro.
5. Remover mocks de conquistas e materiais.
6. Fazer deploy e validar no navegador: admin, parceiro pendente, parceiro aprovado, link de indicacao, cadastro indicado, comissao e saque.

## Verificacoes executadas

- Inspecao de rotas React, contextos, paginas administrativas e APIs Node.
- Busca de mocks, placeholders, links sem destino e uso do cookie de afiliacao.
- Execucao de `npm run build`: falhou com erro TypeScript reproduzivel.
- Execucao de `npm run lint`: expirou apos 120 segundos.
- Nenhuma alteracao funcional, commit, acesso ao Coolify ou deploy foi realizado.

## Execucao das correcoes - 05/08/2026

Implementado:

- Correcao de `pendingWithdrawalCount`, liberando a compilacao TypeScript.
- API autenticada para listar, editar, redefinir senha e excluir usuarios no PostgreSQL local.
- Protecao das rotas de parceiro por papel e remocao da criacao automatica de parceiro para clientes comuns.
- Aprovacao, suspensao, reativacao e recusa de parceiro com motivo, data e administrador responsavel.
- Persistencia idempotente da indicacao no cadastro por meio do cookie `nextia_ref`.
- Validacao do codigo de indicacao antes de gravar o cookie.
- Link de indicacao gerado com a origem real do site e protocolo HTTPS em producao.
- Bloqueio do painel operacional e de saques enquanto o parceiro nao estiver ativo.
- Remocao de conquistas previamente marcadas como desbloqueadas e de materiais ficticios com links `#`.
- Remocao do contador de notificacoes ficticio no painel do parceiro.

Validacao:

- `node --check server.js`: aprovado.
- `npx tsc --noEmit -p tsconfig.app.json --incremental false`: aprovado.
- `npm run build`: aprovado; 1920 modulos transformados.
- HTTP local `/api/health`: status `ok`.
- HTTP local `/`: status 200 e raiz React presente.
- ESLint focado: ainda acusa divida tecnica preexistente (`any`, exports de contexto e regra de efeito); nao ha erro de TypeScript ou build causado por essas ocorrencias.
- APIs dependentes do banco nao puderam ser executadas localmente porque o hostname do `DATABASE_URL` e interno ao Coolify. A verificacao final deve ocorrer apos o deploy.
