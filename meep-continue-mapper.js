/**
 * MEEP CONTINUATION MAPPER
 * Automação para completar análise dos 16+ módulos pendentes do Portal MEEP
 * Baseado na análise manual já realizada de 8 módulos
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class MeepContinuationMapper {
    constructor(options = {}) {
        this.options = {
            debugPort: 9222,
            baseUrl: 'https://beta.portal.meep.com.br/private',
            outputDir: './MEEP-Continuation-Analysis',
            screenshots: options.screenshots || false,
            debug: options.debug || false,
            waitTime: 3000,
            ...options
        };

        // Módulos já analisados manualmente (não reprocessar)
        this.analyzedModules = new Set([
            'dashboard',
            'cardapio',
            'relatorios',
            'cadastros/clientes',
            'financeiro',
            'pdv',
            'meeperp',
            'estoque'
        ]);

        // Módulos pendentes para análise automatizada
        this.pendingModules = [
            // Principais módulos identificados
            'gestao-venda',
            'solucoes-online', 
            'ingressos',
            'equipe',
            'pedidos',
            'mapa-operacao',
            'marketing',
            'bi',
            'automacao',
            'integracao',
            
            // Submódulos específicos do financeiro
            'financeiro/permutas',
            'financeiro/antecipacao',
            'financeiro/taxas',
            'financeiro/split',
            'financeiro/estorno',
            
            // Submódulos específicos de relatórios
            'relatorios/cartoes',
            'relatorios/caixa',
            'relatorios/ficha',
            'relatorios/gerencial',
            'relatorios/financeiro',
            
            // Submódulos específicos do PDV
            'pdv/impressoras',
            'pdv/operador',
            
            // Submódulos específicos do ERP
            'meeperp/grupos-insumos',
            'meeperp/locais-estoque',
            'meeperp/unidades-medida',
            
            // Outros módulos identificados
            'cadastros/fornecedores',
            'cadastros/produtos',
            'configuracoes',
            'suporte',
            'notificacoes'
        ];

        this.discoveries = [];
        this.errors = [];
        this.stats = {
            modulesExplored: 0,
            dataPointsExtracted: 0,
            screenshotsTaken: 0,
            startTime: Date.now()
        };

        this.browser = null;
        this.page = null;
    }

    async initialize() {
        console.log('🚀 MEEP CONTINUATION MAPPER - Iniciando...');
        console.log('==========================================');
        console.log('📋 Objetivo: Analisar 16+ módulos pendentes automaticamente');
        console.log(`🎯 Conectando no Chrome debug port ${this.options.debugPort}...`);
        
        try {
            // Conectar no Chrome existente com debug port
            this.browser = await chromium.connectOverCDP(`http://localhost:${this.options.debugPort}`);
            
            // Usar contexto existente
            const contexts = this.browser.contexts();
            const context = contexts[0] || await this.browser.newContext();
            
            // Usar página existente ou criar nova
            const pages = context.pages();
            this.page = pages.find(p => p.url().includes('portal.meep.com.br')) || pages[0] || await context.newPage();
            
            console.log(`✅ Conectado ao Chrome - URL atual: ${this.page.url()}`);
            
            // Verificar se está logado
            await this.verifyLogin();
            
            // Criar diretórios de saída
            await this.createOutputDirectories();
            
            console.log('✅ Inicialização concluída!\n');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error.message);
            console.error('💡 Certifique-se de que o Chrome está aberto com --remote-debugging-port=9222');
            throw error;
        }
    }

    async verifyLogin() {
        const currentUrl = this.page.url();
        console.log(`📍 URL atual: ${currentUrl}`);
        
        // Se já está na área privada, ótimo!
        if (currentUrl.includes('/private/')) {
            console.log('✅ Login verificado - Já está na área privada');
            return;
        }
        
        // Se está na página inicial logada, navegar para dashboard
        if (currentUrl.includes('portal.meep.com.br') && !currentUrl.includes('login')) {
            console.log('📍 Navegando para dashboard...');
            await this.page.goto('https://beta.portal.meep.com.br/private/dashboard/general', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            
            const newUrl = this.page.url();
            if (newUrl.includes('/private/')) {
                console.log('✅ Login verificado - Acesso à área privada confirmado');
                return;
            }
        }
        
        // Verificar se há elementos de usuário logado (sidebar, menu, avatar)
        try {
            await this.page.waitForSelector('[data-testid="sidebar"], .sidebar, nav, [class*="user"], [class*="avatar"]', { 
                timeout: 5000 
            });
            console.log('✅ Login verificado - Elementos de usuário logado encontrados');
            
            // Tentar navegar para dashboard
            await this.page.goto('https://beta.portal.meep.com.br/private/dashboard/general', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            
        } catch (error) {
            console.log('⚠️ Sessão pode estar expirada ou login necessário');
            console.log('💡 INSTRUÇÕES:');
            console.log('1. Abra uma nova aba no Chrome');
            console.log('2. Vá para: https://beta.portal.meep.com.br');
            console.log('3. Faça login com: toretomal@icloud.com / 352162Cl@');
            console.log('4. Aguarde carregar o dashboard');
            console.log('5. Execute o script novamente');
            throw new Error('Login necessário - Siga as instruções acima');
        }
    }

    async createOutputDirectories() {
        const dirs = [
            this.options.outputDir,
            path.join(this.options.outputDir, 'screenshots'),
            path.join(this.options.outputDir, 'modules'),
            path.join(this.options.outputDir, 'data')
        ];
        
        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    async exploreModule(modulePath) {
        console.log(`🔍 Explorando módulo: ${modulePath}`);
        
        try {
            const fullUrl = `${this.options.baseUrl}/${modulePath}`;
            
            // Navegar para o módulo
            await this.page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
            await this.page.waitForTimeout(this.options.waitTime);
            
            const moduleData = await this.analyzeCurrentPage(modulePath);
            
            // Explorar submódulos/abas se existirem
            const subModules = await this.discoverSubModules();
            
            for (const subModule of subModules) {
                try {
                    console.log(`  📄 Explorando submódulo: ${subModule.name}`);
                    await this.page.click(subModule.selector);
                    await this.page.waitForTimeout(2000);
                    
                    const subModuleData = await this.analyzeCurrentPage(`${modulePath}/${subModule.name}`);
                    moduleData.subModules = moduleData.subModules || [];
                    moduleData.subModules.push(subModuleData);
                    
                } catch (subError) {
                    console.log(`    ⚠️ Erro em submódulo ${subModule.name}: ${subError.message}`);
                }
            }
            
            this.discoveries.push(moduleData);
            this.stats.modulesExplored++;
            
            console.log(`  ✅ ${moduleData.elementCounts.total} elementos analisados`);
            
            return moduleData;
            
        } catch (error) {
            console.log(`  ❌ Erro no módulo ${modulePath}: ${error.message}`);
            this.errors.push({ module: modulePath, error: error.message });
            return null;
        }
    }

    async analyzeCurrentPage(modulePath) {
        const url = this.page.url();
        const title = await this.page.title();
        
        // Screenshot se habilitado
        let screenshotPath = null;
        if (this.options.screenshots) {
            screenshotPath = path.join(this.options.outputDir, 'screenshots', `${modulePath.replace(/\//g, '-')}.png`);
            await this.page.screenshot({ path: screenshotPath, fullPage: true });
            this.stats.screenshotsTaken++;
        }
        
        // Extrair dados da página
        const pageData = await this.page.evaluate(() => {
            const results = {
                businessData: {},
                elements: {
                    buttons: [],
                    inputs: [],
                    tables: [],
                    cards: [],
                    metrics: [],
                    links: []
                },
                features: []
            };
            
            // Função para extrair texto limpo
            function getCleanText(element) {
                return element.textContent?.trim().replace(/\s+/g, ' ').substring(0, 200) || '';
            }
            
            // Função para extrair números e valores monetários
            function extractNumbers(text) {
                const numbers = text.match(/[\d.,]+/g) || [];
                const currency = text.match(/R\$\s*[\d.,]+/g) || [];
                return { numbers, currency };
            }
            
            // Buscar métricas e valores (números grandes, valores monetários, contadores)
            document.querySelectorAll('*').forEach(elem => {
                const text = getCleanText(elem);
                
                // Detectar métricas (números grandes isolados)
                if (/^\d{1,3}([\.,]\d{3})*$/.test(text) && parseInt(text.replace(/\D/g, '')) > 100) {
                    results.businessData.metrics = results.businessData.metrics || [];
                    results.businessData.metrics.push({
                        value: text,
                        context: getCleanText(elem.parentElement || elem),
                        element: elem.tagName
                    });
                }
                
                // Detectar valores monetários
                if (/R\$\s*[\d.,]+/.test(text)) {
                    results.businessData.financial = results.businessData.financial || [];
                    results.businessData.financial.push({
                        value: text.match(/R\$\s*[\d.,]+/g)[0],
                        context: text,
                        element: elem.tagName
                    });
                }
                
                // Detectar IDs únicos (códigos, identificadores)
                if (/MP\d+|ID\d+|#\d+|\b[A-Z]{2,}\d+/.test(text)) {
                    results.businessData.identifiers = results.businessData.identifiers || [];
                    results.businessData.identifiers.push({
                        id: text.match(/MP\d+|ID\d+|#\d+|\b[A-Z]{2,}\d+/g)[0],
                        context: text,
                        element: elem.tagName
                    });
                }
            });
            
            // Analisar botões e ações
            document.querySelectorAll('button, [role="button"], a[href]').forEach(btn => {
                const text = getCleanText(btn);
                if (text.length > 0) {
                    results.elements.buttons.push({
                        text: text,
                        type: btn.tagName,
                        href: btn.href || null,
                        classes: btn.className,
                        disabled: btn.disabled
                    });
                    
                    // Identificar funcionalidades pelos botões
                    if (/criar|adicionar|novo/i.test(text)) {
                        results.features.push({ type: 'create', description: `Criar/Adicionar: ${text}` });
                    } else if (/editar|alterar|modificar/i.test(text)) {
                        results.features.push({ type: 'update', description: `Editar: ${text}` });
                    } else if (/excluir|deletar|remover/i.test(text)) {
                        results.features.push({ type: 'delete', description: `Excluir: ${text}` });
                    } else if (/exportar|baixar|download/i.test(text)) {
                        results.features.push({ type: 'export', description: `Exportar: ${text}` });
                    } else if (/filtrar|buscar|pesquisar/i.test(text)) {
                        results.features.push({ type: 'search', description: `Buscar: ${text}` });
                    }
                }
            });
            
            // Analisar inputs e formulários
            document.querySelectorAll('input, textarea, select').forEach(input => {
                results.elements.inputs.push({
                    type: input.type || 'text',
                    name: input.name,
                    placeholder: input.placeholder,
                    value: input.value?.substring(0, 50) || '',
                    required: input.required
                });
            });
            
            // Analisar tabelas
            document.querySelectorAll('table').forEach(table => {
                const headers = Array.from(table.querySelectorAll('th')).map(th => getCleanText(th));
                const rowCount = table.querySelectorAll('tbody tr').length;
                
                if (headers.length > 0 || rowCount > 0) {
                    results.elements.tables.push({
                        headers: headers,
                        rowCount: rowCount,
                        hasData: rowCount > 0
                    });
                    
                    if (rowCount > 0) {
                        results.features.push({ 
                            type: 'data_listing', 
                            description: `Tabela com ${rowCount} registros` 
                        });
                    }
                }
            });
            
            // Analisar cards/widgets
            document.querySelectorAll('.card, .widget, [class*="card"], [class*="widget"]').forEach(card => {
                const text = getCleanText(card);
                if (text.length > 10) {
                    results.elements.cards.push({
                        content: text.substring(0, 100),
                        classes: card.className
                    });
                }
            });
            
            return results;
        });
        
        // Contar elementos
        const elementCounts = {
            buttons: pageData.elements.buttons.length,
            inputs: pageData.elements.inputs.length,
            tables: pageData.elements.tables.length,
            cards: pageData.elements.cards.length,
            total: Object.values(pageData.elements).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
        };
        
        this.stats.dataPointsExtracted += elementCounts.total;
        
        // Extrair dados específicos de negócio baseados no contexto
        const businessInsights = this.extractBusinessInsights(pageData, modulePath);
        
        return {
            module: modulePath,
            url,
            title,
            timestamp: Date.now(),
            screenshot: screenshotPath,
            businessData: pageData.businessData,
            businessInsights,
            elements: pageData.elements,
            features: pageData.features,
            elementCounts
        };
    }

    extractBusinessInsights(pageData, modulePath) {
        const insights = {
            category: this.categorizeModule(modulePath),
            keyMetrics: [],
            businessValue: '',
            integrations: []
        };
        
        // Categorizar insights baseado no módulo
        switch (insights.category) {
            case 'sales':
                insights.businessValue = 'Gestão de vendas e processos comerciais';
                break;
            case 'marketing':
                insights.businessValue = 'Campanhas e relacionamento com clientes';
                break;
            case 'finance':
                insights.businessValue = 'Gestão financeira e fluxo de caixa';
                break;
            case 'operations':
                insights.businessValue = 'Operações e logística';
                break;
            case 'analytics':
                insights.businessValue = 'Análise de dados e inteligência de negócio';
                break;
            case 'management':
                insights.businessValue = 'Gestão de equipe e recursos humanos';
                break;
            default:
                insights.businessValue = 'Funcionalidade específica do sistema';
        }
        
        // Extrair métricas principais
        if (pageData.businessData.metrics) {
            insights.keyMetrics = pageData.businessData.metrics.slice(0, 5);
        }
        
        // Identificar possíveis integrações
        pageData.elements.buttons.forEach(btn => {
            if (/integra|api|webhook|conectar/i.test(btn.text)) {
                insights.integrations.push(btn.text);
            }
        });
        
        return insights;
    }

    categorizeModule(modulePath) {
        const categories = {
            'gestao-venda': 'sales',
            'marketing': 'marketing', 
            'financeiro': 'finance',
            'pedidos': 'operations',
            'bi': 'analytics',
            'equipe': 'management',
            'automacao': 'automation',
            'integracao': 'integration'
        };
        
        for (const [key, category] of Object.entries(categories)) {
            if (modulePath.includes(key)) {
                return category;
            }
        }
        
        return 'other';
    }

    async discoverSubModules() {
        const subModules = [];
        
        try {
            // Buscar abas/tabs
            const tabs = await this.page.locator('[role="tab"], .tab, .nav-link, [class*="tab"]').all();
            
            for (const tab of tabs) {
                try {
                    const text = await tab.textContent();
                    if (text && text.trim().length > 0) {
                        subModules.push({
                            name: text.trim().toLowerCase().replace(/\s+/g, '-'),
                            selector: await tab.locator('xpath=.').first().innerHTML(),
                            text: text.trim()
                        });
                    }
                } catch (e) {
                    // Ignorar erros em tabs individuais
                }
            }
            
            // Buscar links de navegação lateral
            const navLinks = await this.page.locator('nav a, .sidebar a, [class*="nav"] a').all();
            
            for (const link of navLinks) {
                try {
                    const text = await link.textContent();
                    const href = await link.getAttribute('href');
                    
                    if (text && href && href.includes('/private/')) {
                        subModules.push({
                            name: text.trim().toLowerCase().replace(/\s+/g, '-'),
                            selector: await link.locator('xpath=.').first().innerHTML(),
                            text: text.trim(),
                            href: href
                        });
                    }
                } catch (e) {
                    // Ignorar erros
                }
            }
            
        } catch (error) {
            if (this.options.debug) {
                console.log(`    Debug: Erro ao buscar submódulos: ${error.message}`);
            }
        }
        
        return subModules.slice(0, 5); // Limitar para evitar loops
    }

    async runContinuationAnalysis() {
        console.log('📊 EXECUTANDO ANÁLISE DE CONTINUAÇÃO');
        console.log('===================================');
        console.log(`🎯 Módulos a explorar: ${this.pendingModules.length}`);
        console.log(`⏰ Estimativa: ${Math.ceil(this.pendingModules.length * 30 / 60)} minutos\n`);
        
        // Explorar cada módulo pendente
        for (let i = 0; i < this.pendingModules.length; i++) {
            const module = this.pendingModules[i];
            console.log(`[${i + 1}/${this.pendingModules.length}] Processando: ${module}`);
            
            await this.exploreModule(module);
            
            // Pequena pausa entre módulos
            await this.page.waitForTimeout(1000);
        }
        
        // Gerar relatórios
        await this.generateReports();
        
        // Mostrar estatísticas finais
        this.showFinalStats();
    }

    async generateReports() {
        console.log('\n📊 GERANDO RELATÓRIOS...');
        
        const report = {
            metadata: {
                generatedAt: new Date().toISOString(),
                totalModulesExplored: this.stats.modulesExplored,
                totalDataPoints: this.stats.dataPointsExtracted,
                duration: Date.now() - this.stats.startTime,
                errors: this.errors.length
            },
            summary: {
                newModulesDiscovered: this.discoveries.length,
                keyFindings: this.extractKeyFindings(),
                businessValue: this.calculateBusinessValue()
            },
            discoveries: this.discoveries,
            errors: this.errors
        };
        
        // Salvar JSON detalhado
        await fs.writeFile(
            path.join(this.options.outputDir, 'MEEP-New-Discoveries.json'),
            JSON.stringify(report, null, 2)
        );
        
        // Gerar relatório Markdown
        const markdown = this.generateMarkdownReport(report);
        await fs.writeFile(
            path.join(this.options.outputDir, 'MEEP-Continuation-Report.md'),
            markdown
        );
        
        // Gerar CSV para análise
        const csv = this.generateCSVReport();
        await fs.writeFile(
            path.join(this.options.outputDir, 'MEEP-New-Modules.csv'),
            csv
        );
        
        console.log('✅ Relatórios gerados com sucesso!');
    }

    extractKeyFindings() {
        const findings = [];
        
        // Agrupar por categoria
        const categories = {};
        this.discoveries.forEach(discovery => {
            const category = discovery.businessInsights.category;
            if (!categories[category]) categories[category] = [];
            categories[category].push(discovery);
        });
        
        // Extrair principais achados por categoria
        Object.entries(categories).forEach(([category, modules]) => {
            const totalElements = modules.reduce((sum, m) => sum + m.elementCounts.total, 0);
            const totalFeatures = modules.reduce((sum, m) => sum + m.features.length, 0);
            
            findings.push({
                category,
                modulesCount: modules.length,
                totalElements,
                totalFeatures,
                businessValue: modules[0]?.businessInsights.businessValue || 'N/A'
            });
        });
        
        return findings;
    }

    calculateBusinessValue() {
        const businessMetrics = {
            automationPotential: 0,
            dataRichness: 0,
            integrationCapability: 0,
            userEngagement: 0
        };
        
        this.discoveries.forEach(discovery => {
            // Calcular potencial de automação baseado em formulários e botões
            const formElements = discovery.elementCounts.inputs + discovery.elementCounts.buttons;
            businessMetrics.automationPotential += formElements;
            
            // Calcular riqueza de dados baseado em tabelas e métricas
            const dataElements = discovery.elementCounts.tables + (discovery.businessData.metrics?.length || 0);
            businessMetrics.dataRichness += dataElements;
            
            // Calcular capacidade de integração baseado em APIs/webhooks identificados
            const integrationElements = discovery.businessInsights.integrations.length;
            businessMetrics.integrationCapability += integrationElements;
            
            // Calcular engajamento baseado em funcionalidades
            businessMetrics.userEngagement += discovery.features.length;
        });
        
        return businessMetrics;
    }

    generateMarkdownReport(report) {
        const md = [];
        
        md.push('# MEEP Portal - Análise de Continuação Automatizada');
        md.push('');
        md.push('## 📊 Resumo Executivo');
        md.push('');
        md.push(`- **Data da Análise**: ${report.metadata.generatedAt}`);
        md.push(`- **Módulos Explorados**: ${report.metadata.totalModulesExplored}`);
        md.push(`- **Pontos de Dados Extraídos**: ${report.metadata.totalDataPoints}`);
        md.push(`- **Duração**: ${Math.round(report.metadata.duration / 1000)}s`);
        md.push(`- **Erros Encontrados**: ${report.metadata.errors}`);
        md.push('');
        
        md.push('## 🎯 Principais Descobertas');
        md.push('');
        report.summary.keyFindings.forEach(finding => {
            md.push(`### ${finding.category.toUpperCase()}`);
            md.push(`- **Módulos**: ${finding.modulesCount}`);
            md.push(`- **Elementos**: ${finding.totalElements}`);
            md.push(`- **Funcionalidades**: ${finding.totalFeatures}`);
            md.push(`- **Valor de Negócio**: ${finding.businessValue}`);
            md.push('');
        });
        
        md.push('## 📋 Módulos Analisados');
        md.push('');
        md.push('| Módulo | Elementos | Funcionalidades | Categoria | Valor de Negócio |');
        md.push('|--------|-----------|------------------|-----------|------------------|');
        
        this.discoveries.forEach(discovery => {
            const module = discovery.module;
            const elements = discovery.elementCounts.total;
            const features = discovery.features.length;
            const category = discovery.businessInsights.category;
            const value = discovery.businessInsights.businessValue.substring(0, 50);
            
            md.push(`| ${module} | ${elements} | ${features} | ${category} | ${value}... |`);
        });
        md.push('');
        
        md.push('## 💰 Análise de Valor de Negócio');
        md.push('');
        const businessValue = report.summary.businessValue;
        md.push(`- **Potencial de Automação**: ${businessValue.automationPotential} elementos automatizáveis`);
        md.push(`- **Riqueza de Dados**: ${businessValue.dataRichness} fontes de dados identificadas`);
        md.push(`- **Capacidade de Integração**: ${businessValue.integrationCapability} pontos de integração`);
        md.push(`- **Engajamento do Usuário**: ${businessValue.userEngagement} funcionalidades interativas`);
        md.push('');
        
        md.push('## 🔍 Detalhes por Módulo');
        md.push('');
        
        this.discoveries.forEach((discovery, index) => {
            md.push(`### ${index + 1}. ${discovery.module}`);
            md.push('');
            md.push(`- **URL**: ${discovery.url}`);
            md.push(`- **Título**: ${discovery.title}`);
            md.push(`- **Categoria**: ${discovery.businessInsights.category}`);
            md.push(`- **Elementos Totais**: ${discovery.elementCounts.total}`);
            md.push('');
            
            if (discovery.features.length > 0) {
                md.push('**Funcionalidades Identificadas:**');
                discovery.features.slice(0, 5).forEach(feature => {
                    md.push(`- ${feature.description}`);
                });
                md.push('');
            }
            
            if (discovery.businessData.metrics && discovery.businessData.metrics.length > 0) {
                md.push('**Métricas de Negócio:**');
                discovery.businessData.metrics.slice(0, 3).forEach(metric => {
                    md.push(`- ${metric.value}: ${metric.context}`);
                });
                md.push('');
            }
        });
        
        if (this.errors.length > 0) {
            md.push('## ⚠️ Erros Encontrados');
            md.push('');
            this.errors.forEach(error => {
                md.push(`- **${error.module}**: ${error.error}`);
            });
            md.push('');
        }
        
        md.push('---');
        md.push('*Relatório gerado automaticamente pelo MEEP Continuation Mapper*');
        
        return md.join('\n');
    }

    generateCSVReport() {
        const headers = [
            'Módulo',
            'URL',
            'Título',
            'Categoria',
            'Total Elementos',
            'Botões',
            'Inputs',
            'Tabelas',
            'Funcionalidades',
            'Métricas Negócio',
            'Valor de Negócio',
            'Status'
        ].join(',');
        
        const rows = this.discoveries.map(discovery => {
            return [
                `"${discovery.module}"`,
                `"${discovery.url}"`,
                `"${discovery.title}"`,
                `"${discovery.businessInsights.category}"`,
                discovery.elementCounts.total,
                discovery.elementCounts.buttons,
                discovery.elementCounts.inputs,
                discovery.elementCounts.tables,
                discovery.features.length,
                discovery.businessData.metrics?.length || 0,
                `"${discovery.businessInsights.businessValue}"`,
                '"Sucesso"'
            ].join(',');
        });
        
        const errorRows = this.errors.map(error => {
            return [
                `"${error.module}"`,
                '""',
                '""',
                '"erro"',
                0, 0, 0, 0, 0, 0,
                `"${error.error}"`,
                '"Erro"'
            ].join(',');
        });
        
        return [headers, ...rows, ...errorRows].join('\n');
    }

    showFinalStats() {
        const duration = Math.round((Date.now() - this.stats.startTime) / 1000);
        
        console.log('\n🎉 ANÁLISE DE CONTINUAÇÃO FINALIZADA!');
        console.log('===================================');
        console.log(`⏱️  Duração Total: ${duration}s`);
        console.log(`📊 Módulos Explorados: ${this.stats.modulesExplored}`);
        console.log(`🔍 Pontos de Dados: ${this.stats.dataPointsExtracted}`);
        console.log(`📸 Screenshots: ${this.stats.screenshotsTaken}`);
        console.log(`❌ Erros: ${this.errors.length}`);
        console.log('');
        console.log('📁 ARQUIVOS GERADOS:');
        console.log(`   📋 ${this.options.outputDir}/MEEP-Continuation-Report.md`);
        console.log(`   📊 ${this.options.outputDir}/MEEP-New-Discoveries.json`);
        console.log(`   📈 ${this.options.outputDir}/MEEP-New-Modules.csv`);
        if (this.options.screenshots) {
            console.log(`   📸 ${this.options.outputDir}/screenshots/`);
        }
        console.log('');
        console.log('🚀 PRÓXIMOS PASSOS:');
        console.log('   1. Revisar relatório Markdown para insights de negócio');
        console.log('   2. Analisar dados JSON para integração técnica');
        console.log('   3. Usar CSV para análise quantitativa');
        console.log('   4. Combinar com análise manual para visão completa');
        console.log('');
        console.log('✅ Análise de continuação completa! 🎯');
    }

    async cleanup() {
        if (this.browser && !this.browser.isConnected()) {
            try {
                await this.browser.close();
            } catch (e) {
                // Ignorar erros de cleanup
            }
        }
    }
}

// Função principal
async function main() {
    const args = process.argv.slice(2);
    
    const options = {
        screenshots: args.includes('--screenshots'),
        debug: args.includes('--debug')
    };
    
    // Filtrar módulos específicos se especificado
    if (args.includes('--modules')) {
        const moduleArg = args.find(arg => arg.startsWith('--modules='));
        if (moduleArg) {
            const specificModules = moduleArg.split('=')[1].split(',');
            options.specificModules = specificModules;
        }
    }
    
    const mapper = new MeepContinuationMapper(options);
    
    try {
        await mapper.initialize();
        
        // Se módulos específicos foram especificados, usar apenas eles
        if (options.specificModules) {
            mapper.pendingModules = options.specificModules;
            console.log(`🎯 Análise limitada aos módulos: ${options.specificModules.join(', ')}\n`);
        }
        
        await mapper.runContinuationAnalysis();
        
    } catch (error) {
        console.error('\n❌ Erro durante execução:', error.message);
        
        if (error.message.includes('connect')) {
            console.error('💡 SOLUÇÃO: Abra o Chrome com debug port:');
            console.error('   google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug');
        } else if (error.message.includes('Login')) {
            console.error('💡 SOLUÇÃO: Faça login no Portal MEEP manualmente primeiro');
        }
        
    } finally {
        await mapper.cleanup();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = MeepContinuationMapper;
