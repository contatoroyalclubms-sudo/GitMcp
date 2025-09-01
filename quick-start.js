#!/usr/bin/env node
/**
 * Quick Start - Configuração e Deploy Rápido
 */

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Cores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Função para executar comandos
function exec(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    if (!silent) console.log(output);
    return { success: true, output };
  } catch (error) {
    if (!silent) console.error(`${colors.red}Erro: ${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

// Banner
function showBanner() {
  console.clear();
  console.log(colors.cyan + '='.repeat(60));
  console.log('   _____ _ _   __  __  _____ _____  ');
  console.log('  / ____(_) | |  \\/  |/ ____|  __ \\ ');
  console.log(' | |  __ _| |_| \\  / | |    | |__) |');
  console.log(' | | |_ | | __| |\\/| | |    |  ___/ ');
  console.log(' | |__| | | |_| |  | | |____| |     ');
  console.log('  \\_____|_|\\__|_|  |_|\\_____|_|     ');
  console.log('');
  console.log('       Quick Deploy for Railway');
  console.log('='.repeat(60) + colors.reset);
}

// Menu principal
async function mainMenu() {
  showBanner();
  
  console.log(`\n${colors.yellow}ESCOLHA UMA OPÇÃO:${colors.reset}\n`);
  console.log('1. 🚀 Deploy Completo (Git + Railway)');
  console.log('2. 📦 Apenas Git Push');
  console.log('3. 🔍 Verificar Status');
  console.log('4. 📊 Ver Logs do Railway');
  console.log('5. 🏥 Health Check');
  console.log('6. ⚙️  Configurar Variáveis');
  console.log('7. 🔧 Instalar Dependências');
  console.log('8. 🏃 Rodar Servidor Local');
  console.log('0. ❌ Sair\n');
  
  return new Promise((resolve) => {
    rl.question('Opção: ', (answer) => {
      resolve(answer);
    });
  });
}

// Funções para cada opção
async function deployCompleto() {
  console.log(`\n${colors.green}🚀 INICIANDO DEPLOY COMPLETO${colors.reset}\n`);
  
  // Git add
  console.log('📦 Adicionando arquivos...');
  exec('git add -A');
  
  // Git commit
  const message = `Deploy: ${new Date().toISOString()}`;
  console.log('💾 Commitando...');
  exec(`git commit -m "${message}"`, true);
  
  // Git push
  console.log('📤 Push para GitHub...');
  const push = exec('git push origin production-deploy-v1');
  
  if (!push.success) {
    console.log('Tentando pull primeiro...');
    exec('git pull origin production-deploy-v1');
    exec('git push origin production-deploy-v1');
  }
  
  // Railway deploy
  console.log('🚂 Deploy no Railway...');
  const railway = exec('railway up', true);
  
  if (!railway.success) {
    console.log(`${colors.yellow}Railway CLI não configurado${colors.reset}`);
    console.log('Use: railway link');
  } else {
    console.log(`${colors.green}✅ Deploy iniciado!${colors.reset}`);
  }
}

async function gitPush() {
  console.log(`\n${colors.blue}📦 GIT PUSH${colors.reset}\n`);
  exec('git add -A');
  exec('git commit -m "Update"', true);
  exec('git push origin production-deploy-v1');
}

async function verificarStatus() {
  console.log(`\n${colors.cyan}🔍 VERIFICANDO STATUS${colors.reset}\n`);
  
  // Git status
  console.log('📋 Git Status:');
  exec('git status --short');
  
  // Railway status
  console.log('\n🚂 Railway Status:');
  const railway = exec('railway status', true);
  if (railway.success) {
    console.log(railway.output);
  } else {
    console.log('Railway CLI não configurado');
  }
  
  // Node modules
  console.log('\n📦 Dependências:');
  if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules instalado');
  } else {
    console.log('❌ node_modules não encontrado');
  }
}

async function verLogs() {
  console.log(`\n${colors.magenta}📊 LOGS DO RAILWAY${colors.reset}\n`);
  exec('railway logs --tail 50');
}

async function healthCheck() {
  console.log(`\n${colors.green}🏥 HEALTH CHECK${colors.reset}\n`);
  exec('node health-check.js');
}

async function configurarVariaveis() {
  console.log(`\n${colors.yellow}⚙️ CONFIGURAR VARIÁVEIS${colors.reset}\n`);
  
  console.log('Variáveis necessárias:');
  console.log('1. NODE_ENV=production');
  console.log('2. PORT=3000');
  console.log('3. JWT_SECRET=<sua_chave_32_chars>');
  
  console.log('\nComandos:');
  console.log('railway variables set NODE_ENV=production');
  console.log('railway variables set PORT=3000');
  console.log('railway variables set JWT_SECRET=<sua_chave>');
  
  console.log('\n');
  const result = exec('railway variables', true);
  if (result.success) {
    console.log('Variáveis atuais:');
    console.log(result.output);
  }
}

async function instalarDependencias() {
  console.log(`\n${colors.blue}🔧 INSTALANDO DEPENDÊNCIAS${colors.reset}\n`);
  exec('npm install');
  console.log(`${colors.green}✅ Dependências instaladas!${colors.reset}`);
}

async function rodarLocal() {
  console.log(`\n${colors.cyan}🏃 RODANDO SERVIDOR LOCAL${colors.reset}\n`);
  console.log('Servidor rodando em: http://localhost:3000');
  console.log('Pressione Ctrl+C para parar\n');
  exec('npm start');
}

// Função principal
async function main() {
  let continuar = true;
  
  while (continuar) {
    const opcao = await mainMenu();
    
    switch(opcao) {
      case '1':
        await deployCompleto();
        break;
      case '2':
        await gitPush();
        break;
      case '3':
        await verificarStatus();
        break;
      case '4':
        await verLogs();
        break;
      case '5':
        await healthCheck();
        break;
      case '6':
        await configurarVariaveis();
        break;
      case '7':
        await instalarDependencias();
        break;
      case '8':
        await rodarLocal();
        break;
      case '0':
        continuar = false;
        console.log(`\n${colors.green}Até logo!${colors.reset}\n`);
        break;
      default:
        console.log(`${colors.red}Opção inválida!${colors.reset}`);
    }
    
    if (continuar && opcao !== '8') {
      await new Promise(resolve => {
        rl.question('\nPressione Enter para continuar...', resolve);
      });
    }
  }
  
  rl.close();
}

// Executar
if (require.main === module) {
  main().catch(console.error);
}