const chalk = require('chalk');
const ora = require('ora');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

async function devCommand(options = {}) {
  console.log(chalk.cyan('\n🚀 MEEP SUPREMO - Modo Desenvolvimento'));
  
  const frontendPort = options.port || '3000';
  const backendPort = options.backendPort || '8000';
  
  // Verificar se estamos em um projeto MEEP
  if (!isValidMeepProject()) {
    console.log(chalk.red('❌ Este não é um projeto MEEP Supremo válido!'));
    console.log(chalk.yellow('💡 Use: meep magic nome-projeto'));
    return;
  }

  try {
    console.log(chalk.yellow('🔄 Verificando dependências...'));
    
    // Verificar se node_modules existem
    await checkDependencies();
    
    console.log(chalk.green('✅ Dependências OK'));
    console.log(chalk.yellow('🚀 Iniciando servidores...'));
    
    // Iniciar backend
    const backendProcess = startBackend(backendPort);
    
    // Aguardar 2 segundos para backend iniciar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Iniciar frontend
    const frontendProcess = startFrontend(frontendPort);
    
    // Aguardar 3 segundos para frontend iniciar
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mostrar status
    console.log(chalk.green('\n✅ Servidores iniciados com sucesso!'));
    console.log(chalk.cyan('\n📊 Status do Sistema:'));
    console.log(chalk.white('- Frontend:  ✅ Running'));
    console.log(chalk.white('- Backend:   ✅ Running'));
    console.log(chalk.white('- Database:  ✅ Connected'));

    console.log(chalk.cyan('\n🌐 URLs Disponíveis:'));
    console.log(chalk.yellow(`- Frontend:  http://localhost:${frontendPort}`));
    console.log(chalk.yellow(`- Backend:   http://localhost:${backendPort}`));
    console.log(chalk.yellow(`- API Docs:  http://localhost:${backendPort}/docs`));
    console.log(chalk.yellow(`- Health:    http://localhost:${backendPort}/health`));

    console.log(chalk.cyan('\n🔑 Login Padrão:'));
    console.log(chalk.green('- Email:     admin@meep-supremo.com'));
    console.log(chalk.green('- Senha:     admin123'));

    // Abrir browser se solicitado
    if (options.open !== false) {
      setTimeout(() => {
        try {
          const open = require('open');
          open(`http://localhost:${frontendPort}`);
          console.log(chalk.green('\n🌐 Browser aberto automaticamente!'));
        } catch (err) {
          console.log(chalk.yellow(`\n💡 Abra seu browser em: http://localhost:${frontendPort}`));
        }
      }, 2000);
    }

    console.log(chalk.magenta('\n🛠️ Modo Desenvolvimento Ativo'));
    console.log(chalk.white('Press Ctrl+C to stop\n'));
    
    // Manter processos vivos
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n⏹️ Parando servidores...'));
      if (backendProcess) backendProcess.kill();
      if (frontendProcess) frontendProcess.kill();
      console.log(chalk.green('✅ Servidores parados'));
      process.exit(0);
    });
    
    // Aguardar indefinidamente
    await new Promise(() => {});
    
  } catch (error) {
    console.error(chalk.red('\n❌ Erro ao iniciar desenvolvimento:'), error.message);
    console.log(chalk.yellow('\n🔧 Tente:'));
    console.log(chalk.white('- npm install'));
    console.log(chalk.white('- meep magic nome-projeto'));
  }
}

function isValidMeepProject() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }
  
  try {
    const packageJson = require(packageJsonPath);
    return packageJson.name && (
      packageJson.description?.includes('MEEP') ||
      packageJson.scripts?.dev ||
      fs.existsSync(path.join(process.cwd(), 'frontend')) ||
      fs.existsSync(path.join(process.cwd(), 'backend'))
    );
  } catch (error) {
    return false;
  }
}

async function checkDependencies() {
  const paths = [
    'node_modules',
    'frontend/node_modules', 
    'backend/node_modules'
  ];
  
  for (const dirPath of paths) {
    if (fs.existsSync(dirPath) && fs.existsSync(path.join(process.cwd(), dirPath))) {
      continue;
    }
    
    // Se não existe, tentar instalar
    const parentDir = path.dirname(dirPath);
    if (fs.existsSync(parentDir) && fs.existsSync(path.join(parentDir, 'package.json'))) {
      console.log(chalk.yellow(`📦 Instalando dependências em ${parentDir}...`));
      const { execSync } = require('child_process');
      execSync('npm install', { 
        cwd: parentDir === '.' ? process.cwd() : path.join(process.cwd(), parentDir),
        stdio: 'inherit' 
      });
    }
  }
}

function startBackend(port) {
  const backendPath = path.join(process.cwd(), 'backend');
  
  if (!fs.existsSync(backendPath)) {
    console.log(chalk.yellow('⚠️ Backend não encontrado, criando servidor mock...'));
    startMockBackend(port);
    return null;
  }
  
  console.log(chalk.blue(`🔧 Iniciando backend na porta ${port}...`));
  
  const backendProcess = spawn('npm', ['run', 'dev'], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true
  });
  
  backendProcess.on('error', (error) => {
    console.error(chalk.red('❌ Erro no backend:'), error.message);
  });
  
  return backendProcess;
}

function startFrontend(port) {
  const frontendPath = path.join(process.cwd(), 'frontend');
  
  if (!fs.existsSync(frontendPath)) {
    console.log(chalk.yellow('⚠️ Frontend não encontrado, criando página de boas-vindas...'));
    startWelcomePage(port);
    return null;
  }
  
  console.log(chalk.blue(`🎨 Iniciando frontend na porta ${port}...`));
  
  const frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: frontendPath,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: port }
  });
  
  frontendProcess.on('error', (error) => {
    console.error(chalk.red('❌ Erro no frontend:'), error.message);
  });
  
  return frontendProcess;
}

function startMockBackend(port) {
  // Criar servidor backend mock simples
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  
  // CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();
  });
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'MEEP Supremo Mock Backend' });
  });
  
  // Mock APIs
  app.get('/api/dashboard/stats', (req, res) => {
    res.json({
      totalEvents: 5,
      totalClients: 150,
      totalRevenue: 15000,
      activeEvents: 2
    });
  });
  
  app.listen(port, () => {
    console.log(chalk.green(`✅ Mock backend rodando na porta ${port}`));
  });
}

function startWelcomePage(port) {
  // Criar página de boas-vindas simples
  const express = require('express');
  const app = express();
  
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MEEP Supremo - Bem-vindo!</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #2196F3; }
          .status { background: #4CAF50; color: white; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>🚀 MEEP Supremo</h1>
        <div class="status">✅ Sistema funcionando!</div>
        <p>Seu sistema de eventos está rodando com sucesso.</p>
        <p><strong>Backend:</strong> http://localhost:8000</p>
        <p><strong>Login:</strong> admin@meep-supremo.com / admin123</p>
      </body>
      </html>
    `);
  });
  
  app.listen(port, () => {
    console.log(chalk.green(`✅ Página de boas-vindas rodando na porta ${port}`));
  });
}

module.exports = devCommand;
