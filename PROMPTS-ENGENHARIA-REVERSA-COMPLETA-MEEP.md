# 🎯 PROMPTS PARA ENGENHARIA REVERSA COMPLETA - PORTAL MEEP

## 📋 **GUIA DE EXECUÇÃO**

### **🎯 OBJETIVO:** Engenharia reversa 100% completa do Portal MEEP

### **📊 BASE:** 17+ módulos já mapeados + análise técnica detalhada

### **⏱️ TEMPO ESTIMADO:** 8-16 horas (com automação) | 20-40 horas (manual)

### **🎯 RESULTADO:** Documentação técnica e comercial completa

---

## 🏗️ **PROMPT 1: MAPEAMENTO DE APIS E ENDPOINTS**

```
Você é um especialista em engenharia reversa de sistemas web. Com base na análise do Portal MEEP (https://beta.portal.meep.com.br/), preciso que você:

CONTEXTO:
- Sistema MEEP com 17+ módulos já identificados
- APIs conhecidas: app-prd-portal-v4-api.azurewebsites.net, dashboard-api.meep.cloud, menu-api.meep.cloud
- Empresa: NOVA UNICA CLUB (CNPJ: 46685267000241)
- Login: toretomal@icloud.com / 352162Cl@

MISSÃO:
1. **INTERCEPTAR E MAPEAR** todas as chamadas de API durante navegação
2. **DOCUMENTAR ENDPOINTS** descobertos com:
   - URL completa
   - Método HTTP (GET, POST, PUT, DELETE)
   - Parâmetros de entrada
   - Estrutura de resposta (JSON)
   - Headers importantes
   - Autenticação/tokens

3. **ANALISAR PADRÕES** das APIs:
   - Versionamento (v1, v2, v4)
   - Estrutura de URLs
   - Convenções de nomenclatura
   - Rate limiting
   - Paginação

4. **IDENTIFICAR INTEGRAÇÕES**:
   - APIs externas (pagamentos, maps, etc.)
   - Webhooks
   - Comunicação entre microsserviços

5. **GERAR DOCUMENTAÇÃO**:
   - OpenAPI/Swagger spec
   - Postman collection
   - Mapa visual de APIs

RESULTADO ESPERADO:
- Lista completa de endpoints descobertos
- Documentação técnica das APIs
- Diagramas de integração
- Collection para testes

USE as ferramentas Playwright/Puppeteer para interceptar requisições durante navegação pelos 17+ módulos identificados.
```

---

## 🗄️ **PROMPT 2: ENGENHARIA REVERSA DO BANCO DE DADOS**

```
Como especialista em banco de dados e engenharia reversa, analise o Portal MEEP para:

CONTEXTO:
- Sistema complexo com CRM (25.584 clientes), ERP, PDV, Financeiro
- Dados conhecidos: equipamentos (MP01608, MP01394...), produtos, fornecedores
- Valores: R$ 23.063,01 conta digital, 9 cardápios, 28+ equipamentos

MISSÃO:
1. **INFERIR ESTRUTURA DE BANCO**:
   - Tabelas principais (clientes, produtos, pedidos, etc.)
   - Relacionamentos entre entidades
   - Chaves primárias e estrangeiras
   - Índices prováveis

2. **ANALISAR DADOS VIA FRONTEND**:
   - Formulários → campos de banco
   - Grids/tabelas → estrutura de colunas
   - IDs únicos → chaves primárias
   - Dropdowns → tabelas de lookup

3. **MAPEAR ENTIDADES DE NEGÓCIO**:
```

