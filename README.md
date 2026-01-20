# Movetrak Checkout API

API de checkout para Movetrak usando Node.js e Express.

## Requisitos

- Node.js >= 14.x
- NPM >= 6.x

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas credenciais:
- `ASAAS_API_KEY`: Sua chave de API do Asaas
- `SUPERFRETE_TOKEN`: Seu token do Superfrete
- `WEBHOOK_TOKEN`: Token para validação de webhooks

## Executar

```bash
npm start
```

O servidor iniciará na porta 3000 (ou a porta definida em `PORT`).

## Endpoints

### 1. POST /api/frete/cotar

Calcula cotação de frete.

**Parâmetros:**
```json
{
  "cepOrigem": "01310100",
  "cepDestino": "20040020",
  "qty": 5
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "packaging": {
      "type": "envelope",
      "quantity": 2,
      "dimensions": {
        "height": 12,
        "width": 18,
        "length": 1
      }
    },
    "weight": 0.316,
    "quote": [...]
  }
}
```

### 2. POST /api/checkout

Processa o checkout e cria cobrança.

**Parâmetros:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "telefone": "11999999999",
  "cpfCnpj": "12345678900",
  "cepDestino": "20040020",
  "qty": 3
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "order": {
      "qty": 3,
      "packaging": {...},
      "weight": 0.1896,
      "shippingCost": 15.50
    },
    "payment": {
      "id": "pay_123",
      "status": "PENDING",
      "value": 15.50,
      "dueDate": "2024-01-27",
      "invoiceUrl": "https://...",
      "bankSlipUrl": "https://..."
    }
  }
}
```

### 3. POST /webhook/asaas

Webhook para notificações de pagamento do Asaas.

**Headers:**
- `asaas-access-token`: Token de validação

Ou parâmetro de query:
- `?token=seu_webhook_token`

**Eventos tratados:**
- `PAYMENT_RECEIVED`: Pagamento recebido
- `PAYMENT_CONFIRMED`: Pagamento confirmado
- `PAYMENT_OVERDUE`: Pagamento vencido

## Regras de Embalagem

- **1-3 unidades**: 1 envelope 12x18cm
- **4-6 unidades**: 2 envelopes 12x18cm
- **7-15 unidades**: 1 caixa 28x21x12cm
- **>15 unidades**: Rejeitado (quantidade máxima excedida)

## Cálculo de Peso

- Peso unitário do produto: 0.0432kg
- Peso da embalagem: 0.020kg
- **Peso total: qty × 0.0632kg**

## Estrutura do Projeto

```
movetrak-checkout/
├── src/
│   ├── routes/
│   │   ├── frete.js       # Rotas de frete
│   │   ├── checkout.js    # Rotas de checkout
│   │   └── webhook.js     # Rotas de webhook
│   ├── services/
│   │   ├── superfrete.js  # Integração Superfrete
│   │   └── asaas.js       # Integração Asaas
│   ├── utils/
│   │   └── packaging.js   # Cálculos de embalagem
│   └── server.js          # Servidor Express
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json
└── README.md
```

## Testes

Para testar os endpoints, você pode usar curl ou Postman:

### Testar cotação de frete:
```bash
curl -X POST http://localhost:3000/api/frete/cotar \
  -H "Content-Type: application/json" \
  -d '{
    "cepOrigem": "01310100",
    "cepDestino": "20040020",
    "qty": 5
  }'
```

### Testar checkout:
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11999999999",
    "cpfCnpj": "12345678900",
    "cepDestino": "20040020",
    "qty": 3
  }'
```

### Testar webhook:
```bash
curl -X POST http://localhost:3000/webhook/asaas?token=seu_webhook_token \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_123",
      "status": "RECEIVED"
    }
  }'
```

## Health Check

```bash
curl http://localhost:3000/health
```

## Licença

ISC