# GitMcp - Sistema de Gestão Empresarial

Sistema empresarial completo com módulos de PDV, controle de estoque, relatórios e inteligência artificial.

## Requisitos

### Desenvolvimento (SQLite)
- Node.js 18+ 
- NPM ou Yarn

### Produção (PostgreSQL)
- Docker e Docker Compose
- Node.js 18+ (se executar sem Docker)
- PostgreSQL 15+ (se executar sem Docker)
- Redis 7+ (se executar sem Docker)

## Instalação Rápida

### 1. Clone o repositório
```bash
git clone <repository-url>
cd gitmecp
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:
- `JWT_SECRET`: Gere uma chave segura (OBRIGATÓRIO)
- `DB_PASSWORD`: Defina uma senha para PostgreSQL (se usar Docker/produção)

### 3. Instale as dependências
```bash
npm install
```

## Execução

### Desenvolvimento (SQLite)
```bash
# Certifique-se que DB_TYPE=sqlite no .env
npm run dev
```

### Produção com Docker (PostgreSQL)
```bash
# Configure .env com DB_PASSWORD e JWT_SECRET
docker-compose up -d
```

### Produção sem Docker (PostgreSQL)
```bash
# Certifique-se que DB_TYPE=postgres no .env
# Configure PostgreSQL e Redis manualmente
npm start
```

## Credenciais de Acesso Padrão

### Administrador
- **Email**: admin@gitmecp.com
- **Senha**: Admin@123

### Operador PDV
- **Email**: operador@gitmecp.com
- **Senha**: Operador@123

**IMPORTANTE**: Altere essas senhas no primeiro acesso!

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor com hot-reload
npm run test         # Executa testes
npm run lint         # Verifica código

# Docker
docker-compose up -d      # Inicia serviços em background
docker-compose down       # Para todos os serviços
docker-compose logs -f    # Visualiza logs
docker-compose restart    # Reinicia serviços

# Banco de dados
npm run migrate      # Executa migrações
npm run seed         # Popula dados iniciais
npm run db:reset     # Reseta banco (desenvolvimento)
```

## Estrutura do Projeto

```
gitmecp/
├── config/          # Configurações (database, etc)
├── models/          # Modelos do banco de dados
├── routes/          # Rotas da API
├── middleware/      # Middlewares Express
├── migrations/      # Migrações do banco
├── seeders/         # Seeds para dados iniciais
├── public/          # Arquivos estáticos
├── ai-core/         # Módulo de IA
└── server.js        # Entrada principal
```

## Variáveis de Ambiente

### Essenciais
- `NODE_ENV`: `development` ou `production`
- `DB_TYPE`: `sqlite` (dev) ou `postgres` (prod)
- `JWT_SECRET`: Chave secreta para tokens (OBRIGATÓRIO)
- `DB_PASSWORD`: Senha do PostgreSQL (OBRIGATÓRIO para produção)

### Opcionais
- `PORT`: Porta do servidor (padrão: 3000)
- `STRIPE_SECRET_KEY`: Para pagamentos
- `ANTHROPIC_API_KEY`: Para recursos de IA
- `SMTP_*`: Para envio de emails

Veja `.env.example` para lista completa.

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuário atual

### PDV
- `GET /api/pdv/products` - Lista produtos
- `POST /api/pdv/sales` - Registra venda
- `GET /api/pdv/sales/:id` - Detalhes da venda

### Produtos
- `GET /api/products` - Lista produtos
- `POST /api/products` - Cria produto
- `PUT /api/products/:id` - Atualiza produto
- `DELETE /api/products/:id` - Remove produto

### Relatórios
- `GET /api/reports/sales` - Relatório de vendas
- `GET /api/reports/inventory` - Relatório de estoque
- `GET /api/reports/financial` - Relatório financeiro

## Troubleshooting

### Erro de conexão com banco
- Verifique se as credenciais no `.env` estão corretas
- Para Docker: `docker-compose ps` para verificar se PostgreSQL está rodando
- Para SQLite: Verifique permissões no arquivo `database.sqlite`

### Erro de porta em uso
- Mude a variável `PORT` no `.env`
- Ou pare o processo usando a porta: `lsof -i :3000` (Linux/Mac)

### Docker não inicia
- Verifique se Docker está instalado: `docker --version`
- Verifique logs: `docker-compose logs postgres`
- Certifique-se que `DB_PASSWORD` está definida no `.env`

## Suporte

Para problemas ou dúvidas:
1. Verifique a documentação em `/docs`
2. Abra uma issue no GitHub
3. Contate o suporte técnico

## Licença

Proprietary - Todos os direitos reservados