CLIENTES: id, nome, cpf, email, telefone, data_nascimento, valor_aberto
PRODUTOS: id, nome, preco, categoria_id, cardapio_id, ncm, cest
EQUIPAMENTOS: id, modelo, serial (MP#####), perfil, licenca_ate
FINANCEIRO: conta_id, saldo_disponivel, saldo_retido, agencia, conta

```

4. **IDENTIFICAR RELACIONAMENTOS**:
- Cliente → Pedidos (1:N)
- Cardápio → Produtos (1:N)
- Produto → Categoria (N:1)
- Usuário → Permissões (N:M)

5. **GERAR DIAGRAMA ERD**:
- Modelo entidade-relacionamento
- Dicionário de dados
- Scripts de criação (DDL inferidos)

RESULTADO:
- ERD completo do sistema
- Dicionário de dados detalhado
- Scripts SQL inferidos
- Mapa de relacionamentos

BASEIE-SE nos dados já coletados (25.584 clientes, 9 cardápios, 28 equipamentos, etc.)
```

---

## 🔄 **PROMPT 3: MAPEAMENTO DE FLUXOS DE TRABALHO**

```
Como analista de processos e fluxos de sistema, mapeie os workflows completos do Portal MEEP:

CONTEXTO:
- 17+ módulos mapeados: Dashboard, Cardápios, Relatórios, Clientes, Financeiro, PDV, ERP, Estoque,
  Gestão de Venda, Marketing, BI, Equipe, Pedidos, Automação, Integração, Ingressos, Soluções Online
- Negócio: Entretenimento com múltiplos pontos de venda

MISSÃO:
1. **FLUXOS OPERACIONAIS**:
   - Cadastro de cliente → primeira compra → fidelização
   - Criação de cardápio → categorização → publicação
   - Venda no PDV → pagamento → fechamento de caixa
   - Pedido online → processamento → entrega

2. **FLUXOS FINANCEIROS**:
   - Recebimento → conta digital → saque/transfer
   - Conciliação bancária → relatórios → fechamento
   - Split de pagamento → antecipação → liquidação

3. **FLUXOS ADMINISTRATIVOS**:
   - Cadastro de funcionário → permissões → acesso
   - Configuração de equipamento → sincronização → operação
   - Criação de evento → venda de ingressos → controle de acesso

4. **FLUXOS DE INTEGRAÇÃO**:
   - Portal → PDV → sincronização
   - Sistema → APIs externas → webhooks
   - BI → coleta de dados → dashboards

5. **MAPEAMENTO DE DECISÕES**:
   - Pontos de aprovação
   - Validações automáticas
   - Notificações e alertas

RESULTADO:
- Diagramas BPMN dos principais fluxos
- Matriz de decisões
- Mapa de integrações
- Documentação de processos

IDENTIFIQUE gargalos, pontos de falha e oportunidades de automação.
```

---

## 🔒 **PROMPT 4: AUDITORIA DE SEGURANÇA**

```
Como especialista em segurança de aplicações web, conduza uma auditoria completa do Portal MEEP:

CONTEXTO:
- Sistema financeiro com conta digital (R$ 23.063,01)
- Dados sensíveis: 25.584 clientes, CPFs, dados financeiros
- Múltiplos usuários e níveis de acesso

MISSÃO:
1. **ANÁLISE DE AUTENTICAÇÃO**:
   - Método de login (credenciais, 2FA, SSO)
   - Gerenciamento de sessões
   - Políticas de senha
   - Timeout e expiração

2. **CONTROLE DE ACESSO**:
   - Mapeamento de perfis/roles
   - Permissões por módulo
   - Segregação de funções
   - Princípio do menor privilégio

3. **PROTEÇÃO DE DADOS**:
   - Criptografia em trânsito (HTTPS/TLS)
   - Criptografia em repouso
   - Mascaramento de dados sensíveis
   - Compliance PCI DSS

4. **VULNERABILIDADES TÉCNICAS**:
   - SQL Injection
   - XSS (Cross-Site Scripting)
   - CSRF (Cross-Site Request Forgery)
   - Exposição de dados sensíveis

5. **LOGS E AUDITORIA**:
   - Rastreamento de ações
   - Logs de acesso
   - Monitoramento de transações
   - Detecção de anomalias

RESULTADO:
- Relatório de vulnerabilidades
- Matriz de riscos
- Recomendações de segurança
- Plano de remediação

USE ferramentas como Burp Suite, OWASP ZAP para testes automatizados.
```

---

## 🏗️ **PROMPT 5: ARQUITETURA TÉCNICA E INFRAESTRUTURA**

```
Como arquiteto de sistemas, faça a análise completa da arquitetura do Portal MEEP:

CONTEXTO:
- URLs conhecidas: portal.meep.com.br, APIs Azure (.azurewebsites.net)
- Sistema distribuído com frontend web + APIs + banco de dados
- Integração com PDVs físicos

MISSÃO:
1. **STACK TECNOLÓGICO**:
   - Frontend: framework (React, Angular, Vue)
   - Backend: linguagem e framework
   - Banco de dados: tipo e versão
   - Infraestrutura cloud (Azure confirmado)

2. **ARQUITETURA DE SISTEMA**:
   - Padrão arquitetural (MVC, microserviços, monolito)
   - Separação frontend/backend
   - APIs RESTful vs GraphQL
   - Messaging/filas

3. **INFRAESTRUTURA CLOUD**:
   - Serviços Azure utilizados
   - CDN e cache
   - Load balancing
   - Auto-scaling

4. **INTEGRAÇÕES**:
   - PDVs → Portal sincronização
   - Gateways de pagamento
   - APIs bancárias
   - Serviços de terceiros

5. **PERFORMANCE E MONITORING**:
   - Tempos de resposta
   - Métricas de performance
   - Monitoramento e alertas
   - Backup e disaster recovery

RESULTADO:
- Diagrama de arquitetura
- Documentação técnica
- Análise de performance
- Recommendations técnicas

UTILIZE DevTools, Lighthouse, análise de network para identificar tecnologias.
```

---

## 📊 **PROMPT 6: SISTEMA DE BUSINESS INTELLIGENCE**

```
Como analista de BI, mapeie completamente o sistema de inteligência de negócio do Portal MEEP:

CONTEXTO:
- 11 tipos de relatórios identificados
- Módulo BI específico presente
- Dados: 25.584 clientes, vendas, financeiro, operacional

MISSÃO:
1. **RELATÓRIOS DISPONÍVEIS**:
   - Relatórios de venda (já identificados 11 tipos)
   - Relatórios financeiros
   - Relatórios operacionais
   - Dashboards executivos

2. **FONTES DE DADOS**:
   - Transações PDV
   - Vendas online
   - Dados financeiros
   - Métricas operacionais
   - Dados de clientes

3. **MÉTRICAS E KPIs**:
   - Vendas por período
   - Ticket médio
   - Frequência de clientes
   - ROI campanhas marketing
   - Performance por produto/categoria

4. **CAPACIDADES DE ANÁLISE**:
   - Filtros e segmentação
   - Drill-down/drill-up
   - Comparativos temporais
   - Análises preditivas

5. **EXPORTAÇÃO E COMPARTILHAMENTO**:
   - Formatos disponíveis (PDF, Excel, CSV)
   - Agendamento de relatórios
   - Dashboards em tempo real
   - APIs para BI

RESULTADO:
- Inventário completo de relatórios
- Dicionário de métricas
- Fluxo de dados BI
- Capacidades analíticas

EXPLORE cada relatório disponível e documente campos, filtros e insights gerados.
```

---

## 🔗 **PROMPT 7: MAPEAMENTO DE INTEGRAÇÕES**

```
Como especialista em integrações, mapeie todas as conexões externas do Portal MEEP:

CONTEXTO:
- Sistema integrado com PDVs físicos (28+ equipamentos)
- Funcionalidades financeiras (conta digital, pagamentos)
- Módulos específicos: Automação, Integração, Soluções Online

MISSÃO:
1. **INTEGRAÇÕES FINANCEIRAS**:
   - Gateways de pagamento (cartão, PIX, boleto)
   - APIs bancárias
   - Sistemas de antecipação
   - Split de pagamento

2. **INTEGRAÇÕES OPERACIONAIS**:
   - PDVs → Portal (sincronização)
   - Sistemas de delivery
   - Controle de estoque
   - Emissão de NFe/NFCe

3. **INTEGRAÇÕES DE MARKETING**:
   - Email marketing
   - SMS/WhatsApp
   - Redes sociais
   - CRM externo

4. **INTEGRAÇÕES TÉCNICAS**:
   - APIs públicas disponíveis
   - Webhooks configurados
   - Sistemas de terceiros
   - Marketplaces

5. **AUTOMAÇÕES**:
   - Triggers automáticos
   - Workflows integrados
   - Sincronização de dados
   - Notificações automáticas

RESULTADO:
- Mapa de integrações
- Documentação de APIs
- Fluxos de dados externos
- Oportunidades de integração

IDENTIFIQUE todas as conexões de entrada e saída do sistema.
```

---

## 🏢 **PROMPT 8: ANÁLISE DO MODELO DE NEGÓCIO**

```
Como consultor de negócios, analise o modelo de negócio completo por trás do Portal MEEP:

CONTEXTO:
- Empresa: NOVA UNICA CLUB (CNPJ: 46685267000241)
- Segmento: Entretenimento
- Base: 25.584 clientes, R$ 23.063,01 em conta digital

MISSÃO:
1. **MODELO DE RECEITA**:
   - Fontes de receita identificadas
   - Estrutura de pricing
   - Comissões e taxas
   - Modelos de assinatura

2. **PROPOSTA DE VALOR**:
   - Para clientes finais
   - Para estabelecimentos
   - Diferenciação competitiva
   - Benefícios únicos

3. **SEGMENTOS DE CLIENTE**:
   - Perfis de usuários
   - Personas identificadas
   - Comportamento de consumo
   - Jornada do cliente

4. **CANAIS DE DISTRIBUIÇÃO**:
   - Portal web
   - PDVs físicos
   - Apps mobile (se existir)
   - Parcerias

5. **ESTRUTURA OPERACIONAL**:
   - Recursos-chave
   - Parcerias estratégicas
   - Estrutura de custos
   - Processos críticos

RESULTADO:
- Business Model Canvas
- Análise de viabilidade
- Oportunidades de crescimento
- Recomendações estratégicas

BASEIE-SE nos 17+ módulos para inferir o modelo completo de negócio.
```

---

## 📄 **PROMPT 9: DOCUMENTAÇÃO TÉCNICA CONSOLIDADA**

```
Como technical writer, crie a documentação técnica completa do Portal MEEP:

CONTEXTO:
- Análises prévias dos prompts 1-8 concluídas
- 17+ módulos mapeados
- Arquitetura, APIs, banco de dados identificados

MISSÃO:
1. **DOCUMENTAÇÃO DE ARQUITETURA**:
   - Diagramas de sistema
   - Fluxos de dados
   - Componentes e dependências
   - Padrões de design

2. **DOCUMENTAÇÃO DE APIs**:
   - Especificação OpenAPI
   - Guias de integração
   - Exemplos de código
   - Rate limits e autenticação

3. **MANUAL DE USUÁRIO**:
   - Guias por módulo
   - Fluxos de trabalho
   - Troubleshooting
   - FAQ

4. **DOCUMENTAÇÃO TÉCNICA**:
   - Instalação e configuração
   - Ambiente de desenvolvimento
   - Deploy e CI/CD
   - Monitoramento

5. **GOVERNANÇA DE DADOS**:
   - Dicionário de dados
   - Políticas de retenção
   - Compliance e privacidade
   - Backup e recovery

RESULTADO:
- Portal-MEEP-Complete-Documentation.md
- API-Reference-Guide.json
- User-Manual.pdf
- Technical-Specifications.docx

CONSOLIDE todas as descobertas em documentação profissional e abrangente.
```

---

## 🎯 **PROMPT 10: ANÁLISE COMPETITIVA E POSICIONAMENTO**

```
Como analista de mercado, conduza análise competitiva completa do Portal MEEP:

CONTEXTO:
- Portal MEEP: sistema completo para entretenimento
- Funcionalidades: PDV, CRM, Financeiro, BI, Marketing, Automação
- Segmento: Entretenimento/eventos

MISSÃO:
1. **IDENTIFICAÇÃO DE CONCORRENTES**:
   - Concorrentes diretos (sistemas similares)
   - Concorrentes indiretos (soluções parciais)
   - Players internacionais
   - Startups emergentes

2. **ANÁLISE COMPARATIVA**:
   - Funcionalidades vs concorrentes
   - Pricing vs mercado
   - Tecnologia vs competição
   - UX/UI vs padrões

3. **FORÇAS E FRAQUEZAS**:
   - Vantagens competitivas
   - Gaps funcionais
   - Oportunidades de melhoria
   - Ameaças do mercado

4. **POSICIONAMENTO**:
   - Proposta única de valor
   - Diferenciação clara
   - Target market ideal
   - Estratégia de go-to-market

5. **TENDÊNCIAS DO MERCADO**:
   - Tecnologias emergentes
   - Mudanças regulatórias
   - Comportamento do consumidor
   - Oportunidades futuras

RESULTADO:
- Competitive-Analysis-Matrix.xlsx
- Market-Positioning-Report.pdf
- SWOT-Analysis.docx
- Strategic-Recommendations.pptx

COMPARE funcionalidades identificadas nos 17+ módulos com soluções do mercado.
```

---

## 🚀 **GUIA DE EXECUÇÃO SEQUENCIAL**

### **📋 ORDEM RECOMENDADA:**

1. **🔗 APIs** → Base técnica fundamental
2. **🗄️ Banco de Dados** → Estrutura de dados
3. **🔄 Fluxos** → Processos de negócio
4. **🔒 Segurança** → Auditoria crítica
5. **🏗️ Arquitetura** → Visão técnica completa
6. **📊 BI** → Inteligência de negócio
7. **🔗 Integrações** → Conectividade externa
8. **🏢 Modelo de Negócio** → Análise comercial
9. **📄 Documentação** → Consolidação
10. **🎯 Competitivo** → Posicionamento estratégico

### **⏱️ ESTIMATIVAS DE TEMPO:**

| Prompt       | Manual  | Automatizado | Híbrido |
| ------------ | ------- | ------------ | ------- |
| APIs         | 4h      | 1h           | 2h      |
| Banco        | 3h      | 2h           | 2h      |
| Fluxos       | 4h      | 2h           | 3h      |
| Segurança    | 6h      | 3h           | 4h      |
| Arquitetura  | 3h      | 1h           | 2h      |
| BI           | 2h      | 1h           | 1h      |
| Integrações  | 3h      | 2h           | 2h      |
| Negócio      | 4h      | N/A          | 3h      |
| Documentação | 6h      | 2h           | 4h      |
| Competitivo  | 5h      | N/A          | 3h      |
| **TOTAL**    | **40h** | **14h**      | **26h** |

### **🛠️ FERRAMENTAS RECOMENDADAS:**

- **Automação:** Playwright, Puppeteer
- **Segurança:** Burp Suite, OWASP ZAP
- **APIs:** Postman, Insomnia
- **Documentação:** Swagger, GitBook
- **Diagramas:** Draw.io, Lucidchart
- **Análise:** DevTools, Lighthouse

### **📊 DELIVERABLES FINAIS:**

1. **Portal-MEEP-Complete-Architecture.md** - Arquitetura completa
2. **Portal-MEEP-API-Documentation.json** - APIs documentadas
3. **Portal-MEEP-Security-Audit.pdf** - Auditoria de segurança
4. **Portal-MEEP-Business-Analysis.docx** - Análise de negócio
5. **Portal-MEEP-Competitive-Analysis.xlsx** - Análise competitiva
6. **Portal-MEEP-Technical-Specs.pdf** - Especificações técnicas

## 🎉 **RESULTADO FINAL**

Com estes **10 prompts especializados**, você terá a **ENGENHARIA REVERSA MAIS COMPLETA** possível do Portal MEEP, indo muito além dos 17+ módulos já mapeados e criando um **conhecimento 360° do sistema**! 🚀

**🏆 De análise superficial para ENGENHARIA REVERSA PROFISSIONAL COMPLETA!**
