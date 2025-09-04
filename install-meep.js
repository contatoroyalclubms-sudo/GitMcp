#!/usr/bin/env node

/**
 * INSTALADOR MEEP AUTOMATION SUPREME
 * Script completo de instalação e configuração
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class MeepInstaller {
    constructor() {
        this.installSteps = [
            '🔧 Verificando Node.js',
            '📦 Instalando Playwright', 
            '🌐 Baixando browser Chromium',
            '📁 Criando estrutura de diretórios',
            '⚙️ Configurando sistema',
            '✅ Finalizando instalação'
        ];
        this.currentStep = 0;
    }

    logStep(message) {
        this.currentStep++;
        console.log(`[${this.currentStep}/${this.installSteps.length}] ${message}`);
    }

    async execCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });
    }

    async checkNodeVersion() {
        this.logStep('🔧 Verificando Node.js...');
        
        try {
            const { stdout } = await this.execCommand('node --version');
            const version = stdout.trim();
            const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
            
            console.log(`   Node.js versão: ${version}`);
            
            if (majorVersion < 16) {
                throw new Error(`Node.js 16+ é necessário. Versão atual: ${version}`);
            }
            
            console.log('   ✅ Node.js compatível');
            return true;
        } catch (error) {
            console.error('   ❌ Erro ao verificar Node.js:', error.message);
            return false;
        }
    }

    async installPlaywright() {
        this.logStep('📦 Instalando Playwright...');
        
        try {
            console.log('   Instalando dependência Playwright...');
            await this.execCommand('npm install playwright');
            console.log('   ✅ Playwright instalado com sucesso');
            return true;
        } catch (error) {
            console.error('   ❌ Erro ao instalar Playwright:', error.message);
            return false;
        }
    }

    async installBrowser() {
        this.logStep('🌐 Baixando browser Chromium...');
        
        try {
            console.log('   Baixando browser Chromium (pode demorar alguns minutos)...');
            const { stdout } = await this.execCommand('npx playwright install chromium');
            console.log('   ✅ Browser Chromium instalado');
            return true;
        } catch (error) {
            console.error('   ❌ Erro ao instalar browser:', error.message);
            console.error('   💡 Tente executar manualmente: npx playwright install chromium');
            return false;
        }
    }

    async createDirectories() {
        this.logStep('📁 Criando estrutura de diretórios...');
        
        const directories = [
            './meep-analysis-results',
            './meep-analysis-results/reports',
            './meep-analysis-results/pages',
            './meep-analysis-results/apis',
            './meep-analysis-results/elements',
            './meep-screenshots',
            './demo-meep-results',
            './demo-screenshots'
        ];
        
        try {
            for (const dir of directories) {
                await fs.mkdir(dir, { recursive: true });
            }
            console.log('   ✅ Diretórios criados com sucesso');
            return true;
        } catch (error) {
            console.error('   ❌ Erro ao criar diretórios:', error.message);
            return false;
        }
    }

    async createPackageJson() {
        this.logStep('⚙️ Configurando sistema...');
        
        const packageJson = {
            "name": "meep-automation-supreme",
            "version": "1.0.0",
            "description": "Sistema completo de engenharia reversa e mapeamento do Portal MEEP",
            "main": "meep-automation-supreme.js",
            "scripts": {
                "start": "node run-meep-analysis.js",
                "demo": "node demo-meep.js",
                "setup": "node setup-meep-automation.js",
                "install-deps": "npm install playwright && npx playwright install chromium"
            },
            "dependencies": {
                "playwright": "^1.40.0"
            },
            "keywords": [
                "automation",
                "reverse-engineering", 
                "meep",
                "playwright",
                "web-scraping"
            ],
            "author": "MEEP Automation Team",
            "license": "MIT"
        };
        
        try {
            await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
            console.log('   ✅ package.json criado');
            return true;
        } catch (error) {
            console.error('   ❌ Erro ao criar package.json:', error.message);
            return false;
        }
    }

    async createQuickStart() {
        this.logStep('✅ Finalizando instalação...');
        
        const quickStartScript = `#!/usr/bin/env node

/**
 * QUICK START MEEP AUTOMATION
 * Script de início rápido
 */

