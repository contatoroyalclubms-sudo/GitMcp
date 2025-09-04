/**
 * MEEP QUICK MAPPER - Sessão Logada
 * Versão simplificada que usa sua sessão já logada
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

class MeepQuickMapper {
    constructor() {
        this.discoveries = [];
        this.moduleCount = 0;
    }

    async connectToExistingSession() {
        console.log('🔗 Conectando à sua sessão logada do Chrome...');
        
        try {
            // Conectar no Chrome existente
            this.browser = await chromium.connectOverCDP('http://localhost:9222');
            
            // Pegar contexto existente
            const contexts = this.browser.contexts();
            const context = contexts[0];
            
            // Encontrar aba do Portal MEEP
            const pages = context.pages();
            this.page = pages.find(p => p.url().includes('portal.meep.com.br'));
            
            if (!this.page) {
                console.log('📍 Não encontrei aba do Portal MEEP. Criando nova...');
                this.page = await context.newPage();
                await this.page.goto('https://beta.portal.meep.com.br/private/dashboard/general');
            }
            
            console.log(`✅ Conectado! URL atual: ${this.page.url()}`);
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao conectar:', error.message);
            console.log('💡 SOLUÇÃO RÁPIDA:');
            console.log('1. Abra Chrome normalmente');
            console.log('2. Vá para: https://beta.portal.meep.com.br');
            console.log('3. Faça login: toretomal@icloud.com / 352162Cl@');
            console.log('4. Deixe a aba aberta e execute este comando:');
            console.log('   chrome.exe --remote-debugging-port=9222');
            return false;
        }
    }

    async quickAnalyze() {
        console.log('⚡ ANÁLISE RÁPIDA DOS MÓDULOS PENDENTES');
        console.log('=====================================\n');
        
        // Lista simplificada dos principais módulos pendentes
        const modules = [
            { name: 'Gestão de Venda', url: '/private/gestao-venda' },
            { name: 'Marketing', url: '/private/marketing' },
            { name: 'Business Intelligence', url: '/private/bi' },
            { name: 'Equipe', url: '/private/equipe' },
            { name: 'Pedidos', url: '/private/pedidos' },
            { name: 'Automação', url: '/private/automacao' },
            { name: 'Integração', url: '/private/integracao' },
            { name: 'Ingressos', url: '/private/ingressos' },
            { name: 'Soluções Online', url: '/private/solucoes-online' },
            { name: 'Financeiro - Antecipação', url: '/private/financeiro/antecipacao' },
            { name: 'Financeiro - Split', url: '/private/financeiro/split' },
            { name: 'PDV - Operador', url: '/private/pdv/operador' },
            { name: 'ERP - Grupos', url: '/private/meeperp/grupos-insumos' }
        ];

        for (const module of modules) {
            try {
                console.log(`🔍 [${this.moduleCount + 1}/${modules.length}] ${module.name}`);
                
                // Navegar para o módulo
                const fullUrl = `https://beta.portal.meep.com.br${module.url}`;
                await this.page.goto(fullUrl, { timeout: 15000 });
                await this.page.waitForTimeout(2000);
                
                // Extrair dados básicos da página
                const data = await this.page.evaluate(() => {
                    const result = {
                        title: document.title,
                        buttons: [],
                        metrics: [],
                        tables: 0,
                        forms: 0
                    };
                    
                    // Contar elementos
                    result.buttons = Array.from(document.querySelectorAll('button, [role="button"]'))
                        .map(btn => btn.textContent?.trim()).filter(text => text && text.length > 0);
                    
                    result.tables = document.querySelectorAll('table').length;
                    result.forms = document.querySelectorAll('form').length;
                    
                    // Buscar números/métricas
                    document.querySelectorAll('*').forEach(el => {
                        const text = el.textContent?.trim();
                        if (text && /^\d{1,3}([.,]\d{3})*$/.test(text)) {
                            const num = parseInt(text.replace(/\D/g, ''));
                            if (num > 100) {
                                result.metrics.push(text);
                            }
                        }
                    });
                    
                    return result;
                });
                
                this.discoveries.push({
                    module: module.name,
                    url: fullUrl,
                    ...data,
                    timestamp: new Date().toISOString()
                });
                
                console.log(`   ✅ ${data.buttons.length} botões, ${data.tables} tabelas, ${data.metrics.length} métricas`);
                this.moduleCount++;
                
            } catch (error) {
                console.log(`   ❌ Erro: ${error.message}`);
            }
        }

        // Gerar relatório rápido
        await this.generateQuickReport();
    }

    async generateQuickReport() {
        console.log('\n📊 GERANDO RELATÓRIO...\n');
        
        // Criar diretório
        await fs.mkdir('./Quick-MEEP-Analysis', { recursive: true });
        
        // Relatório em Markdown
        const markdown = this.generateMarkdown();
        await fs.writeFile('./Quick-MEEP-Analysis/QUICK-MEEP-REPORT.md', markdown);
        
        // Dados em JSON
        await fs.writeFile('./Quick-MEEP-Analysis/quick-data.json', JSON.stringify(this.discoveries, null, 2));
        
        console.log('✅ RELATÓRIO GERADO!');
        console.log('📁 Arquivos criados:');
        console.log('   📋 ./Quick-MEEP-Analysis/QUICK-MEEP-REPORT.md');
        console.log('   📊 ./Quick-MEEP-Analysis/quick-data.json');
        console.log('');
        console.log('🎯 RESUMO RÁPIDO:');
        console.log(`   📄 Módulos analisados: ${this.moduleCount}`);
        
        const totalButtons = this.discoveries.reduce((sum, d) => sum + d.buttons.length, 0);
        const totalTables = this.discoveries.reduce((sum, d) => sum + d.tables, 0);
        const totalMetrics = this.discoveries.reduce((sum, d) => sum + d.metrics.length, 0);
        
        console.log(`   🔘 Total de botões: ${totalButtons}`);
        console.log(`   📊 Total de tabelas: ${totalTables}`);
        console.log(`   📈 Total de métricas: ${totalMetrics}`);
    }

    generateMarkdown() {
        const md = [];
        
        md.push('# MEEP Portal - Análise Rápida dos Módulos Pendentes');
        md.push('');
        md.push(`**Data:** ${new Date().toLocaleDateString('pt-BR')}`);
        md.push(`**Módulos Analisados:** ${this.moduleCount}`);
        md.push('');
        
        md.push('## 📊 Resumo por Módulo');
        md.push('');
        md.push('| Módulo | Botões | Tabelas | Métricas | Status |');
        md.push('|--------|--------|---------|----------|--------|');
        
        this.discoveries.forEach(discovery => {
            md.push(`| ${discovery.module} | ${discovery.buttons.length} | ${discovery.tables} | ${discovery.metrics.length} | ✅ |`);
        });
        
        md.push('');
        md.push('## 🔍 Detalhes por Módulo');
        md.push('');
        
        this.discoveries.forEach((discovery, index) => {
            md.push(`### ${index + 1}. ${discovery.module}`);
            md.push('');
            md.push(`- **URL:** ${discovery.url}`);
            md.push(`- **Título:** ${discovery.title}`);
            md.push(`- **Elementos:** ${discovery.buttons.length} botões, ${discovery.tables} tabelas`);
            md.push('');
            
            if (discovery.buttons.length > 0) {
                md.push('**Principais Ações:**');
                discovery.buttons.slice(0, 10).forEach(btn => {
                    md.push(`- ${btn}`);
                });
                md.push('');
            }
            
            if (discovery.metrics.length > 0) {
                md.push('**Métricas Encontradas:**');
                discovery.metrics.slice(0, 5).forEach(metric => {
                    md.push(`- ${metric}`);
                });
                md.push('');
            }
        });
        
        md.push('---');
        md.push('*Relatório gerado automaticamente - Análise Rápida MEEP*');
        
        return md.join('\n');
    }

    async cleanup() {
        // Não fechar browser pois não criamos ele
        console.log('🔄 Mantendo sua sessão do Chrome aberta...');
    }
}

// Função principal simplificada
async function runQuickAnalysis() {
    const mapper = new MeepQuickMapper();
    
    try {
        const connected = await mapper.connectToExistingSession();
        
        if (!connected) {
            console.log('\n🚀 INICIAR CHROME COM DEBUG:');
            console.log('chrome.exe --remote-debugging-port=9222');
            console.log('Depois execute: node meep-quick-logged.js');
            return;
        }
        
        await mapper.quickAnalyze();
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await mapper.cleanup();
    }
}

// Executar
if (require.main === module) {
    runQuickAnalysis().catch(console.error);
}

module.exports = MeepQuickMapper;
