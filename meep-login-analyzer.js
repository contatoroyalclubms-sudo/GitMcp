/**
 * MEEP LOGIN & INTERNAL ANALYSIS
 * Script para login automático e análise da área interna do Portal MEEP
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

class MeepLoginAnalyzer {
    constructor() {
        this.browser = null;
        this.page = null;
        this.internalApis = [];
        this.internalPages = [];
        this.userCredentials = {
            email: 'toretomal@icloud.com',
            password: '352162Cl@'
        };
    }

    async init() {
        console.log('🔐 Iniciando análise com login do Portal MEEP...');
        this.browser = await chromium.launch({ 
            headless: false,
            slowMo: 500 
        });
        this.page = await this.browser.newPage();
        
        // Interceptar APIs internas
        this.page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('meep') && 
                (url.includes('/api/') || url.includes('-api.') || url.includes('.net/'))) {
                this.internalApis.push({
                    url,
                    method: response.request().method(),
                    status: response.status(),
                    timestamp: new Date().toISOString(),
                    headers: response.headers()
                });
                console.log(`🔍 API interna: ${response.request().method()} ${url} [${response.status()}]`);
            }
        });
    }

    async performLogin() {
        console.log('🚀 Navegando para Portal MEEP...');
        await this.page.goto('https://beta.portal.meep.com.br/login', { 
            waitUntil: 'networkidle' 
        });

        console.log('📸 Screenshot da página de login...');
        await this.page.screenshot({ 
            path: './meep-login-page.png',
            fullPage: true 
        });

        console.log('🔍 Procurando campos de login...');
        
        // Aguardar elementos carregarem
        await this.page.waitForTimeout(3000);

        // Tentar múltiplas estratégias de login
        let loginSuccess = false;

        // Estratégia 1: Campos comuns
        try {
            const emailField = await this.page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"], input[placeholder*="Email"]').first();
            const passwordField = await this.page.locator('input[type="password"]').first();
            
            if (await emailField.isVisible() && await passwordField.isVisible()) {
                console.log('✅ Campos de login encontrados!');
                
                await emailField.fill(this.userCredentials.email);
                await passwordField.fill(this.userCredentials.password);
                
                console.log('📝 Credenciais preenchidas');
                
                // Procurar botão de submit
                const submitButton = await this.page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login"), .btn-login').first();
                
                if (await submitButton.isVisible()) {
                    console.log('🔘 Clicando no botão de login...');
                    await submitButton.click();
                    
                    // Aguardar redirecionamento
                    await this.page.waitForTimeout(5000);
                    
                    const currentUrl = this.page.url();
                    console.log(`📍 URL após login: ${currentUrl}`);
                    
                    if (!currentUrl.includes('/login')) {
                        loginSuccess = true;
                        console.log('✅ Login realizado com sucesso!');
                    }
                }
            }
        } catch (error) {
            console.log('⚠️ Estratégia 1 falhou:', error.message);
        }

        // Estratégia 2: Se login falhou, tentar elementos diferentes
        if (!loginSuccess) {
            try {
                console.log('🔄 Tentando estratégia alternativa...');
                
                // Procurar por qualquer input de texto
                const inputs = await this.page.$$('input');
                console.log(`🔍 Encontrados ${inputs.length} campos de input`);
                
                if (inputs.length >= 2) {
                    await inputs[0].fill(this.userCredentials.email);
                    await inputs[1].fill(this.userCredentials.password);
                    
                    // Procurar qualquer botão
                    const buttons = await this.page.$$('button');
                    if (buttons.length > 0) {
                        await buttons[0].click();
                        await this.page.waitForTimeout(5000);
                        
                        const currentUrl = this.page.url();
                        if (!currentUrl.includes('/login')) {
                            loginSuccess = true;
                            console.log('✅ Login alternativo funcionou!');
                        }
                    }
                }
            } catch (error) {
                console.log('⚠️ Estratégia 2 falhou:', error.message);
            }
        }

        // Screenshot após tentativa de login
        await this.page.screenshot({ 
            path: './meep-after-login.png',
            fullPage: true 
        });

        return loginSuccess;
    }

    async exploreInternalArea() {
        console.log('🗺️ Explorando área interna do Portal MEEP...');
        
        // Aguardar página carregar
        await this.page.waitForTimeout(3000);
        
        const currentUrl = this.page.url();
        console.log(`📍 Página atual: ${currentUrl}`);
        
        // Tentar encontrar menu de navegação
        const navigationElements = await this.page.$$('nav a, .menu a, .sidebar a, [class*="nav"] a, [class*="menu"] a');
        console.log(`🔗 Encontrados ${navigationElements.length} links de navegação`);
        
        // Explorar algumas páginas internas
        for (let i = 0; i < Math.min(5, navigationElements.length); i++) {
            try {
                const href = await navigationElements[i].getAttribute('href');
                const text = await navigationElements[i].textContent();
                
                if (href && !href.includes('logout') && !href.includes('#')) {
                    console.log(`📱 Explorando: ${text?.trim() || href}`);
                    
                    await navigationElements[i].click();
                    await this.page.waitForTimeout(3000);
                    
                    const pageInfo = {
                        url: this.page.url(),
                        title: await this.page.title(),
                        timestamp: new Date().toISOString()
                    };
                    
                    this.internalPages.push(pageInfo);
                    
                    // Screenshot da página interna
                    await this.page.screenshot({ 
                        path: `./meep-internal-${i + 1}.png`,
                        fullPage: true 
                    });
                    
                    // Voltar para a página anterior
                    await this.page.goBack();
                    await this.page.waitForTimeout(2000);
                }
            } catch (error) {
                console.log(`⚠️ Erro ao explorar página ${i + 1}: ${error.message}`);
            }
        }
    }

    async generateInternalReport() {
        console.log('📋 Gerando relatório da área interna...');
        
        const report = {
            timestamp: new Date().toISOString(),
            loginAttempt: true,
            internalAPIs: this.internalApis,
            internalPages: this.internalPages,
            stats: {
                apisDiscovered: this.internalApis.length,
                pagesExplored: this.internalPages.length
            }
        };

        // Salvar JSON
        await fs.writeFile('./meep-internal-analysis.json', JSON.stringify(report, null, 2));

        // Gerar Markdown
        let md = '# Portal MEEP - Análise da Área Interna\n\n';
        md += `**Data:** ${new Date().toLocaleString('pt-BR')}\n`;
        md += `**Login:** Tentativa automática realizada\n\n`;

        md += '## 📊 Resumo\n\n';
        md += `- **APIs internas descobertas:** ${this.internalApis.length}\n`;
        md += `- **Páginas internas exploradas:** ${this.internalPages.length}\n\n`;

        if (this.internalApis.length > 0) {
            md += '## 🔌 APIs Internas Descobertas\n\n';
            md += '| Método | URL | Status | Timestamp |\n';
            md += '|--------|-----|--------|-----------|\n';
            this.internalApis.forEach(api => {
                const url = api.url.length > 60 ? api.url.substring(0, 60) + '...' : api.url;
                md += `| ${api.method} | ${url} | ${api.status} | ${api.timestamp} |\n`;
            });
            md += '\n';
        }

        if (this.internalPages.length > 0) {
            md += '## 📱 Páginas Internas Exploradas\n\n';
            this.internalPages.forEach((page, index) => {
                md += `### ${index + 1}. ${page.title || 'Sem título'}\n\n`;
                md += `**URL:** ${page.url}\n`;
                md += `**Timestamp:** ${page.timestamp}\n\n`;
            });
        }

        await fs.writeFile('./MEEP-INTERNAL-ANALYSIS.md', md);
        
        console.log('✅ Relatório da área interna gerado!');
        console.log('📁 Arquivos criados:');
        console.log('   - meep-internal-analysis.json');
        console.log('   - MEEP-INTERNAL-ANALYSIS.md');
        console.log('   - Screenshots: meep-*.png');
    }

    async run() {
        try {
            await this.init();
            const loginSuccess = await this.performLogin();
            
            if (loginSuccess) {
                await this.exploreInternalArea();
            } else {
                console.log('⚠️ Login não foi possível automaticamente');
                console.log('💡 Você pode fazer login manual e pressionar Enter para continuar...');
                
                // Aguardar input manual
                process.stdin.once('data', async () => {
                    console.log('🔄 Continuando análise...');
                    await this.exploreInternalArea();
                    await this.generateInternalReport();
                    await this.browser.close();
                });
                return;
            }
            
            await this.generateInternalReport();
            await this.browser.close();
            
        } catch (error) {
            console.error('❌ Erro:', error.message);
            if (this.browser) await this.browser.close();
        }
    }
}

// Executar
const analyzer = new MeepLoginAnalyzer();
analyzer.run();
