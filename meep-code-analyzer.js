/**
 * MEEP CODE ANALYZER
 * Analisa o código JavaScript do Portal MEEP para descobrir funcionalidades
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

class MeepCodeAnalyzer {
    constructor() {
        this.browser = null;
        this.page = null;
        this.discoveries = {
            routes: [],
            components: [],
            apis: [],
            modules: [],
            features: []
        };
    }

    async init() {
        console.log('🔍 Iniciando análise de código do MEEP...');
        this.browser = await chromium.launch({ headless: false });
        this.page = await this.browser.newPage();
    }

    async analyzeJavaScriptCode() {
        console.log('📱 Navegando para Portal MEEP...');
        await this.page.goto('https://beta.portal.meep.com.br', { 
            waitUntil: 'networkidle' 
        });

        console.log('🔬 Analisando código JavaScript...');
        
        // Extrair informações do código JavaScript carregado
        const codeAnalysis = await this.page.evaluate(() => {
            const analysis = {
                routes: [],
                components: [],
                apiEndpoints: [],
                moduleNames: [],
                features: [],
                constants: {},
                functions: []
            };

            // Analisar todos os scripts carregados
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            
            // Tentar acessar objetos globais do React/aplicação
            if (window.React) {
                analysis.react = {
                    version: window.React.version || 'unknown',
                    components: Object.keys(window.React)
                };
            }

            // Procurar por strings que indiquem rotas
            const allScriptText = Array.from(document.querySelectorAll('script')).map(s => s.innerHTML).join(' ');
            
            // Regex para encontrar rotas
            const routePatterns = [
                /["']\/[a-zA-Z0-9\-_\/]+["']/g,
                /path:\s*["'][^"']+["']/g,
                /route:\s*["'][^"']+["']/g
            ];

            routePatterns.forEach(pattern => {
                const matches = allScriptText.match(pattern) || [];
                matches.forEach(match => {
                    const route = match.replace(/["']/g, '').replace(/path:\s*/, '').replace(/route:\s*/, '');
                    if (route.startsWith('/') && route.length > 1) {
                        analysis.routes.push(route);
                    }
                });
            });

            // Procurar por nomes de componentes React
            const componentPatterns = [
                /const\s+([A-Z][a-zA-Z0-9]+)\s*=/g,
                /function\s+([A-Z][a-zA-Z0-9]+)\s*\(/g,
                /class\s+([A-Z][a-zA-Z0-9]+)\s+/g
            ];

            componentPatterns.forEach(pattern => {
                const matches = allScriptText.match(pattern) || [];
                matches.forEach(match => {
                    const component = match.replace(/const\s+|function\s+|class\s+|[\s=\(]/g, '');
                    if (component && component.length > 2) {
                        analysis.components.push(component);
                    }
                });
            });

            // Procurar por endpoints de API
            const apiPatterns = [
                /["']https?:\/\/[^"']+api[^"']*["']/g,
                /["']\/api\/[^"']+["']/g,
                /baseURL:\s*["'][^"']+["']/g,
                /endpoint:\s*["'][^"']+["']/g
            ];

            apiPatterns.forEach(pattern => {
                const matches = allScriptText.match(pattern) || [];
                matches.forEach(match => {
                    const endpoint = match.replace(/["']/g, '').replace(/baseURL:\s*/, '').replace(/endpoint:\s*/, '');
                    analysis.apiEndpoints.push(endpoint);
                });
            });

            // Procurar por nomes de módulos/features
            const modulePatterns = [
                /module:\s*["']([^"']+)["']/g,
                /feature:\s*["']([^"']+)["']/g,
                /name:\s*["']([A-Z][a-zA-Z0-9\s]+)["']/g
            ];

            modulePatterns.forEach(pattern => {
                const matches = allScriptText.match(pattern) || [];
                matches.forEach(match => {
                    const module = match.replace(/module:\s*|feature:\s*|name:\s*|["']/g, '');
                    if (module && module.length > 2) {
                        analysis.moduleNames.push(module);
                    }
                });
            });

            // Analisar localStorage/sessionStorage se disponível
            try {
                const storageKeys = Object.keys(localStorage);
                analysis.localStorage = storageKeys;
            } catch (e) {}

            // Analisar cookies
            analysis.cookies = document.cookie.split(';').map(c => c.trim().split('=')[0]);

            return analysis;
        });

        this.discoveries = codeAnalysis;
        return codeAnalysis;
    }

    async fetchAndAnalyzeMainJS() {
        console.log('📥 Baixando e analisando arquivo principal JS...');
        
        // Interceptar e analisar o arquivo main.js
        this.page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('main.') && url.includes('.js')) {
                try {
                    const content = await response.text();
                    console.log(`📄 Analisando ${url}...`);
                    
                    // Procurar por strings importantes no código
                    const features = this.extractFeaturesFromCode(content);
                    this.discoveries.features.push(...features);
                    
                } catch (error) {
                    console.log(`⚠️ Erro ao analisar ${url}: ${error.message}`);
                }
            }
        });
    }

    extractFeaturesFromCode(code) {
        const features = [];
        
        // Palavras-chave que indicam funcionalidades do MEEP
        const keywords = [
            'dashboard', 'cliente', 'evento', 'pdv', 'cashless', 'relatorio', 'vendas',
            'menu', 'cardapio', 'pagamento', 'transacao', 'analytics', 'intelligence',
            'marketing', 'financeiro', 'estoque', 'produto', 'categoria', 'promocao',
            'desconto', 'cupom', 'fidelidade', 'usuario', 'perfil', 'configuracao',
            'notificacao', 'chat', 'suporte', 'help', 'ajuda', 'tutorial'
        ];

        keywords.forEach(keyword => {
            const regex = new RegExp(`["'].*${keyword}.*["']|${keyword}[A-Z]\\w*`, 'gi');
            const matches = code.match(regex) || [];
            matches.forEach(match => {
                features.push({
                    keyword,
                    match: match.replace(/["']/g, ''),
                    type: 'feature_detected'
                });
            });
        });

        return features;
    }

    async generateDetailedReport() {
        console.log('📋 Gerando relatório detalhado...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                routesFound: this.discoveries.routes?.length || 0,
                componentsFound: this.discoveries.components?.length || 0,
                apiEndpointsFound: this.discoveries.apiEndpoints?.length || 0,
                featuresFound: this.discoveries.features?.length || 0
            },
            discoveries: this.discoveries
        };

        // Salvar JSON
        await fs.writeFile('./meep-code-analysis.json', JSON.stringify(report, null, 2));

        // Gerar Markdown detalhado
        let md = '# Portal MEEP - Análise de Código Fonte\n\n';
        md += `**Data:** ${new Date().toLocaleString('pt-BR')}\n`;
        md += `**Tipo:** Análise de código JavaScript\n\n`;

        md += '## 📊 Resumo Executivo\n\n';
        md += `- **Rotas descobertas:** ${report.summary.routesFound}\n`;
        md += `- **Componentes encontrados:** ${report.summary.componentsFound}\n`;
        md += `- **Endpoints de API:** ${report.summary.apiEndpointsFound}\n`;
        md += `- **Funcionalidades identificadas:** ${report.summary.featuresFound}\n\n`;

        if (this.discoveries.routes?.length > 0) {
            md += '## 🛣️ Rotas Descobertas\n\n';
            this.discoveries.routes.slice(0, 20).forEach(route => {
                md += `- \`${route}\`\n`;
            });
            md += '\n';
        }

        if (this.discoveries.components?.length > 0) {
            md += '## ⚛️ Componentes React\n\n';
            [...new Set(this.discoveries.components)].slice(0, 30).forEach(comp => {
                md += `- \`${comp}\`\n`;
            });
            md += '\n';
        }

        if (this.discoveries.apiEndpoints?.length > 0) {
            md += '## 🌐 Endpoints de API\n\n';
            [...new Set(this.discoveries.apiEndpoints)].forEach(api => {
                md += `- \`${api}\`\n`;
            });
            md += '\n';
        }

        if (this.discoveries.features?.length > 0) {
            md += '## 🎯 Funcionalidades Identificadas\n\n';
            this.discoveries.features.slice(0, 50).forEach(feature => {
                md += `- **${feature.keyword}:** \`${feature.match}\`\n`;
            });
            md += '\n';
        }

        await fs.writeFile('./MEEP-CODE-ANALYSIS-DETAILED.md', md);
        
        console.log('✅ Relatório detalhado gerado!');
        console.log('📁 Arquivos criados:');
        console.log('   - meep-code-analysis.json');
        console.log('   - MEEP-CODE-ANALYSIS-DETAILED.md');
    }

    async run() {
        try {
            await this.init();
            await this.fetchAndAnalyzeMainJS();
            await this.analyzeJavaScriptCode();
            await this.generateDetailedReport();
            
            console.log('🎉 Análise de código completa!');
            console.log(`📊 Resultados: ${this.discoveries.routes?.length || 0} rotas, ${this.discoveries.components?.length || 0} componentes`);
            
            await this.browser.close();
        } catch (error) {
            console.error('❌ Erro:', error.message);
            if (this.browser) await this.browser.close();
        }
    }
}

// Executar
const analyzer = new MeepCodeAnalyzer();
analyzer.run();
