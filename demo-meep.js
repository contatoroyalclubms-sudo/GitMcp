#!/usr/bin/env node

/**
 * DEMO MEEP AUTOMATION
 * Script de demonstração e teste do sistema de automação MEEP
 */

const fs = require('fs');
const path = require('path');
const MeepAutomationSupreme = require('./meep-automation-supreme');

class MeepDemo {
    constructor() {
        this.demoConfig = {
            headless: false, // Manter visível para demo
            outputDir: './demo-meep-results',
            screenshotDir: './demo-screenshots',
            maxPages: 10, // Limite para demo
            baseUrl: 'https://beta.portal.meep.com.br'
        };
    }

    async showWelcome() {
        console.log('🎯 MEEP AUTOMATION SUPREME - DEMO');
        console.log('=================================');
        console.log('');
        console.log('Este é um sistema completo de análise e engenharia reversa');
        console.log('do Portal MEEP que irá:');
        console.log('');
        console.log('✅ Fazer login automático no sistema');
        console.log('✅ Descobrir todas as páginas disponíveis');
        console.log('✅ Analisar elementos HTML de cada página');
        console.log('✅ Identificar funcionalidades automaticamente');
        console.log('✅ Interceptar chamadas de API');
        console.log('✅ Capturar screenshots de todas as telas');
        console.log('✅ Gerar relatório completo em múltiplos formatos');
        console.log('');
        console.log('📊 RESULTADOS ESPERADOS:');
        console.log('   • 20-50 páginas analisadas');
        console.log('   • 500-2000 elementos HTML mapeados');
        console.log('   • 50-200 funcionalidades identificadas');
        console.log('   • 10-100 APIs descobertas');
        console.log('   • Screenshots de todas as páginas');
        console.log('   • Relatório completo em Markdown e JSON');
        console.log('');
    }

    async getCredentials() {
        console.log('🔐 CONFIGURAÇÃO DE ACESSO');
        console.log('=========================');
        console.log('');
        console.log('Para demonstrar o sistema, precisamos das credenciais do Portal MEEP:');
        console.log('');
        
        // Para demo, você deve editar estas linhas com suas credenciais reais
        const USERNAME = 'SEU_EMAIL_AQUI';  // ⚠️ SUBSTITUA pelo seu email
        const PASSWORD = 'SUA_SENHA_AQUI';  // ⚠️ SUBSTITUA pela sua senha
        
        if (USERNAME === 'SEU_EMAIL_AQUI' || PASSWORD === 'SUA_SENHA_AQUI') {
            console.log('❌ CREDENCIAIS NÃO CONFIGURADAS!');
            console.log('');
            console.log('Para executar a demo, edite o arquivo demo-meep.js e substitua:');
            console.log('   const USERNAME = "SEU_EMAIL_AQUI";');
            console.log('   const PASSWORD = "SUA_SENHA_AQUI";');
            console.log('');
            console.log('Pelas suas credenciais reais do Portal MEEP.');
            console.log('');
            console.log('Alternativamente, execute o setup completo:');
            console.log('   node setup-meep-automation.js');
            return null;
        }
        
        return { username: USERNAME, password: PASSWORD };
    }

    async runDemo() {
        try {
            await this.showWelcome();
            
            const credentials = await this.getCredentials();
            if (!credentials) {
                return;
            }
            
            console.log('🚀 INICIANDO DEMO...');
            console.log('====================');
            console.log('');
            
            // Criar diretórios de demo
            await this.createDemoDirectories();
            
            // Inicializar automação
            const automation = new MeepAutomationSupreme(this.demoConfig);
            
            console.log('🔥 EXECUTANDO ANÁLISE COMPLETA...');
            console.log('(Esta demo pode levar 3-10 minutos dependendo do sistema)');
            console.log('');
            
            // Executar análise completa
            const startTime = Date.now();
            const report = await automation.runCompleteAnalysis(
                credentials.username,
                credentials.password
            );
            const duration = Math.round((Date.now() - startTime) / 1000);
            
            // Mostrar resultados da demo
            await this.showDemoResults(report, duration);
            
        } catch (error) {
            console.error('❌ Erro durante demo:', error.message);
            
            if (error.message.includes('Login falhou')) {
                console.error('');
                console.error('💡 POSSÍVEIS CAUSAS:');
                console.error('   • Credenciais incorretas');
                console.error('   • Portal MEEP indisponível');
                console.error('   • Mudanças na página de login');
                console.error('');
                console.error('✅ SOLUÇÕES:');
                console.error('   • Verifique suas credenciais');
                console.error('   • Tente fazer login manual primeiro');
                console.error('   • Execute o setup: node setup-meep-automation.js');
            }
        }
    }

