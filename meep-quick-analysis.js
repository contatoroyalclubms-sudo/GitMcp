/**
 * MEEP QUICK ANALYSIS
 * Análise rápida do Portal MEEP com navegador visível para login manual
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class MeepQuickAnalysis {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            pages: [],
            apis: [],
            elements: {},
            functionalities: []
        };
    }

    async init() {
        console.log('🚀 Iniciando análise rápida do MEEP...');
        
        this.browser = await chromium.launch({ 
            headless: false,  // Navegador visível
            slowMo: 1000      // Movimento lento para acompanhar
        });
        
        this.page = await this.browser.newPage();
        
        // Interceptar APIs
        this.page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('api') || url.includes('meep')) {
                this.results.apis.push({
                    url,
                    method: response.request().method(),
                    status: response.status(),
                    timestamp: new Date().toISOString()
                });
                console.log(`📡 API detectada: ${response.request().method()} ${url} [${response.status()}]`);
            }
        });
    }

    async navigateToMeep() {
        console.log('🌐 Navegando para Portal MEEP...');
        await this.page.goto('https://beta.portal.meep.com.br', { 
            waitUntil: 'networkidle' 
        });
        
        // Screenshot inicial
        await this.page.screenshot({ 
            path: './meep-initial.png',
            fullPage: true 
        });
        
        console.log('📷 Screenshot inicial salvo como meep-initial.png');
        console.log('👤 AÇÃO NECESSÁRIA: Faça login manualmente no navegador!');
        console.log('⏳ Aguardando 30 segundos para você fazer login...');
        
        // Aguardar login manual
        await this.page.waitForTimeout(30000);
    }

    async analyzePage() {
        console.log('🔍 Analisando página atual...');
        
        const url = this.page.url();
        console.log(`📍 URL atual: ${url}`);
        
        // Extrair todos os elementos importantes
        const elements = await this.page.evaluate(() => {
            const result = {
                buttons: [],
                links: [],
                forms: [],
                inputs: [],
                tables: [],
                menus: []
            };
            
            // Botões
            document.querySelectorAll('button, [role="button"], .btn').forEach(btn => {
                result.buttons.push({
                    text: btn.textContent?.trim() || '',
                    id: btn.id || '',
                    class: btn.className || '',
                    onclick: btn.onclick ? 'has-onclick' : 'no-onclick'
                });
            });
            
            // Links
            document.querySelectorAll('a[href]').forEach(link => {
                result.links.push({
                    text: link.textContent?.trim() || '',
                    href: link.href || '',
                    target: link.target || ''
                });
            });
            
            // Formulários
            document.querySelectorAll('form').forEach(form => {
                result.forms.push({
                    action: form.action || '',
                    method: form.method || '',
                    inputs: form.querySelectorAll('input').length
                });
            });
            
            // Inputs
            document.querySelectorAll('input, select, textarea').forEach(input => {
                result.inputs.push({
                    type: input.type || '',
                    name: input.name || '',
                    placeholder: input.placeholder || '',
                    required: input.required || false
                });
            });
            
            // Tabelas
            document.querySelectorAll('table').forEach(table => {
                result.tables.push({
                    rows: table.querySelectorAll('tr').length,
                    columns: table.querySelectorAll('th, td').length,
                    hasHeader: table.querySelectorAll('th').length > 0
                });
            });
            
            // Menus/Navegação
            document.querySelectorAll('[class*="menu"], [class*="nav"], [class*="sidebar"]').forEach(menu => {
                result.menus.push({
                    class: menu.className || '',
                    items: menu.querySelectorAll('a, button, [role="menuitem"]').length
                });
            });
            
            return result;
        });
        
        // Screenshot da página analisada
        await this.page.screenshot({ 
            path: `./meep-page-${Date.now()}.png`,
            fullPage: true 
        });
        
        this.results.pages.push({
            url,
            timestamp: new Date().toISOString(),
            elements,
            title: await this.page.title()
        });
        
        console.log(`✅ Página analisada: ${elements.buttons.length} botões, ${elements.links.length} links, ${elements.forms.length} formulários`);
        
        return elements;
    }

    async exploreNavigation() {
        console.log('🗺️ Explorando navegação do sistema...');
        
        // Tentar clicar em links de navegação principais
        const navigationLinks = await this.page.$$('nav a, [class*="menu"] a, [class*="sidebar"] a');
        
        console.log(`🔗 Encontrados ${navigationLinks.length} links de navegação`);
        
        let exploredPages = 0;
        for (const link of navigationLinks.slice(0, 10)) { // Limitar a 10 para não demorar muito
            try {
                const href = await link.getAttribute('href');
                const text = await link.textContent();
                
                if (href && !href.startsWith('#') && !href.includes('logout') && !href.includes('javascript:')) {
                    console.log(`📱 Explorando: ${text?.trim() || href}`);
                    
                    await link.click();
                    await this.page.waitForTimeout(2000);
                    await this.page.waitForLoadState('networkidle');
                    
                    await this.analyzePage();
                    exploredPages++;
                    
                    // Voltar
                    await this.page.goBack();
                    await this.page.waitForTimeout(1000);
                }
            } catch (error) {
                console.log(`⚠️ Erro ao explorar link: ${error.message}`);
            }
        }
        
        console.log(`✅ Exploradas ${exploredPages} páginas`);
    }

    async generateReport() {
        console.log('📋 Gerando relatório...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                pagesAnalyzed: this.results.pages.length,
                apisDiscovered: this.results.apis.length,
                totalButtons: this.results.pages.reduce((sum, page) => sum + page.elements.buttons.length, 0),
                totalLinks: this.results.pages.reduce((sum, page) => sum + page.elements.links.length, 0),
                totalForms: this.results.pages.reduce((sum, page) => sum + page.elements.forms.length, 0)
            },
            pages: this.results.pages,
            apis: this.results.apis
        };
        
        // Salvar JSON
        await fs.writeFile('./meep-quick-analysis.json', JSON.stringify(report, null, 2));
        
        // Gerar Markdown
        let md = '# Portal MEEP - Análise Rápida\n\n';
        md += `**Data:** ${new Date().toLocaleString('pt-BR')}\n\n`;
        md += '## Resumo\n\n';
        md += `- **Páginas analisadas:** ${report.summary.pagesAnalyzed}\n`;
        md += `- **APIs descobertas:** ${report.summary.apisDiscovered}\n`;
        md += `- **Total de botões:** ${report.summary.totalButtons}\n`;
        md += `- **Total de links:** ${report.summary.totalLinks}\n`;
        md += `- **Total de formulários:** ${report.summary.totalForms}\n\n`;
        
        md += '## APIs Descobertas\n\n';
        if (this.results.apis.length > 0) {
            md += '| Método | URL | Status | Timestamp |\n';
            md += '|--------|-----|--------|-----------|\n';
            this.results.apis.forEach(api => {
                md += `| ${api.method} | ${api.url} | ${api.status} | ${api.timestamp} |\n`;
            });
        } else {
            md += 'Nenhuma API interceptada.\n';
        }
        md += '\n';
        
        md += '## Páginas Analisadas\n\n';
        this.results.pages.forEach((page, index) => {
            md += `### ${index + 1}. ${page.title || 'Sem título'}\n\n`;
            md += `**URL:** ${page.url}\n\n`;
            md += `**Elementos encontrados:**\n`;
            md += `- Botões: ${page.elements.buttons.length}\n`;
            md += `- Links: ${page.elements.links.length}\n`;
            md += `- Formulários: ${page.elements.forms.length}\n`;
            md += `- Inputs: ${page.elements.inputs.length}\n`;
            md += `- Tabelas: ${page.elements.tables.length}\n`;
            md += `- Menus: ${page.elements.menus.length}\n\n`;
        });
        
        await fs.writeFile('./MEEP-QUICK-ANALYSIS.md', md);
        
        console.log('✅ Relatório gerado!');
        console.log('📁 Arquivos criados:');
        console.log('   - meep-quick-analysis.json');
        console.log('   - MEEP-QUICK-ANALYSIS.md');
        console.log('   - Screenshots: meep-*.png');
    }

    async run() {
        try {
            await this.init();
            await this.navigateToMeep();
            
            console.log('▶️ PRESSIONE ENTER APÓS FAZER LOGIN PARA CONTINUAR...');
            process.stdin.once('data', async () => {
                console.log('🔄 Continuando análise...');
                
                await this.analyzePage();
                await this.exploreNavigation();
                await this.generateReport();
                
                console.log('🎉 Análise completa!');
                await this.browser.close();
            });
            
        } catch (error) {
            console.error('❌ Erro:', error.message);
            if (this.browser) await this.browser.close();
        }
    }
}

// Executar
const analysis = new MeepQuickAnalysis();
analysis.run();
