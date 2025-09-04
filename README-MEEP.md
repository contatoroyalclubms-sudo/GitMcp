# MEEP Automation Supreme 🚀

Sistema completo de engenharia reversa e mapeamento do Portal MEEP com análise abrangente e documentação automática.

## 🎯 O que este sistema faz

O **MEEP Automation Supreme** é uma ferramenta avançada que realiza análise completa e engenharia reversa do Portal MEEP (https://beta.portal.meep.com.br), incluindo:

### 🔍 Funcionalidades Principais

- **Login Automático**: Acesso automatizado com suas credenciais
- **Descoberta de Páginas**: Mapeamento automático de todas as rotas disponíveis
- **Análise de Elementos**: Captura detalhada de todos os elementos HTML
- **Identificação de Funcionalidades**: Inferência inteligente de recursos CRUD
- **Interceptação de APIs**: Captura de todas as chamadas de API
- **Screenshots Automáticos**: Capturas de tela de todas as páginas
- **Relatórios Estruturados**: Documentação completa em múltiplos formatos

### 📊 Resultados Gerados

- **Relatório Markdown**: Documentação legível e estruturada
- **Dados JSON**: Informações técnicas detalhadas
- **Diagrama Mermaid**: Visualização da arquitetura
- **Screenshots**: Capturas de todas as telas
- **Mapeamento de APIs**: Lista completa de endpoints descobertos

## 🚀 Instalação Rápida

### 1. Instalar Dependências

\`\`\`bash

# Instalar Playwright (obrigatório)

npm install playwright

# Instalar browsers do Playwright

npx playwright install chromium
\`\`\`

### 2. Configurar Sistema

\`\`\`bash

# Executar setup interativo

node setup-meep-automation.js
\`\`\`

O setup irá solicitar:

- 👤 **Email/Username** do Portal MEEP
- 🔐 **Senha** da sua conta
- ⚙️ **Configurações opcionais** (modo invisível, diretórios, etc.)

### 3. Executar Análise

\`\`\`bash

# Executar análise completa

node run-meep-analysis.js

# OU usando npm

npm start
\`\`\`

## 📁 Estrutura de Arquivos

\`\`\`
meep-automation-supreme/
├── meep-automation-supreme.js # Sistema principal
├── setup-meep-automation.js # Script de configuração
├── run-meep-analysis.js # Script executável (gerado pelo setup)
├── meep-config.json # Configurações (gerado pelo setup)
├── package-meep.json # Dependências
├── README-MEEP.md # Esta documentação
└── resultados/
├── meep-analysis-results/ # Dados da análise
│ ├── reports/ # Relatórios finais
│ ├── pages/ # Análises por página
│ ├── apis/ # APIs descobertas
│ └── elements/ # Elementos mapeados
└── meep-screenshots/ # Capturas de tela
\`\`\`

## 🔧 Configuração Manual

Se preferir configurar manualmente, edite diretamente o arquivo \`meep-automation-supreme.js\`:

\`\`\`javascript
// Encontre estas linhas no final do arquivo:
const USERNAME = 'seu-email@exemplo.com'; // ⚠️ SUBSTITUA
const PASSWORD = 'sua-senha-aqui'; // ⚠️ SUBSTITUA
\`\`\`

## 📊 Exemplo de Saída

### Estatísticas Típicas

- ✅ **20-50 páginas** analisadas
- 🔍 **500-2000 elementos** HTML mapeados
- ⚡ **50-200 funcionalidades** identificadas
- 🌐 **10-100 APIs** descobertas
- 📸 **Screenshots** de todas as páginas

### Relatório Final

\`\`\`
🎉 ANÁLISE COMPLETA FINALIZADA!
=====================================
📊 ESTATÍSTICAS FINAIS:
• Páginas Analisadas: 24
• Elementos Encontrados: 1,247
• Funcionalidades Identificadas: 156
• APIs Descobertas: 47
• Duração: 3m 24s

📁 ARQUIVOS GERADOS:
• Relatório Principal: ./meep-analysis-results/reports/MEEP-COMPLETE-ANALYSIS.md
• Dados JSON: ./meep-analysis-results/reports/meep-complete-analysis.json
• Diagrama Mermaid: ./meep-analysis-results/reports/meep-architecture-diagram.mmd
• Screenshots: ./meep-screenshots/
• APIs: ./meep-analysis-results/apis/discovered-apis.json
\`\`\`

## 🎨 Funcionalidades Identificadas

O sistema identifica automaticamente diferentes tipos de funcionalidades:

### 🔐 Autenticação

- Formulários de login
- Campos de email/senha
- Botões de acesso

### 📝 CRUD Operations

- **Create**: Botões "Criar", "Adicionar", "Novo"
- **Read**: Tabelas de dados, listagens
- **Update**: Botões "Editar", "Alterar"
- **Delete**: Botões "Excluir", "Remover"

### 🔍 Busca e Filtros

- Campos de pesquisa
- Filtros avançados
- Ordenação de dados

### 📊 Relatórios

- Botões de exportação
- Downloads de dados
- Dashboards

## 🛠️ Configurações Avançadas

### Opções Disponíveis

\`\`\`javascript
const options = {
headless: false, // Executar visível (true = invisível)
baseUrl: 'https://beta.portal.meep.com.br',
outputDir: './meep-analysis-results',
screenshotDir: './meep-screenshots',
maxDepth: 5, // Profundidade de navegação
waitTimeout: 30000, // Timeout para carregamento
maxPages: 50 // Máximo de páginas para analisar
};
\`\`\`

### Modo Debug

Para executar em modo debug com mais informações:

\`\`\`bash

# Executar com logs detalhados

DEBUG=\* node run-meep-analysis.js
\`\`\`

## 🔒 Segurança e Privacidade

### ⚠️ Importante

- **Credenciais são armazenadas localmente** no arquivo \`meep-config.json\`
- **Nunca compartilhe** este arquivo
- **Use apenas em ambiente seguro**
- **Dados capturados são locais** - não são enviados para terceiros

### 🛡️ Boas Práticas

1. Execute apenas em máquinas confiáveis
2. Delete o arquivo \`meep-config.json\` após uso
3. Use credenciais de teste quando possível
4. Mantenha os resultados em local seguro

## 🚨 Solução de Problemas

### Problema: "Campos de login não encontrados"

**Solução**: O Portal MEEP pode ter mudado. Verifique se a URL está correta.

### Problema: "Login falhou"

**Soluções**:

1. Verifique suas credenciais
2. Execute \`node setup-meep-automation.js\` novamente
3. Tente fazer login manual primeiro

### Problema: "Browser não abre"

**Soluções**:

1. Execute: \`npx playwright install chromium\`
2. Verifique se o Playwright está instalado corretamente

### Problema: "Timeout durante análise"

**Soluções**:

1. Verifique sua conexão com a internet
2. Aumente o \`waitTimeout\` nas configurações
3. Execute em horário de menor movimento

## 📋 Requisitos do Sistema

### Mínimos

- **Node.js** 16+
- **RAM**: 4GB disponível
- **Espaço**: 2GB para resultados
- **Internet**: Conexão estável

### Recomendados

- **Node.js** 18+
- **RAM**: 8GB disponível
- **Espaço**: 5GB para resultados
- **Internet**: Banda larga

## 🤝 Suporte

Para problemas ou dúvidas:

1. **Verifique os logs** gerados durante a execução
2. **Consulte os screenshots** para identificar problemas visuais
3. **Execute o setup novamente** se houver problemas de configuração

## 📈 Próximas Versões

### Recursos Planejados

- 🔄 **Análise incremental** - Detectar apenas mudanças
- 🤖 **IA para análise** - Descrições automáticas de funcionalidades
- 📊 **Dashboard interativo** - Visualização dos resultados
- 🔗 **Integração CI/CD** - Execução automatizada
- 📱 **Análise mobile** - Suporte para versões mobile

## 📄 Licença

MIT License - Use livremente para fins de análise e documentação.

---

**MEEP Automation Supreme** - Engenharia reversa inteligente para o Portal MEEP 🎯
