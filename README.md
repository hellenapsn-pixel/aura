# AURA — Locadora de veículos

Aplicação web da AURA com identidade visual rústica e sofisticada, catálogo de veículos, solicitação de reservas e persistência no PostgreSQL (Neon).

## Stack
- Next.js 15 / React 19 / TypeScript
- PostgreSQL hospedado no Neon
- Deploy e funções serverless na Vercel

## Variáveis de ambiente
- `DATABASE_URL`: string privada de conexão do Neon.
- `MERCADOPAGO_ACCESS_TOKEN`: credencial privada do Mercado Pago (necessária para habilitar cobranças reais).
- `MERCADOPAGO_PUBLIC_KEY`: chave pública do Mercado Pago.
- `MERCADOPAGO_WEBHOOK_SECRET`: segredo para validar notificações de pagamento.

Não coloque credenciais no código, no GitHub ou no navegador. O pagamento real Pix/cartão e sua confirmação por webhook dependem da configuração das credenciais da conta Mercado Pago.

## Desenvolvimento
`npm install` e `npm run dev`.

Reservas enviadas pelo formulário são gravadas no banco. A locação só é confirmada após análise de disponibilidade, verificação dos requisitos legais (incluindo idade mínima e CNH válida) e confirmação da equipe.