console.log('🚀 MEEP AUTOMATION SUPREME - QUICK START');
console.log('========================================');
console.log('');
console.log('Escolha uma opção:');
console.log('');
console.log('1️⃣  DEMO RÁPIDA (10 páginas)');
console.log('   node demo-meep.js');
console.log('');
console.log('2️⃣  CONFIGURAÇÃO COMPLETA');
console.log('   node setup-meep-automation.js');
console.log('');
console.log('3️⃣  EXECUTAR ANÁLISE COMPLETA');
console.log('   node run-meep-analysis.js');
console.log('');
console.log('📋 ANTES DE COMEÇAR:');
console.log('   • Tenha suas credenciais do Portal MEEP em mãos');
console.log('   • Certifique-se de que o Portal está acessível');
console.log('   • Execute em ambiente com boa conectividade');
console.log('');
console.log('🔧 PROBLEMAS? Consulte o README-MEEP.md');
console.log('');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Digite sua opção (1, 2 ou 3): ', (answer) => {
    rl.close();
    
    switch(answer) {
        case '1':
            console.log('🎯 Executando demo...');
            require('./demo-meep.js');
            break;
        case '2':
            console.log('⚙️ Iniciando configuração...');
            require('./setup-meep-automation.js');
            break;
        case '3':
            console.log('🔥 Executando análise completa...');
            require('./run-meep-analysis.js');
            break;
        default:
            console.log('❌ Opção inválida. Execute novamente.');
    }
});
`;
        
        try {
            await fs.writeFile('quick-start.js', quickStartScript);
            console.log('   ✅ Script de início rápido criado');
            return true;
        } catch (error) {
            console.error('   ❌ Erro ao criar quick-start:', error.message);
            return false;
        }
    }

    async install() {
        console.log('🎯 INSTALADOR MEEP AUTOMATION SUPREME');
        console.log('====================================');
        console.log('');
        console.log('Este instalador irá configurar tudo que você precisa para');
        console.log('executar a análise completa do Portal MEEP.');
        console.log('');
        
        const steps = [
            () => this.checkNodeVersion(),
            () => this.installPlaywright(),
            () => this.installBrowser(),
            () => this.createDirectories(),
            () => this.createPackageJson(),
            () => this.createQuickStart()
        ];
        
        let allSuccessful = true;
        
        for (const step of steps) {
            const success = await step();
            if (!success) {
                allSuccessful = false;
                break;
            }
        }
        
        console.log('');
        
        if (allSuccessful) {
            console.log('🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!');
            console.log('===================================');
            console.log('');
            console.log('🚀 PRÓXIMOS PASSOS:');
            console.log('');
            console.log('1️⃣  TESTE RÁPIDO (recomendado):');
            console.log('   node demo-meep.js');
            console.log('   (Lembre-se de configurar credenciais no arquivo)');
            console.log('');
            console.log('2️⃣  CONFIGURAÇÃO COMPLETA:');
            console.log('   node setup-meep-automation.js');
            console.log('');
            console.log('3️⃣  INÍCIO RÁPIDO INTERATIVO:');
            console.log('   node quick-start.js');
            console.log('');
            console.log('📚 DOCUMENTAÇÃO:');
            console.log('   README-MEEP.md - Guia completo');
            console.log('');
            console.log('🔧 ARQUIVOS PRINCIPAIS:');
            console.log('   • meep-automation-supreme.js - Sistema principal');
            console.log('   • demo-meep.js - Demo rápida');
            console.log('   • setup-meep-automation.js - Configuração');
            console.log('');
            console.log('✅ Sistema pronto para uso!');
            
        } else {
            console.log('❌ INSTALAÇÃO INCOMPLETA');
            console.log('========================');
            console.log('');
            console.log('Alguns passos falharam. Tente:');
            console.log('');
            console.log('1. Verificar sua conexão com a internet');
            console.log('2. Executar como administrador');
            console.log('3. Instalar manualmente:');
            console.log('   npm install playwright');
            console.log('   npx playwright install chromium');
            console.log('');
        }
    }
}

// Executar instalação se chamado diretamente
if (require.main === module) {
    const installer = new MeepInstaller();
    installer.install().catch(console.error);
}

module.exports = MeepInstaller;
