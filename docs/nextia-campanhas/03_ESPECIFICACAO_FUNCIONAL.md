# Especificação funcional

## Visitante

1. Entra em uma campanha e recebe variante estável.
2. Escolhe segmento, objetivo, nome, cor e contato principal sem criar conta.
3. Abre uma prévia navegável em desktop ou celular e edita textos essenciais.
4. Escolhe forma de preço e adicionais elegíveis.
5. Informa contato com consentimento opcional para recuperação.
6. Segue para o checkout existente com a seleção preservada.

## Administração

Campanhas possuem status, período, variantes ponderadas, oferta, modelo de preço e limites econômicos. O painel apresenta sessões, progressão, abandono, conversão e receita atribuída. Alterações comerciais devem ser auditáveis.

## Regras

- a variante não muda durante a sessão;
- a prévia usa token secreto, expira, não é indexada e não revela dados de terceiros;
- valores exibidos são recalculados no servidor;
- pagamento só é aprovado após consulta/verificação no provedor;
- provisionamento é idempotente;
- contato de abandono exige consentimento e permite revogação.
