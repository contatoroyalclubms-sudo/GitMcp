#!/usr/bin/env node

/**
 * MEEP System Validator
 * Valida a integridade de todos os módulos do sistema
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔═══════════════════════════════════════════════════════════╗
║         MEEP SYSTEM VALIDATOR v3.0.0                     ║
╚═══════════════════════════════════════════════════════════╝
`);

const validationResults = {
    passed: [],
    failed: [],
    warnings: []
};

// 1. Verificar arquivos essenciais
console.log('📁 Verificando arquivos essenciais...');
const essentialFiles = [
    'meep-integrated-system.js',
    'server.js',
    'package.json',
    '.env',
    'config/database.js',
    'config/cache.js',
    'config/logger.js'
];

essentialFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        validationResults.passed.push(`✅ ${file} encontrado`);
    } else if (file === '.env') {
        validationResults.warnings.push(`⚠️  ${file} não encontrado (criar a partir de .env.example)`);
    } else {
        validationResults.failed.push(`❌ ${file} NÃO encontrado`);
    }
});

// 2. Verificar rotas
console.log('\n🛣️  Verificando módulos de rotas...');
const routes = [
    'auth', 'ai', 'business-intelligence', 'cashless', 
    'clients', 'config', 'dashboard', 'events',
    'finance', 'health', 'inventory', 'marketing',
    'menu', 'pdv', 'reports', 'sales', 'team'
];

routes.forEach(route => {
    const routePath = path.join(__dirname, 'routes', `${route}.js`);
    if (fs.existsSync(routePath)) {
        try {
            require(routePath);
            validationResults.passed.push(`✅ Rota ${route} carregada`);
        } catch (error) {
            validationResults.failed.push(`❌ Erro ao carregar rota ${route}: ${error.message}`);
        }
    } else {
        validationResults.failed.push(`❌ Rota ${route} não encontrada`);
    }
});

// 3. Verificar modelos
console.log('\n📊 Verificando modelos de dados...');
const models = [
    'CashlessCard',
    'EventManagement',
    'ProductMenu',
    'SystemConfig',
    'Transaction'
];

models.forEach(model => {
    const modelPath = path.join(__dirname, 'models', `${model}.js`);
    if (fs.existsSync(modelPath)) {
        try {
            require(modelPath);
            validationResults.passed.push(`✅ Modelo ${model} carregado`);
        } catch (error) {
            validationResults.warnings.push(`⚠️  Modelo ${model}: ${error.message}`);
        }
    } else {
        validationResults.failed.push(`❌ Modelo ${model} não encontrado`);
    }
});

// 4. Verificar dashboards HTML
console.log('\n🖥️  Verificando dashboards...');
const dashboards = [
    'index.html',
    'dashboard-supremo.html',
    'eventos-supremo.html',
    'pdv.html',
    'financeiro.html',
    'business-intelligence-supremo.html'
];

dashboards.forEach(dashboard => {
    const dashPath = path.join(__dirname, 'public', dashboard);
    if (fs.existsSync(dashPath)) {
        const size = fs.statSync(dashPath).size;
        if (size > 1000) {
            validationResults.passed.push(`✅ Dashboard ${dashboard} (${(size/1024).toFixed(1)}KB)`);
        } else {
            validationResults.warnings.push(`⚠️  Dashboard ${dashboard} muito pequeno`);
        }
    } else {
        validationResults.failed.push(`❌ Dashboard ${dashboard} não encontrado`);
    }
});

// 5. Verificar dependências críticas
console.log('\n📦 Verificando dependências...');
const criticalDeps = [
    'express',
    'sequelize',
    'jsonwebtoken',
    'bcryptjs',
    'cors',
    'helmet',
    'dotenv'
];

const packageJson = require('./package.json');
criticalDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
        validationResults.passed.push(`✅ Dependência ${dep} configurada`);
    } else {
        validationResults.failed.push(`❌ Dependência ${dep} não encontrada`);
    }
});

// 6. Verificar configurações de ambiente
console.log('\n⚙️  Verificando configurações...');
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const requiredEnvVars = [
        'NODE_ENV',
        'PORT',
        'JWT_SECRET',
        'DATABASE_URL'
    ];
    
    requiredEnvVars.forEach(envVar => {
        if (envContent.includes(envVar)) {
            validationResults.passed.push(`✅ Variável ${envVar} configurada`);
        } else {
            validationResults.warnings.push(`⚠️  Variável ${envVar} não configurada`);
        }
    });
}

// 7. Verificar estrutura de pastas
console.log('\n📂 Verificando estrutura de pastas...');
const requiredFolders = [
    'routes',
    'models',
    'config',
    'middleware',
    'public',
    'logs',
    'ai-core'
];

requiredFolders.forEach(folder => {
    if (fs.existsSync(path.join(__dirname, folder))) {
        const files = fs.readdirSync(path.join(__dirname, folder));
        validationResults.passed.push(`✅ Pasta ${folder} (${files.length} arquivos)`);
    } else {
        validationResults.failed.push(`❌ Pasta ${folder} não encontrada`);
    }
});

// 8. Verificar AI Engine
console.log('\n🤖 Verificando AI Engine...');
const aiEnginePath = path.join(__dirname, 'ai-core', 'meep-ai-engine.js');
if (fs.existsSync(aiEnginePath)) {
    try {
        const AIEngine = require(aiEnginePath);
        const engine = new AIEngine();
        validationResults.passed.push('✅ AI Engine (versão mock) disponível');
    } catch (error) {
        validationResults.warnings.push(`⚠️  AI Engine com erro: ${error.message}`);
    }
} else {
    validationResults.failed.push('❌ AI Engine não encontrado');
}

// ================== RELATÓRIO FINAL ==================
console.log('\n' + '='.repeat(60));
console.log('📋 RELATÓRIO DE VALIDAÇÃO');
console.log('='.repeat(60));

console.log(`\n✅ APROVADOS: ${validationResults.passed.length}`);
if (validationResults.passed.length > 0 && process.argv.includes('--verbose')) {
    validationResults.passed.forEach(item => console.log(`  ${item}`));
}

if (validationResults.warnings.length > 0) {
    console.log(`\n⚠️  AVISOS: ${validationResults.warnings.length}`);
    validationResults.warnings.forEach(item => console.log(`  ${item}`));
}

if (validationResults.failed.length > 0) {
    console.log(`\n❌ FALHAS: ${validationResults.failed.length}`);
    validationResults.failed.forEach(item => console.log(`  ${item}`));
}

// Estatísticas finais
const total = validationResults.passed.length + 
              validationResults.warnings.length + 
              validationResults.failed.length;

const successRate = ((validationResults.passed.length / total) * 100).toFixed(1);

console.log('\n' + '='.repeat(60));
console.log('📊 ESTATÍSTICAS');
console.log('='.repeat(60));
console.log(`Total de verificações: ${total}`);
console.log(`Taxa de sucesso: ${successRate}%`);

// Determinar status final
let finalStatus = '';
if (validationResults.failed.length === 0) {
    if (validationResults.warnings.length === 0) {
        finalStatus = '🎉 SISTEMA 100% VALIDADO - PRONTO PARA PRODUÇÃO!';
    } else {
        finalStatus = '✅ SISTEMA VALIDADO - Revisar avisos antes da produção';
    }
} else if (validationResults.failed.length <= 3) {
    finalStatus = '⚠️  SISTEMA PARCIALMENTE VALIDADO - Correções necessárias';
} else {
    finalStatus = '❌ SISTEMA COM FALHAS CRÍTICAS - Não apto para produção';
}

console.log(`\n${finalStatus}\n`);

// Salvar relatório
const report = {
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    results: validationResults,
    statistics: {
        total: total,
        passed: validationResults.passed.length,
        warnings: validationResults.warnings.length,
        failed: validationResults.failed.length,
        successRate: successRate
    },
    status: finalStatus
};

const reportPath = `validation-report-${Date.now()}.json`;
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📄 Relatório salvo em: ${reportPath}`);

// Código de saída
process.exit(validationResults.failed.length > 0 ? 1 : 0);