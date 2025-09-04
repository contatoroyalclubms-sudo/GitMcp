#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const package = require('../package.json');

// Import commands
const createCommand = require('../commands/create');
const devCommand = require('../commands/dev');
const deployCommand = require('../commands/deploy');
const magicCommand = require('../commands/magic');
const importCommand = require('../commands/import');
const connectCommand = require('../commands/connect');

// Header
console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                    🚀 MEEP SUPREMO CLI                       ║
║              Sistema de Eventos Terminal-First               ║
║                   v${package.version} - Powered by Real MEEP Analysis        ║
╚══════════════════════════════════════════════════════════════╝
`));

// Configure CLI
program
  .name('meep')
  .description('CLI para criar sistemas de eventos baseados na engenharia reversa do Portal MEEP')
  .version(package.version);

// Commands
program
  .command('create <name>')
  .description('Criar novo projeto MEEP Supremo')
  .option('-t, --template <type>', 'Template (full-stack, api-only, dashboard-only)', 'full-stack')
  .option('-p, --port <port>', 'Porta do servidor', '3000')
  .option('--skip-install', 'Pular instalação de dependências')
  .action(createCommand);

program
  .command('dev')
  .description('Iniciar servidor de desenvolvimento')
  .option('-p, --port <port>', 'Porta do frontend', '3000')
  .option('-b, --backend-port <port>', 'Porta do backend', '8000')
  .option('--no-open', 'Não abrir browser automaticamente')
  .action(devCommand);

program
  .command('deploy')
  .description('Deploy automático para produção')
  .option('-p, --provider <provider>', 'Provider (railway, vercel, docker)', 'railway')
  .option('--domain <domain>', 'Domínio customizado')
  .action(deployCommand);

program
  .command('magic <name>')
  .description('🎯 Setup mágico: criar + configurar + iniciar em 30 segundos')
  .option('-o, --open', 'Abrir browser automaticamente', true)
  .action(magicCommand);

program
  .command('import')
  .description('Importar dados de fontes externas')
  .option('-s, --source <source>', 'Fonte (meep-real, csv, json)', 'csv')
  .option('-t, --type <type>', 'Tipo de dados (events, clients, analytics)')
  .option('-f, --file <file>', 'Arquivo de dados')
  .action(importCommand);

program
  .command('connect')
  .description('Conectar com Portal MEEP real')
  .option('-u, --url <url>', 'URL do Portal MEEP')
  .option('-e, --email <email>', 'Email de login')
  .option('--save-credentials', 'Salvar credenciais localmente')
  .action(connectCommand);

// Quick commands
program
  .command('start')
  .description('Alias para meep dev')
  .action(() => {
    console.log(chalk.yellow('🔄 Redirecionando para: meep dev'));
    devCommand();
  });

program
  .command('init')
  .description('Alias para meep magic')
  .argument('<name>')
  .action((name) => {
    console.log(chalk.yellow(`🔄 Redirecionando para: meep magic ${name}`));
    magicCommand(name);
  });

// Help examples
program.addHelpText('after', `

${chalk.cyan('Exemplos de uso:')}
  ${chalk.green('meep magic meu-evento')}           🎯 Setup completo em 30 segundos
  ${chalk.green('meep create festival-tech')}       📁 Criar projeto novo
  ${chalk.green('meep dev')}                        🚀 Desenvolvimento local
  ${chalk.green('meep deploy')}                     🌐 Deploy para produção
  ${chalk.green('meep import --source=csv --file=clientes.csv')} 📊 Importar dados
  ${chalk.green('meep connect --url=beta.portal.meep.com.br')}   🔗 Conectar MEEP real

${chalk.cyan('URLs após iniciar:')}
  ${chalk.yellow('Frontend:')}  http://localhost:3000
  ${chalk.yellow('Backend:')}   http://localhost:8000
  ${chalk.yellow('Database:')}  http://localhost:5555
  ${chalk.yellow('Login:')}     admin@meep-supremo.com / admin123

${chalk.magenta('💡 Dica:')} Use ${chalk.green('meep magic nome-projeto')} para setup instantâneo!
`);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
