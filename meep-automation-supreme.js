/**
 * MEEP AUTOMATION SUPREME
 * Sistema completo de engenharia reversa e mapeamento do Portal MEEP
 * Análise abrangente com login automático e documentação completa
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class MeepAutomationSupreme {
    constructor(options = {}) {
        this.options = {
            headless: false, // Manter visível para debug
            baseUrl: 'https://beta.portal.meep.com.br',
            outputDir: './meep-analysis-results',
            screenshotDir: './meep-screenshots',
            maxDepth: 5, // Profundidade máxima de navegação
            waitTimeout: 30000,
            ...options
        };
        
        this.browser = null;
        this.page = null;
        this.discoveredPages = new Set();
        this.analysisResults = {};
        this.apiCalls = [];
        this.navigationFlow = [];
        
        // Contadores para estatísticas
        this.stats = {
            pagesAnalyzed: 0,
            elementsFound: 0,
            apisDiscovered: 0,
            functionalitiesIdentified: 0,
            startTime: Date.now()
        };
    }

    async initialize() {
        console.log('🚀 Iniciando MEEP Automation Supreme...');
        
        // Criar diretórios de saída
        await this.createOutputDirectories();
        
        // Configurar browser com stealth mode
        this.browser = await chromium.launch({
            headless: this.options.headless,
            args: [
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--disable-extensions-except=',
                '--disable-extensions',
                '--disable-default-apps',
                '--disable-component-extensions-with-background-pages',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ],
            viewport: { width: 1920, height: 1080 }
        });

        const context = await this.browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        this.page = await context.newPage();
        
        // Configurar interceptação de rede
        await this.setupNetworkInterception();
        
        console.log('✅ Browser inicializado com sucesso');
    }

    async createOutputDirectories() {
        const dirs = [
            this.options.outputDir,
            this.options.screenshotDir,
            path.join(this.options.outputDir, 'pages'),
            path.join(this.options.outputDir, 'elements'),
            path.join(this.options.outputDir, 'apis'),
            path.join(this.options.outputDir, 'reports')
        ];
        
        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    async setupNetworkInterception() {
        this.page.on('request', request => {
            const url = request.url();
            const method = request.method();
            const headers = request.headers();
            
            // Capturar apenas requests relevantes (API calls)
            if (url.includes('/api/') || url.includes('/graphql') || 
                url.includes('.json') || method !== 'GET') {
                this.apiCalls.push({
                    url,
                    method,
                    headers,
                    timestamp: Date.now(),
                    page: this.page.url()
                });
            }
        });

        this.page.on('response', response => {
            const request = response.request();
            const url = request.url();
            
            if (url.includes('/api/') || url.includes('/graphql') || url.includes('.json')) {
                const apiCall = this.apiCalls.find(call => 
                    call.url === url && call.timestamp > Date.now() - 5000
                );
                
                if (apiCall) {
                    apiCall.status = response.status();
                    apiCall.statusText = response.statusText();
                    apiCall.responseHeaders = response.headers();
                }
            }
        });
    }

    async performLogin(username, password) {
        console.log('🔐 Realizando login no sistema MEEP...');
        
        try {
            // Navegar para a página de login
            await this.page.goto(this.options.baseUrl, { waitUntil: 'networkidle' });
            await this.page.waitForTimeout(2000);
            
            // Capturar screenshot da página de login
            await this.page.screenshot({ 
                path: path.join(this.options.screenshotDir, '01-login-page.png'),
                fullPage: true 
            });
            
            // Encontrar campos de login
            const usernameField = await this.page.locator('input[type="email"], input[name*="email"], input[name*="username"], input[name*="login"]').first();
            const passwordField = await this.page.locator('input[type="password"]').first();
            const loginButton = await this.page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login"), input[type="submit"]').first();
            
            if (await usernameField.isVisible() && await passwordField.isVisible()) {
                await usernameField.fill(username);
                await passwordField.fill(password);
                
                // Screenshot antes do login
                await this.page.screenshot({ 
                    path: path.join(this.options.screenshotDir, '02-before-login.png'),
                    fullPage: true 
                });
                
                await loginButton.click();
                
                // Aguardar redirecionamento após login
                await this.page.waitForTimeout(3000);
                await this.page.waitForLoadState('networkidle');
                
                // Screenshot após login
                await this.page.screenshot({ 
                    path: path.join(this.options.screenshotDir, '03-after-login.png'),
                    fullPage: true 
                });
                
                // Verificar se login foi bem-sucedido
                const currentUrl = this.page.url();
                if (currentUrl !== this.options.baseUrl && !currentUrl.includes('login')) {
                    console.log('✅ Login realizado com sucesso!');
                    console.log(`📍 URL atual: ${currentUrl}`);
                    return true;
                } else {
                    throw new Error('Login falhou - ainda na página de login');
                }
            } else {
                throw new Error('Campos de login não encontrados');
            }
        } catch (error) {
            console.error('❌ Erro durante login:', error.message);
            await this.page.screenshot({ 
                path: path.join(this.options.screenshotDir, '00-login-error.png'),
                fullPage: true 
            });
            throw error;
        }
    }

    async discoverAllPages() {
        console.log('🕵️ Descobrindo todas as páginas do sistema...');
        
        const startUrl = this.page.url();
        const urlsToAnalyze = [startUrl];
        const analyzedUrls = new Set();
        
        while (urlsToAnalyze.length > 0) {
            const currentUrl = urlsToAnalyze.shift();
            
            if (analyzedUrls.has(currentUrl) || !currentUrl.includes('portal.meep.com.br')) {
                continue;
            }
            
            try {
                console.log(`📄 Analisando: ${currentUrl}`);
                await this.page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 30000 });
                await this.page.waitForTimeout(2000);
                
                analyzedUrls.add(currentUrl);
                this.discoveredPages.add(currentUrl);
                
                // Encontrar todos os links na página
                const links = await this.page.locator('a[href]').all();
                
                for (const link of links) {
                    try {
                        const href = await link.getAttribute('href');
                        if (href) {
                            let fullUrl;
                            if (href.startsWith('/')) {
                                fullUrl = new URL(href, this.options.baseUrl).href;
                            } else if (href.startsWith('http')) {
                                fullUrl = href;
                            } else {
                                fullUrl = new URL(href, currentUrl).href;
                            }
                            
                            if (fullUrl.includes('portal.meep.com.br') && 
                                !analyzedUrls.has(fullUrl) && 
                                !urlsToAnalyze.includes(fullUrl)) {
                                urlsToAnalyze.push(fullUrl);
                            }
                        }
                    } catch (linkError) {
                        // Ignorar erros em links individuais
                    }
                }
                
                // Também procurar por navigation items, menu items, etc.
                const navItems = await this.page.locator('[role="navigation"] a, .nav a, .menu a, .sidebar a').all();
                for (const navItem of navItems) {
                    try {
                        const href = await navItem.getAttribute('href');
                        if (href && href.startsWith('/')) {
                            const fullUrl = new URL(href, this.options.baseUrl).href;
                            if (!analyzedUrls.has(fullUrl) && !urlsToAnalyze.includes(fullUrl)) {
                                urlsToAnalyze.push(fullUrl);
                            }
                        }
                    } catch (navError) {
                        // Ignorar erros
                    }
                }
                
            } catch (error) {
                console.log(`⚠️ Erro ao analisar ${currentUrl}: ${error.message}`);
            }
            
            // Limite de segurança
            if (analyzedUrls.size > 50) {
                console.log('🛑 Limite de páginas atingido (50), parando descoberta');
                break;
            }
        }
        
        console.log(`✅ Descoberta concluída: ${this.discoveredPages.size} páginas encontradas`);
        return Array.from(this.discoveredPages);
    }

    async analyzePageElements(url) {
        console.log(`🔍 Analisando elementos da página: ${url}`);
        
        try {
            await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            await this.page.waitForTimeout(2000);
            
            const pageTitle = await this.page.title();
            const urlPath = new URL(url).pathname;
            const timestamp = Date.now();
            
            // Capturar screenshot da página
            const screenshotPath = path.join(this.options.screenshotDir, `page-${this.stats.pagesAnalyzed + 1}-${urlPath.replace(/\//g, '-')}.png`);
            await this.page.screenshot({ path: screenshotPath, fullPage: true });
            
            // Análise detalhada de elementos
            const elements = await this.page.evaluate(() => {
                const results = {
                    buttons: [],
                    inputs: [],
                    links: [],
                    forms: [],
                    modals: [],
                    tables: [],
                    lists: [],
                    images: [],
                    text: [],
                    interactive: []
                };
                
                // Função auxiliar para obter seletor único
                function getUniqueSelector(element) {
                    if (element.id) return `#${element.id}`;
                    if (element.className) {
                        const classes = element.className.split(' ').filter(c => c.length > 0);
                        if (classes.length > 0) return `.${classes.join('.')}`;
                    }
                    return element.tagName.toLowerCase();
                }
                
                // Função auxiliar para extrair texto relevante
                function getElementText(element) {
                    return element.textContent?.trim().substring(0, 100) || '';
                }
                
                // Analisar botões
                document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"]').forEach(btn => {
                    results.buttons.push({
                        selector: getUniqueSelector(btn),
                        text: getElementText(btn),
                        type: btn.type || 'button',
                        disabled: btn.disabled,
                        visible: btn.offsetParent !== null,
                        classes: btn.className,
                        attributes: Array.from(btn.attributes).map(attr => ({ name: attr.name, value: attr.value }))
                    });
                });
                
                // Analisar inputs
                document.querySelectorAll('input, textarea, select').forEach(input => {
                    results.inputs.push({
                        selector: getUniqueSelector(input),
                        type: input.type || 'text',
                        name: input.name,
                        placeholder: input.placeholder,
                        required: input.required,
                        disabled: input.disabled,
                        value: input.value?.substring(0, 50) || '',
                        classes: input.className,
                        label: input.labels?.[0]?.textContent || ''
                    });
                });
                
                // Analisar links
                document.querySelectorAll('a[href]').forEach(link => {
                    results.links.push({
                        selector: getUniqueSelector(link),
                        text: getElementText(link),
                        href: link.href,
                        target: link.target,
                        classes: link.className,
                        internal: link.href.includes(window.location.hostname)
                    });
                });
                
                // Analisar formulários
                document.querySelectorAll('form').forEach(form => {
                    const inputs = Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
                        type: input.type,
                        name: input.name,
                        required: input.required
                    }));
                    
                    results.forms.push({
                        selector: getUniqueSelector(form),
                        action: form.action,
                        method: form.method,
                        inputs: inputs,
                        classes: form.className
                    });
                });
                
                // Analisar modais (elementos com papel de dialog)
                document.querySelectorAll('[role="dialog"], .modal, .popup').forEach(modal => {
                    results.modals.push({
                        selector: getUniqueSelector(modal),
                        visible: modal.offsetParent !== null,
                        text: getElementText(modal),
                        classes: modal.className
                    });
                });
                
                // Analisar tabelas
                document.querySelectorAll('table').forEach(table => {
                    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim());
                    const rowCount = table.querySelectorAll('tbody tr').length;
                    
                    results.tables.push({
                        selector: getUniqueSelector(table),
                        headers: headers,
                        rowCount: rowCount,
                        classes: table.className
                    });
                });
                
                // Analisar listas
                document.querySelectorAll('ul, ol').forEach(list => {
                    const items = Array.from(list.querySelectorAll('li')).map(li => getElementText(li));
                    
                    results.lists.push({
                        selector: getUniqueSelector(list),
                        type: list.tagName.toLowerCase(),
                        itemCount: items.length,
                        items: items.slice(0, 5), // Primeiros 5 items
                        classes: list.className
                    });
                });
                
                // Analisar imagens
                document.querySelectorAll('img').forEach(img => {
                    results.images.push({
                        selector: getUniqueSelector(img),
                        src: img.src,
                        alt: img.alt,
                        width: img.width,
                        height: img.height,
                        classes: img.className
                    });
                });
                
                // Elementos interativos adicionais
                document.querySelectorAll('[onclick], [data-toggle], [data-action]').forEach(elem => {
                    results.interactive.push({
                        selector: getUniqueSelector(elem),
                        tag: elem.tagName.toLowerCase(),
                        text: getElementText(elem),
                        onclick: elem.onclick ? 'present' : 'none',
                        dataAttributes: Array.from(elem.attributes)
                            .filter(attr => attr.name.startsWith('data-'))
                            .map(attr => ({ name: attr.name, value: attr.value })),
                        classes: elem.className
                    });
                });
                
                return results;
            });
            
            // Inferir funcionalidades baseado nos elementos encontrados
            const functionalities = this.inferFunctionalities(elements);
            
            // Contar elementos para estatísticas
            const elementCount = Object.values(elements).reduce((sum, arr) => sum + arr.length, 0);
            this.stats.elementsFound += elementCount;
            this.stats.functionalitiesIdentified += functionalities.length;
            
            const pageAnalysis = {
                url,
                title: pageTitle,
                path: urlPath,
                timestamp,
                screenshot: screenshotPath,
                elements,
                functionalities,
                elementCounts: {
                    buttons: elements.buttons.length,
                    inputs: elements.inputs.length,
                    links: elements.links.length,
                    forms: elements.forms.length,
                    modals: elements.modals.length,
                    tables: elements.tables.length,
                    lists: elements.lists.length,
                    images: elements.images.length,
                    interactive: elements.interactive.length,
                    total: elementCount
                }
            };
            
            // Salvar análise da página
            const pageFileName = `page-${this.stats.pagesAnalyzed + 1}-${urlPath.replace(/\//g, '-')}.json`;
            await fs.writeFile(
                path.join(this.options.outputDir, 'pages', pageFileName),
                JSON.stringify(pageAnalysis, null, 2)
            );
            
            this.analysisResults[url] = pageAnalysis;
            this.stats.pagesAnalyzed++;
            
            console.log(`✅ Página analisada: ${elementCount} elementos encontrados, ${functionalities.length} funcionalidades identificadas`);
            return pageAnalysis;
            
        } catch (error) {
            console.error(`❌ Erro ao analisar página ${url}:`, error.message);
            return null;
        }
    }

    inferFunctionalities(elements) {
        const functionalities = [];
        
        // Análise de formulários para inferir funcionalidades de CRUD
        elements.forms.forEach(form => {
            const hasEmail = form.inputs.some(input => 
                input.type === 'email' || input.name?.includes('email')
            );
            const hasPassword = form.inputs.some(input => input.type === 'password');
            const hasSubmit = form.inputs.some(input => input.type === 'submit');
            
            if (hasEmail && hasPassword) {
                functionalities.push({
                    type: 'authentication',
                    description: 'Login/Authentication Form',
                    confidence: 'high',
                    elements: [form.selector]
                });
            } else if (form.inputs.length > 3) {
                functionalities.push({
                    type: 'data_entry',
                    description: 'Data Entry Form (Create/Update)',
                    confidence: 'medium',
                    elements: [form.selector]
                });
            }
        });
        
        // Análise de tabelas para funcionalidades de listagem
        elements.tables.forEach(table => {
            if (table.rowCount > 0) {
                functionalities.push({
                    type: 'data_listing',
                    description: `Data Table with ${table.rowCount} rows`,
                    confidence: 'high',
                    elements: [table.selector]
                });
            }
        });
        
        // Análise de botões para ações específicas
        elements.buttons.forEach(button => {
            const text = button.text.toLowerCase();
            
            if (text.includes('criar') || text.includes('adicionar') || text.includes('novo')) {
                functionalities.push({
                    type: 'create',
                    description: 'Create/Add New Item',
                    confidence: 'high',
                    elements: [button.selector]
                });
            } else if (text.includes('editar') || text.includes('alterar')) {
                functionalities.push({
                    type: 'update',
                    description: 'Edit/Update Item',
                    confidence: 'high',
                    elements: [button.selector]
                });
            } else if (text.includes('excluir') || text.includes('remover') || text.includes('deletar')) {
                functionalities.push({
                    type: 'delete',
                    description: 'Delete/Remove Item',
                    confidence: 'high',
                    elements: [button.selector]
                });
            } else if (text.includes('exportar') || text.includes('download')) {
                functionalities.push({
                    type: 'export',
                    description: 'Export/Download Data',
                    confidence: 'medium',
                    elements: [button.selector]
                });
            } else if (text.includes('filtrar') || text.includes('pesquisar')) {
                functionalities.push({
                    type: 'search',
                    description: 'Search/Filter Functionality',
                    confidence: 'medium',
                    elements: [button.selector]
                });
            }
        });
        
        // Análise de inputs para funcionalidades de busca
        elements.inputs.forEach(input => {
            if (input.type === 'search' || 
                input.placeholder?.toLowerCase().includes('buscar') ||
                input.placeholder?.toLowerCase().includes('pesquisar')) {
                functionalities.push({
                    type: 'search',
                    description: 'Search Input Field',
                    confidence: 'high',
                    elements: [input.selector]
                });
            }
        });
        
        return functionalities;
    }

    async generateFinalReport() {
        console.log('📊 Gerando relatório final...');
        
        const endTime = Date.now();
        const duration = endTime - this.stats.startTime;
        
        // Estatísticas finais
        this.stats.apisDiscovered = this.apiCalls.length;
        this.stats.duration = duration;
        
        // Consolidar todas as funcionalidades encontradas
        const allFunctionalities = [];
        Object.values(this.analysisResults).forEach(page => {
            if (page && page.functionalities) {
                allFunctionalities.push(...page.functionalities);
            }
        });
        
        // Agrupar funcionalidades por tipo
        const functionalitiesByType = {};
        allFunctionalities.forEach(func => {
            if (!functionalitiesByType[func.type]) {
                functionalitiesByType[func.type] = [];
            }
            functionalitiesByType[func.type].push(func);
        });
        
        const report = {
            metadata: {
                generatedAt: new Date().toISOString(),
                duration: `${Math.round(duration / 1000)}s`,
                version: '1.0.0',
                system: 'Portal MEEP',
                baseUrl: this.options.baseUrl
            },
            statistics: this.stats,
            summary: {
                totalPages: this.discoveredPages.size,
                pagesAnalyzed: this.stats.pagesAnalyzed,
                totalElements: this.stats.elementsFound,
                totalFunctionalities: this.stats.functionalitiesIdentified,
                apiCallsIntercepted: this.stats.apisDiscovered
            },
            pages: Object.values(this.analysisResults).filter(page => page !== null),
            discoveredUrls: Array.from(this.discoveredPages),
            functionalitiesByType,
            apiCalls: this.apiCalls,
            navigationFlow: this.navigationFlow
        };
        
        // Salvar relatório principal em JSON
        await fs.writeFile(
            path.join(this.options.outputDir, 'reports', 'meep-complete-analysis.json'),
            JSON.stringify(report, null, 2)
        );
        
        // Gerar relatório em Markdown
        const markdownReport = this.generateMarkdownReport(report);
        await fs.writeFile(
            path.join(this.options.outputDir, 'reports', 'MEEP-COMPLETE-ANALYSIS.md'),
            markdownReport
        );
        
        // Gerar diagrama Mermaid da arquitetura
        const mermaidDiagram = this.generateMermaidDiagram(report);
        await fs.writeFile(
            path.join(this.options.outputDir, 'reports', 'meep-architecture-diagram.mmd'),
            mermaidDiagram
        );
        
        // Salvar APIs descobertas separadamente
        await fs.writeFile(
            path.join(this.options.outputDir, 'apis', 'discovered-apis.json'),
            JSON.stringify(this.apiCalls, null, 2)
        );
        
        console.log('✅ Relatório final gerado!');
        console.log(`📁 Arquivos salvos em: ${this.options.outputDir}`);
        
        return report;
    }

    generateMarkdownReport(report) {
        const md = [];
        
        md.push('# MEEP Portal - Análise Completa do Sistema');
        md.push('');
        md.push('## Resumo Executivo');
        md.push('');
        md.push(`- **Sistema Analisado**: ${report.metadata.system}`);
        md.push(`- **URL Base**: ${report.metadata.baseUrl}`);
        md.push(`- **Data da Análise**: ${report.metadata.generatedAt}`);
        md.push(`- **Duração da Análise**: ${report.metadata.duration}`);
        md.push('');
        
        md.push('## Estatísticas Gerais');
        md.push('');
        md.push('| Métrica | Valor |');
        md.push('|---------|--------|');
        md.push(`| Páginas Descobertas | ${report.summary.totalPages} |`);
        md.push(`| Páginas Analisadas | ${report.summary.pagesAnalyzed} |`);
        md.push(`| Elementos HTML Encontrados | ${report.summary.totalElements} |`);
        md.push(`| Funcionalidades Identificadas | ${report.summary.totalFunctionalities} |`);
        md.push(`| APIs Descobertas | ${report.summary.apiCallsIntercepted} |`);
        md.push('');
        
        md.push('## Páginas Analisadas');
        md.push('');
        report.pages.forEach((page, index) => {
            md.push(`### ${index + 1}. ${page.title || 'Sem Título'}`);
            md.push('');
            md.push(`- **URL**: ${page.url}`);
            md.push(`- **Caminho**: ${page.path}`);
            md.push(`- **Elementos Totais**: ${page.elementCounts.total}`);
            md.push(`- **Funcionalidades**: ${page.functionalities.length}`);
            md.push('');
            
            if (page.functionalities.length > 0) {
                md.push('**Funcionalidades Identificadas:**');
                page.functionalities.forEach(func => {
                    md.push(`- ${func.description} (${func.confidence} confidence)`);
                });
                md.push('');
            }
            
            md.push('**Elementos por Tipo:**');
            md.push(`- Botões: ${page.elementCounts.buttons}`);
            md.push(`- Campos de Input: ${page.elementCounts.inputs}`);
            md.push(`- Links: ${page.elementCounts.links}`);
            md.push(`- Formulários: ${page.elementCounts.forms}`);
            md.push(`- Tabelas: ${page.elementCounts.tables}`);
            md.push(`- Modais: ${page.elementCounts.modals}`);
            md.push('');
        });
        
        md.push('## Funcionalidades por Categoria');
        md.push('');
        Object.entries(report.functionalitiesByType).forEach(([type, funcs]) => {
            md.push(`### ${type.replace('_', ' ').toUpperCase()}`);
            md.push('');
            md.push(`Total de ocorrências: ${funcs.length}`);
            md.push('');
            funcs.forEach((func, index) => {
                md.push(`${index + 1}. ${func.description}`);
            });
            md.push('');
        });
        
        md.push('## APIs Descobertas');
        md.push('');
        if (report.apiCalls.length > 0) {
            md.push('| Método | URL | Status | Página |');
            md.push('|--------|-----|--------|--------|');
            report.apiCalls.forEach(api => {
                const url = api.url.length > 50 ? api.url.substring(0, 50) + '...' : api.url;
                const page = api.page.length > 30 ? api.page.substring(0, 30) + '...' : api.page;
                md.push(`| ${api.method} | ${url} | ${api.status || 'N/A'} | ${page} |`);
            });
        } else {
            md.push('Nenhuma API foi interceptada durante a análise.');
        }
        md.push('');
        
        md.push('## URLs Descobertas');
        md.push('');
        report.discoveredUrls.forEach((url, index) => {
            md.push(`${index + 1}. ${url}`);
        });
        md.push('');
        
        md.push('---');
        md.push('');
        md.push('*Relatório gerado automaticamente pelo MEEP Automation Supreme*');
        
        return md.join('\n');
    }

    generateMermaidDiagram(report) {
        const mermaid = [];
        
        mermaid.push('graph TD');
        mermaid.push('    A[Portal MEEP] --> B[Sistema Principal]');
        
        // Adicionar páginas principais
        const mainPages = report.pages.slice(0, 10); // Top 10 páginas
        mainPages.forEach((page, index) => {
            const nodeId = `PAGE${index + 1}`;
            const title = page.title?.substring(0, 20) || `Página ${index + 1}`;
            mermaid.push(`    B --> ${nodeId}[${title}]`);
            
            // Adicionar funcionalidades principais
            const mainFuncs = page.functionalities.filter(f => f.confidence === 'high').slice(0, 3);
            mainFuncs.forEach((func, funcIndex) => {
                const funcId = `FUNC${index + 1}_${funcIndex + 1}`;
                const funcName = func.type.replace('_', ' ').toUpperCase();
                mermaid.push(`    ${nodeId} --> ${funcId}[${funcName}]`);
            });
        });
        
        // Adicionar APIs se houver
        if (report.apiCalls.length > 0) {
            mermaid.push('    B --> API[APIs]');
            const uniqueApis = [...new Set(report.apiCalls.map(api => api.url.split('/')[3] || 'API'))];
            uniqueApis.slice(0, 5).forEach((api, index) => {
                mermaid.push(`    API --> API${index + 1}[${api}]`);
            });
        }
        
        return mermaid.join('\n');
    }

    async runCompleteAnalysis(username, password) {
        try {
            console.log('🎯 Iniciando análise completa do sistema MEEP...');
            
            // 1. Inicializar
            await this.initialize();
            
            // 2. Fazer login
            await this.performLogin(username, password);
            
            // 3. Descobrir todas as páginas
            const discoveredPages = await this.discoverAllPages();
            
            // 4. Analisar cada página descoberta
            console.log(`📋 Analisando ${discoveredPages.length} páginas...`);
            
            for (let i = 0; i < discoveredPages.length; i++) {
                const url = discoveredPages[i];
                console.log(`📄 Progresso: ${i + 1}/${discoveredPages.length} - ${url}`);
                
                await this.analyzePageElements(url);
                
                // Pequena pausa entre análises
                await this.page.waitForTimeout(1000);
            }
            
            // 5. Gerar relatório final
            const report = await this.generateFinalReport();
            
            // 6. Imprimir resumo final
            this.printFinalSummary(report);
            
            return report;
            
        } catch (error) {
            console.error('❌ Erro durante análise completa:', error);
            throw error;
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    printFinalSummary(report) {
        console.log('\n🎉 ANÁLISE COMPLETA FINALIZADA!');
        console.log('=====================================');
        console.log(`📊 ESTATÍSTICAS FINAIS:`);
        console.log(`   • Páginas Analisadas: ${report.summary.pagesAnalyzed}`);
        console.log(`   • Elementos Encontrados: ${report.summary.totalElements}`);
        console.log(`   • Funcionalidades Identificadas: ${report.summary.totalFunctionalities}`);
        console.log(`   • APIs Descobertas: ${report.summary.apiCallsIntercepted}`);
        console.log(`   • Duração: ${report.metadata.duration}`);
        console.log('');
        console.log(`📁 ARQUIVOS GERADOS:`);
        console.log(`   • Relatório Principal: ${this.options.outputDir}/reports/MEEP-COMPLETE-ANALYSIS.md`);
        console.log(`   • Dados JSON: ${this.options.outputDir}/reports/meep-complete-analysis.json`);
        console.log(`   • Diagrama Mermaid: ${this.options.outputDir}/reports/meep-architecture-diagram.mmd`);
        console.log(`   • Screenshots: ${this.options.screenshotDir}/`);
        console.log(`   • APIs: ${this.options.outputDir}/apis/discovered-apis.json`);
        console.log('=====================================');
    }
}

// Função principal para execução
async function main() {
    // CONFIGURAÇÃO DE LOGIN
    const USERNAME = 'toretomal@icloud.com'; // ✅ Email do Portal MEEP
    const PASSWORD = '352162Cl@'; // ✅ Senha do Portal MEEP
    
    if (USERNAME === 'SEU_EMAIL_AQUI' || PASSWORD === 'SUA_SENHA_AQUI') {
        console.error('❌ ERRO: Configure suas credenciais de login no script!');
        console.error('Edite as variáveis USERNAME e PASSWORD no final do arquivo.');
        return;
    }
    
    const automation = new MeepAutomationSupreme({
        headless: false, // Manter visível para acompanhar
        outputDir: './meep-analysis-results',
        screenshotDir: './meep-screenshots'
    });
    
    try {
        const report = await automation.runCompleteAnalysis(USERNAME, PASSWORD);
        console.log('\n✅ Análise completa finalizada com sucesso!');
        console.log('📋 Verifique os arquivos gerados para ver os resultados detalhados.');
        
    } catch (error) {
        console.error('\n❌ Erro durante execução:', error.message);
        console.error('🔧 Verifique suas credenciais e conectividade.');
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = MeepAutomationSupreme;
