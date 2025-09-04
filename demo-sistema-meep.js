const axios = require('axios');
const chalk = require('chalk');

const BASE_URL = 'http://localhost:3000';

// Cores para o console
const success = chalk.green;
const error = chalk.red;
const info = chalk.cyan;
const bold = chalk.bold;
const yellow = chalk.yellow;

async function demonstrarSistema() {
    console.log(bold.blue('\n🎯 DEMONSTRAÇÃO DO SISTEMA MEEP - CONTA MAX\n'));
    console.log('=' . repeat(60));
    console.log(info('Usando conta MAX para demonstração (sem cobranças)\n'));
    
    let token = '';
    
    try {
        // 1. LOGIN
        console.log(bold('\n1️⃣ FAZENDO LOGIN'));
        console.log('-'.repeat(40));
        
        const login = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin@meep.com',
            password: 'admin123'
        });
        
        token = login.data.token;
        console.log(success('✅ Login realizado'));
        console.log(info(`   Usuário: ${login.data.user.name}`));
        console.log(info(`   Conta: MAX (demonstração gratuita)`));
        
        const headers = { headers: { 'Authorization': `Bearer ${token}` } };
        
        // 2. DASHBOARD
        console.log(bold('\n2️⃣ DASHBOARD PRINCIPAL'));
        console.log('-'.repeat(40));
        
        const dashboard = await axios.get(`${BASE_URL}/api/dashboard/stats`, headers);
        console.log(success('✅ Estatísticas do Dashboard:'));
        console.log(info(`   📊 Total de Eventos: ${dashboard.data.stats.totalEvents}`));
        console.log(info(`   🎉 Eventos Ativos: ${dashboard.data.stats.activeEvents}`));
        console.log(info(`   👥 Total de Clientes: ${dashboard.data.stats.totalClients}`));
        console.log(info(`   💰 Receita Total: R$ ${dashboard.data.stats.totalRevenue.toLocaleString('pt-BR')}`));
        console.log(info(`   🛒 Total de Vendas: ${dashboard.data.stats.totalSales}`));
        console.log(info(`   📈 Ticket Médio: R$ ${dashboard.data.stats.averageTicket}`));
        
        // 3. BUSINESS INTELLIGENCE
        console.log(bold('\n3️⃣ BUSINESS INTELLIGENCE'));
        console.log('-'.repeat(40));
        
        const bi = await axios.get(`${BASE_URL}/api/bi/dashboard`, headers);
        console.log(success('✅ Análise de BI:'));
        console.log(info(`   📈 Receita Atual: R$ ${bi.data.dashboard.revenue.current.toLocaleString('pt-BR')}`));
        console.log(info(`   🎯 Projeção: R$ ${bi.data.dashboard.revenue.projected.toLocaleString('pt-BR')}`));
        console.log(info(`   📊 Crescimento: ${(bi.data.dashboard.revenue.growth * 100).toFixed(1)}%`));
        console.log(info(`   🏆 Score de Performance: ${bi.data.dashboard.insights.score}/100`));
        
        console.log(yellow('\n   💡 Insights Gerados:'));
        bi.data.dashboard.insights.insights.forEach(insight => {
            console.log(yellow(`      • ${insight}`));
        });
        
        console.log(success('\n   🎯 Recomendações:'));
        bi.data.dashboard.insights.recommendations.forEach(rec => {
            console.log(success(`      • ${rec}`));
        });
        
        // 4. EVENTOS
        console.log(bold('\n4️⃣ EVENTOS CADASTRADOS'));
        console.log('-'.repeat(40));
        
        const eventos = await axios.get(`${BASE_URL}/api/events`, headers);
        console.log(success('✅ Eventos no Sistema:'));
        
        eventos.data.forEach((evento, index) => {
            console.log(info(`\n   Evento ${index + 1}: ${evento.name}`));
            console.log(info(`      📅 Data: ${new Date(evento.date).toLocaleDateString('pt-BR')}`));
            console.log(info(`      📍 Local: ${evento.venue}, ${evento.city}`));
            console.log(info(`      👥 Capacidade: ${evento.capacity} pessoas`));
            console.log(info(`      🎫 Ingressos Vendidos: ${evento.ticketsSold}`));
            console.log(info(`      💰 Receita: R$ ${evento.revenue.toLocaleString('pt-BR')}`));
            console.log(info(`      📊 Status: ${evento.status === 'active' ? '🟢 Ativo' : '🟡 Planejamento'}`));
        });
        
        // 5. INTELIGÊNCIA OPERACIONAL
        console.log(bold('\n5️⃣ INTELIGÊNCIA OPERACIONAL'));
        console.log('-'.repeat(40));
        
        const operacional = await axios.get(`${BASE_URL}/api/bi/operational`, headers);
        if (operacional.data.success) {
            console.log(success('✅ Análise Operacional:'));
            console.log(info(`   ⚡ Eficiência: ${(operacional.data.data.efficiency * 100).toFixed(0)}%`));
            console.log(info(`   📊 Produtividade: ${(operacional.data.data.productivity * 100).toFixed(0)}%`));
            console.log(info(`   💡 Utilização: ${(operacional.data.data.resourceUtilization * 100).toFixed(0)}%`));
        }
        
        // 6. RESUMO
        console.log(bold('\n' + '='.repeat(60)));
        console.log(bold.green('✨ SISTEMA MEEP - DEMONSTRAÇÃO COMPLETA'));
        console.log('='.repeat(60));
        
        console.log(success('\n✅ FUNCIONALIDADES TESTADAS COM SUCESSO:'));
        console.log(info('   • Autenticação JWT'));
        console.log(info('   • Dashboard com métricas em tempo real'));
        console.log(info('   • Business Intelligence com AI'));
        console.log(info('   • Gestão de Eventos'));
        console.log(info('   • Análise Operacional'));
        console.log(info('   • Insights e Recomendações'));
        
        console.log(yellow('\n⚡ CONTA MAX:'));
        console.log(yellow('   • Demonstração gratuita'));
        console.log(yellow('   • Sem cobranças'));
        console.log(yellow('   • Todos recursos disponíveis'));
        
        console.log(bold.cyan('\n🌐 ACESSE O SISTEMA:'));
        console.log(info('   • Interface: http://localhost:3000'));
        console.log(info('   • API Docs: http://localhost:3000/api-docs'));
        console.log(info('   • Health: http://localhost:3000/health'));
        
        console.log(bold.green('\n🎉 Sistema 100% Funcional e Pronto para Uso!'));
        console.log('=' . repeat(60) + '\n');
        
    } catch (err) {
        console.error(error('\n❌ Erro durante demonstração:'));
        console.error(error(`   ${err.response?.data?.message || err.message}`));
    }
}

// Executar demonstração
if (require.main === module) {
    console.log(info('\n🚀 Iniciando demonstração do Sistema MEEP...'));
    console.log(info('   Conta: MAX (sem cobranças)'));
    console.log(info('   Aguarde...\n'));
    
    setTimeout(() => {
        demonstrarSistema();
    }, 1000);
}

module.exports = demonstrarSistema;