/**
 * MEEP SUPER SIMPLES - Para quando você já está logado
 * Abre novo browser e pede para você fazer login uma vez
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

async function mapeamentoSimplesLogado() {
    console.log('🚀 MEEP ANÁLISE SUPER SIMPLES');
    console.log('==============================');
    console.log('1. Vou abrir o Chrome');
    console.log('2. Você faz login uma vez');
    console.log('3. Eu analiso tudo automaticamente!');
    console.log('');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        // Navegar para login
        console.log('📍 Abrindo Portal MEEP...');
        await page.goto('https://beta.portal.meep.com.br/');
        
        console.log('⏳ AGUARDANDO VOCÊ FAZER LOGIN...');
        console.log('💡 Faça login com: toretomal@icloud.com / 352162Cl@');
        console.log('⏳ Aguardarei até você chegar no dashboard...');
        
        // Aguardar até estar logado (URL conter /private/)
        await page.waitForURL('**/private/**', { timeout: 300000 }); // 5 minutos para login
        
        console.log('✅ Login detectado! Iniciando análise...\n');
        
        // Lista dos módulos para analisar
        const modulos = [
            'gestao-venda',
            'marketing', 
            'bi',
            'equipe',
            'pedidos',
            'automacao',
            'integracao',
            'ingressos',
            'solucoes-online'
        ];
        
        const resultados = [];
        
        for (let i = 0; i < modulos.length; i++) {
            const modulo = modulos[i];
            console.log(`🔍 [${i + 1}/${modulos.length}] Analisando: ${modulo}`);
            
            try {
                // Navegar para o módulo
                const url = `https://beta.portal.meep.com.br/private/${modulo}`;
                await page.goto(url, { timeout: 15000 });
                await page.waitForTimeout(3000);
                
                // Extrair dados da página
                const dados = await page.evaluate(() => {
                    return {
                        titulo: document.title,
                        url: window.location.href,
                        botoes: Array.from(document.querySelectorAll('button, [role="button"]'))
                            .map(b => b.textContent?.trim())
                            .filter(t => t && t.length > 0)
                            .slice(0, 10),
                        
                        inputs: document.querySelectorAll('input, select, textarea').length,
                        tabelas: document.querySelectorAll('table').length,
                        
                        numeros: Array.from(document.querySelectorAll('*'))
                            .map(el => el.textContent?.trim())
                            .filter(text => text && /^\d{1,3}([.,]\d{3})*$/.test(text))
                            .filter(text => parseInt(text.replace(/\D/g, '')) > 100)
                            .slice(0, 5),
                        
                        temDados: document.querySelector('table tbody tr, .data, [class*="item"]') !== null
                    };
                });
                
                resultados.push({
                    modulo,
                    ...dados,
                    status: 'sucesso'
                });
                
                console.log(`   ✅ ${dados.botoes.length} botões, ${dados.tabelas} tabelas, ${dados.numeros.length} métricas`);
                
            } catch (error) {
                console.log(`   ❌ Erro: ${error.message.substring(0, 50)}`);
                resultados.push({
                    modulo,
                    erro: error.message,
                    status: 'erro'
                });
            }
        }
        
        // Gerar relatório
        console.log('\n📊 GERANDO RELATÓRIO FINAL...');
        
        await fs.mkdir('./Relatorio-MEEP-Simples', { recursive: true });
        
        // Salvar JSON
        await fs.writeFile(
            './Relatorio-MEEP-Simples/dados.json', 
            JSON.stringify(resultados, null, 2)
        );
        
        // Gerar relatório em texto
        const relatorio = [];
        relatorio.push('# RELATÓRIO MEEP - ANÁLISE SIMPLES');
        relatorio.push('');
        relatorio.push(`Data: ${new Date().toLocaleString('pt-BR')}`);
        relatorio.push(`Módulos analisados: ${resultados.filter(r => r.status === 'sucesso').length}`);
        relatorio.push('');
        
        relatorio.push('## RESUMO');
        relatorio.push('');
        
        resultados.forEach((r, i) => {
            if (r.status === 'sucesso') {
                relatorio.push(`### ${i + 1}. ${r.modulo.toUpperCase()}`);
                relatorio.push(`- **Página:** ${r.titulo}`);
                relatorio.push(`- **Botões:** ${r.botoes.length}`);
                relatorio.push(`- **Inputs:** ${r.inputs}`);
                relatorio.push(`- **Tabelas:** ${r.tabelas}`);
                relatorio.push(`- **Tem Dados:** ${r.temDados ? 'Sim' : 'Não'}`);
                
                if (r.botoes.length > 0) {
                    relatorio.push('- **Principais Ações:**');
                    r.botoes.forEach(botao => relatorio.push(`  - ${botao}`));
                }
                
                if (r.numeros.length > 0) {
                    relatorio.push('- **Métricas:**');
                    r.numeros.forEach(num => relatorio.push(`  - ${num}`));
                }
                
                relatorio.push('');
            } else {
                relatorio.push(`### ${i + 1}. ${r.modulo.toUpperCase()} - ❌ ERRO`);
                relatorio.push(`- Erro: ${r.erro}`);
                relatorio.push('');
            }
        });
        
        await fs.writeFile(
            './Relatorio-MEEP-Simples/RELATORIO.md', 
            relatorio.join('\n')
        );
        
        console.log('✅ ANÁLISE CONCLUÍDA!');
        console.log('');
        console.log('📁 RESULTADOS:');
        console.log('   📋 ./Relatorio-MEEP-Simples/RELATORIO.md');
        console.log('   📊 ./Relatorio-MEEP-Simples/dados.json');
        console.log('');
        
        const sucessos = resultados.filter(r => r.status === 'sucesso').length;
        const erros = resultados.filter(r => r.status === 'erro').length;
        
        console.log(`🎯 ESTATÍSTICAS:`);
        console.log(`   ✅ Sucessos: ${sucessos}`);
        console.log(`   ❌ Erros: ${erros}`);
        console.log(`   📊 Total: ${resultados.length}`);
        
        console.log('\n⏳ Pressione Ctrl+C para fechar quando quiser...');
        
        // Manter browser aberto para você ver os resultados
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    } finally {
        console.log('🔄 Fechando browser...');
        await browser.close();
    }
}

// Executar
if (require.main === module) {
    mapeamentoSimplesLogado().catch(console.error);
}

module.exports = mapeamentoSimplesLogado;