    async createDemoDirectories() {
        const dirs = [
            this.demoConfig.outputDir,
            this.demoConfig.screenshotDir,
            path.join(this.demoConfig.outputDir, 'pages'),
            path.join(this.demoConfig.outputDir, 'reports'),
            path.join(this.demoConfig.outputDir, 'apis')
        ];
        
        for (const dir of dirs) {
            await fs.promises.mkdir(dir, { recursive: true });
        }
    }

    async showDemoResults(report, duration) {
        console.log('');
        console.log('🎉 DEMO FINALIZADA COM SUCESSO!');
        console.log('===============================');
        console.log('');
        console.log('📊 RESULTADOS DA ANÁLISE:');
        console.log(`   ⏱️  Duração: ${duration}s`);
        console.log(`   📄 Páginas Analisadas: ${report.summary.pagesAnalyzed}`);
        console.log(`   🔍 Elementos Encontrados: ${report.summary.totalElements}`);
        console.log(`   ⚡ Funcionalidades Identificadas: ${report.summary.totalFunctionalities}`);
        console.log(`   🌐 APIs Descobertas: ${report.summary.apiCallsIntercepted}`);
        console.log('');
        
        console.log('📁 ARQUIVOS GERADOS:');
        console.log(`   📋 Relatório Markdown: ${this.demoConfig.outputDir}/reports/MEEP-COMPLETE-ANALYSIS.md`);
        console.log(`   📊 Dados JSON: ${this.demoConfig.outputDir}/reports/meep-complete-analysis.json`);
        console.log(`   📐 Diagrama Mermaid: ${this.demoConfig.outputDir}/reports/meep-architecture-diagram.mmd`);
        console.log(`   📸 Screenshots: ${this.demoConfig.screenshotDir}/`);
        console.log(`   🔗 APIs: ${this.demoConfig.outputDir}/apis/discovered-apis.json`);
        console.log('');
        
        // Mostrar amostra das funcionalidades encontradas
        if (report.functionalitiesByType && Object.keys(report.functionalitiesByType).length > 0) {
            console.log('🎯 FUNCIONALIDADES DESCOBERTAS:');
            Object.entries(report.functionalitiesByType).forEach(([type, funcs]) => {
                const displayType = type.replace('_', ' ').toUpperCase();
                console.log(`   ${displayType}: ${funcs.length} ocorrências`);
            });
            console.log('');
        }
        
        // Mostrar amostra das páginas analisadas
        if (report.pages && report.pages.length > 0) {
            console.log('📄 PÁGINAS PRINCIPAIS ANALISADAS:');
            report.pages.slice(0, 5).forEach((page, index) => {
                const title = page.title || 'Sem título';
                console.log(`   ${index + 1}. ${title} (${page.elementCounts.total} elementos)`);
            });
            if (report.pages.length > 5) {
                console.log(`   ... e mais ${report.pages.length - 5} páginas`);
            }
            console.log('');
        }
        
        console.log('🔥 PRÓXIMOS PASSOS:');
        console.log('   1. Examine o relatório Markdown para visão geral');
        console.log('   2. Analise os dados JSON para detalhes técnicos');
        console.log('   3. Veja os screenshots das páginas capturadas');
        console.log('   4. Use o diagrama Mermaid para visualizar a arquitetura');
        console.log('');
        console.log('💡 Para análise completa sem limite de páginas:');
        console.log('   node setup-meep-automation.js');
        console.log('   node run-meep-analysis.js');
        console.log('');
        console.log('===============================');
        console.log('DEMO MEEP AUTOMATION SUPREME CONCLUÍDA! 🚀');
    }
}

// Executar demo se chamado diretamente
if (require.main === module) {
    const demo = new MeepDemo();
    demo.runDemo().catch(console.error);
}

module.exports = MeepDemo;
