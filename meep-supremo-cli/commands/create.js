const chalk = require('chalk');

function createCommand(name, options = {}) {
  console.log(chalk.cyan(`\n📁 Criando projeto: ${name}`));
  console.log(chalk.yellow(`📋 Template: ${options.template || 'full-stack'}`));
  console.log(chalk.yellow(`🔌 Porta: ${options.port || '3000'}`));
  
  // Por enquanto, redirecionar para magic command
  console.log(chalk.blue('\n🔄 Redirecionando para setup mágico...'));
  
  const magicCommand = require('./magic');
  return magicCommand(name, options);
}

module.exports = createCommand;
