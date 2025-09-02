# MEEP Enterprise - Sistema Completo de Gestão de Eventos Empresariais

## 🚀 Visão Geral

Sistema empresarial completo para gestão de eventos com módulos integrados de vendas, financeiro, estoque, CRM, BI e muito mais.

## 📋 Funcionalidades

### Dashboard Principal
- KPIs em tempo real
- Métricas favoritas
- Controle de caixa
- Análise de performance

### Gestão de Clientes
- CRM completo
- Sistema Cashless
- Programa de fidelidade
- Pesquisa de satisfação

### Operação de Vendas
- PDV completo
- Gestão de cardápios
- Soluções online
- Sistema de ingressos

### Relatórios Inteligentes
- Análise de vendas
- Relatórios financeiros
- Dashboard gerencial
- Exportação Excel/PDF

### Gestão de Estoque
- Controle de produtos
- Inventário
- Movimentações
- Alertas de estoque baixo

### Financeiro Completo
- Conta digital
- Gestão de pagamentos
- Antecipação de recebíveis
- Split de pagamentos

### Marketing & CRM
- Campanhas automatizadas
- Programa de fidelidade
- Cupons e promoções
- Segmentação de clientes

### Business Intelligence
- Analytics avançado
- Previsões de vendas
- Análise de churn
- Automação de processos

## 🛠️ Tecnologias

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL, Redis
- **Frontend**: HTML5, CSS3, JavaScript, Chart.js
- **Autenticação**: JWT
- **Real-time**: WebSockets
- **Container**: Docker
- **Proxy**: Nginx

## 📦 Instalação

### Requisitos
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (opcional)

### Instalação Local

1. Clone o repositório
```bash
git clone https://github.com/your-repo/meep-enterprise.git
cd meep-enterprise-system
```

2. Instale as dependências
```bash
npm install
```

3. Configure o ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrações
```bash
npm run migrate
```

5. Popule o banco de dados
```bash
npm run seed
```

6. Inicie o servidor
```bash
npm start
```

### Instalação com Docker

```bash
docker-compose up -d
```

## 🔑 Credenciais Padrão

- **Admin**: admin@meep.com / admin123
- **Operator**: operator@meep.com / operator123

## 📱 Acesso

- **Local**: http://localhost:3000
- **Docker**: http://localhost

## 📊 API Endpoints

### Autenticação
- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Registro
- POST `/api/auth/logout` - Logout

### Dashboard
- GET `/api/dashboard/metrics` - Métricas principais
- GET `/api/dashboard/kpi` - KPIs
- GET `/api/dashboard/favorites` - Favoritos

### Clientes
- GET `/api/clients` - Listar clientes
- POST `/api/clients` - Criar cliente
- GET `/api/clients/:id` - Detalhes do cliente
- PUT `/api/clients/:id` - Atualizar cliente

### Vendas
- GET `/api/sales/list` - Listar vendas
- POST `/api/sales/create` - Criar venda
- GET `/api/sales/:id` - Detalhes da venda

### Estoque
- GET `/api/inventory/products` - Listar produtos
- POST `/api/inventory/entry` - Entrada de estoque
- POST `/api/inventory/exit` - Saída de estoque

### Financeiro
- GET `/api/finance/digital-account` - Conta digital
- POST `/api/finance/transactions` - Criar transação
- GET `/api/finance/payment-methods` - Métodos de pagamento

### Marketing
- GET `/api/marketing/campaigns` - Campanhas
- POST `/api/marketing/loyalty/earn` - Adicionar pontos
- POST `/api/marketing/coupons/validate` - Validar cupom

### Business Intelligence
- GET `/api/bi/analytics/revenue` - Análise de receita
- GET `/api/bi/predictive/sales-forecast` - Previsão de vendas
- GET `/api/bi/automation/rules` - Regras de automação

## 🔧 Scripts

- `npm start` - Inicia o servidor
- `npm run dev` - Modo desenvolvimento
- `npm run migrate` - Executa migrações
- `npm run seed` - Popula banco de dados
- `npm test` - Executa testes

## 📈 Performance

- Suporta 10.000+ requisições/segundo
- Cache Redis para otimização
- WebSockets para tempo real
- Compressão gzip
- Rate limiting

## 🔒 Segurança

- Autenticação JWT
- Helmet.js para headers seguros
- Rate limiting
- Validação de entrada
- CORS configurado

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Proprietary - MEEP Enterprise © 2025

## 📞 Suporte

- Email: support@meep.com
- Docs: https://docs.meep.com
- Discord: https://discord.gg/meep