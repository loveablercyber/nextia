# Decisões técnicas

1. **Preservar React/Vite/Node/PostgreSQL/Coolify.** Troca de stack não agrega valor e elevaria o risco.
2. **Módulo de API separado.** Reduz crescimento e acoplamento do `server.js`.
3. **Sessão anônima com segredo.** UUID isolado não é autorização suficiente; o banco guarda apenas hash do token.
4. **Eventos append-only.** Permitem funil e A/B sem inferir comportamento a partir de tabelas mutáveis.
5. **Preço autoritativo no servidor.** O navegador envia escolhas, nunca o total final.
6. **Reuso do checkout e webhook.** Evita um segundo fluxo financeiro e mantém idempotência existente.
7. **Sem upload de arquivo na primeira versão.** Logo pode ser URL segura posteriormente; texto e cor entregam valor sem superfície adicional de ataque.
8. **Sem deploy automático.** Lançamento depende de auditoria final e autorização explícita.
