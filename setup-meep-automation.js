#!/usr/bin/env node

/**
 * SETUP MEEP AUTOMATION
 * Script de configuração para o sistema de automação MEEP
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

class MeepAutomationSetup {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }

    async setup() {
        console.log('🚀 SETUP MEEP AUTOMATION SUPREME');
        console.log('=====================================');
        console.log('');
        
        try {
            // 1. Obter credenciais do usuário
            console.log('📋 CONFIGURAÇÃO DE LOGIN');
            console.log('Para acessar o Portal MEEP, precisamos das suas credenciais:');
            console.log('');
            
            const username = await this.question('👤 Email/Username: ');
            const password = await this.question('🔐 Senha: ');
            
            if (!username || !password) {
                throw new Error('Credenciais são obrigatórias!');
            }
            
            // 2. Configurações opcionais
            console.log('');
            console.log('⚙️ CONFIGURAÇÕES OPCIONAIS');
            
            const headless = await this.question('🖥️ Executar browser em modo invisível? (s/N): ');
            const outputDir = await this.question('📁 Diretório de saída (./meep-analysis-results): ') || './meep-analysis-results';
            const maxPages = await this.question('📄 Máximo de páginas para analisar (50): ') || '50';
            
            // 3. Criar arquivo de configuração
            const config = {
                credentials: {
                    username,
                    password
                },
                options: {
                    headless: headless.toLowerCase() === 's',
                    outputDir,
                    maxPages: parseInt(maxPages, 10),
                    baseUrl: 'https://beta.portal.meep.com.br',
                    screenshotDir: './meep-screenshots',
                    waitTimeout: 30000
                },
                created: new Date().toISOString()
            };
            
            await fs.writeFile(
                path.join(__dirname, 'meep-config.json'),
                JSON.stringify(config, null, 2)
            );
            
            // 4. Criar script executável personalizado
            const executableScript = this.generateExecutableScript();
            await fs.writeFile(
                path.join(__dirname, 'run-meep-analysis.js'),
                executableScript
            );
            
            // 5. Criar diretórios necessários
            await this.createDirectories(config.options);
            
            console.log('');
            console.log('✅ CONFIGURAÇÃO CONCLUÍDA!');
            console.log('=====================================');
            console.log('📁 Arquivos criados:');
            console.log('   • meep-config.json - Configurações salvas');
            console.log('   • run-meep-analysis.js - Script executável');
            console.log('');
            console.log('🚀 COMO EXECUTAR:');
            console.log('   npm run start');
            console.log('   OU');
            console.log('   node run-meep-analysis.js');
            console.log('');
            console.log('📋 O que será feito:');
            console.log(`   • Login automático no Portal MEEP`);
            console.log(`   • Descoberta automática de páginas`);
            console.log(`   • Análise completa de até ${maxPages} páginas`);
            console.log(`   • Capturas de tela de todas as páginas`);
            console.log(`   • Mapeamento de elementos HTML`);
            console.log(`   • Identificação de funcionalidades`);
            console.log(`   • Interceptação de APIs`);
            console.log(`   • Relatório final em múltiplos formatos`);
            console.log('');
            console.log('📊 RESULTADOS SERÃO SALVOS EM:');
            console.log(`   • ${outputDir}/reports/ - Relatórios`);
            console.log(`   • ${config.options.screenshotDir}/ - Screenshots`);
            console.log(`   • ${outputDir}/pages/ - Análises individuais`);
            console.log(`   • ${outputDir}/apis/ - APIs descobertas`);
            console.log('');
            
        } catch (error) {
            console.error('❌ Erro durante setup:', error.message);
        } finally {
            this.rl.close();
        }
    }

    generateExecutableScript() {
        return `#!/usr/bin/env node

/**
 * MEEP ANALYSIS RUNNER
 * Script executável para análise do Portal MEEP
 * Configurado automaticamente pelo setup
 */

const fs = require('fs');
const path = require('path');
const MeepAutomationSupreme = require('./meep-automation-supreme');

async function runAnalysis() {
    try {
        // Carregar configuração
        const configPath = path.join(__dirname, 'meep-config.json');
        
        if (!fs.existsSync(configPath)) {
            console.error('❌ Arquivo de configuração não encontrado!');
            console.error('Execute: node setup-meep-automation.js');
            return;
        }
        
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        console.log('🎯 Iniciando análise do Portal MEEP...');
        console.log(\`📋 Configuração carregada de: \${configPath}\`);
        console.log('');
        
        // Criar instância da automação
        const automation = new MeepAutomationSupreme(config.options);
        
        // Executar análise completa
        const report = await automation.runCompleteAnalysis(
            config.credentials.username,
            config.credentials.password
        );
        
        console.log('');
        console.log('🎉 ANÁLISE FINALIZADA COM SUCESSO!');
        console.log(\`📊 \${report.summary.pagesAnalyzed} páginas analisadas\`);
        console.log(\`📁 Resultados salvos em: \${config.options.outputDir}\`);
        
    } catch (error) {
        console.error('❌ Erro durante execução:', error.message);
        console.error('🔧 Verifique sua conexão e credenciais.');
        
        if (error.message.includes('Login falhou')) {
            console.error('');
            console.error('💡 DICA: Execute o setup novamente para atualizar credenciais:');
            console.error('   node setup-meep-automation.js');
        }
    }
}

// Executar análise
if (require.main === module) {
    runAnalysis().catch(console.error);
}

module.exports = runAnalysis;
`;
    }

    async createDirectories(options) {
        const dirs = [
            options.outputDir,
            options.screenshotDir,
            path.join(options.outputDir, 'pages'),
            path.join(options.outputDir, 'elements'),
            path.join(options.outputDir, 'apis'),
            path.join(options.outputDir, 'reports')
        ];
        
        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
    }
}

// Executar setup se chamado diretamente
if (require.main === module) {
    const setup = new MeepAutomationSetup();
    setup.setup().catch(console.error);
}

module.exports = MeepAutomationSetup;
