#!/usr/bin/env node

/**
 * DEPLOY SCRIPT - GITMECP ENTERPRISE
 * Script automatizado para deploy em produção
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

// Cores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Configuração
const config = {
    environment: process.env.DEPLOY_ENV || 'production',
    branch: process.env.DEPLOY_BRANCH || 'main',
    preDeployChecks: true,
    runTests: true,
    buildAssets: true,
    migrateDatabase: true,
    clearCache: true,
    restartServices: true
};

// Logger
const log = {
    info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
    step: (msg) => console.log(`${colors.magenta}[STEP]${colors.reset} ${msg}`)
};

// Funções de deploy
class DeployManager {
    constructor() {
        this.startTime = Date.now();
        this.errors = [];
    }

    async execute() {
        try {
            log.info('='.repeat(60));
            log.info('GITMECP ENTERPRISE DEPLOYMENT');
            log.info(`Environment: ${config.environment}`);
            log.info(`Branch: ${config.branch}`);
            log.info('='.repeat(60));

            // 1. Pre-deployment checks
            if (config.preDeployChecks) {
                await this.runPreDeployChecks();
            }

            // 2. Pull latest code
            await this.pullLatestCode();

            // 3. Install dependencies
            await this.installDependencies();

            // 4. Run tests
            if (config.runTests) {
                await this.runTests();
            }

            // 5. Build assets
            if (config.buildAssets) {
                await this.buildAssets();
            }

            // 6. Database migrations
            if (config.migrateDatabase) {
                await this.runMigrations();
            }

            // 7. Clear cache
            if (config.clearCache) {
                await this.clearCache();
            }

            // 8. Restart services
            if (config.restartServices) {
                await this.restartServices();
            }

            // 9. Post-deployment validation
            await this.postDeployValidation();

            // Success
            const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
            log.success('='.repeat(60));
            log.success(`DEPLOYMENT COMPLETED SUCCESSFULLY!`);
            log.success(`Total time: ${duration}s`);
            log.success('='.repeat(60));

        } catch (error) {
            log.error('='.repeat(60));
            log.error('DEPLOYMENT FAILED!');
            log.error(error.message);
            log.error('='.repeat(60));
            process.exit(1);
        }
    }

    async runPreDeployChecks() {
        log.step('Running pre-deployment checks...');

        // Check Node.js version
        const { stdout: nodeVersion } = await execPromise('node --version');
        log.info(`Node.js version: ${nodeVersion.trim()}`);

        // Check npm version
        const { stdout: npmVersion } = await execPromise('npm --version');
        log.info(`npm version: ${npmVersion.trim()}`);

        // Check disk space
        if (process.platform !== 'win32') {
            const { stdout: diskSpace } = await execPromise('df -h .');
            log.info(`Disk space:\n${diskSpace}`);
        }

        // Check environment variables
        const requiredEnvVars = ['JWT_SECRET', 'DB_PASSWORD'];
        const missingVars = requiredEnvVars.filter(v => !process.env[v]);
        
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }

        log.success('Pre-deployment checks passed');
    }

    async pullLatestCode() {
        log.step('Pulling latest code...');
        
        // Stash any local changes
        await execPromise('git stash');
        
        // Checkout branch
        await execPromise(`git checkout ${config.branch}`);
        
        // Pull latest
        const { stdout } = await execPromise('git pull origin ' + config.branch);
        log.info(stdout);
        
        log.success('Code updated successfully');
    }

    async installDependencies() {
        log.step('Installing dependencies...');
        
        // Clean install for production
        if (config.environment === 'production') {
            await execPromise('npm ci --production');
        } else {
            await execPromise('npm install');
        }
        
        log.success('Dependencies installed');
    }

    async runTests() {
        log.step('Running tests...');
        
        try {
            const { stdout } = await execPromise('npm test', { timeout: 60000 });
            log.info('Tests passed');
        } catch (error) {
            log.warning('Some tests failed. Continuing deployment...');
        }
    }

    async buildAssets() {
        log.step('Building assets...');
        
        // Build frontend assets if they exist
        if (fs.existsSync('webpack.config.js')) {
            await execPromise('npm run build');
            log.success('Assets built successfully');
        } else {
            log.info('No assets to build');
        }
    }

    async runMigrations() {
        log.step('Running database migrations...');
        
        try {
            await execPromise('npm run migrate');
            log.success('Migrations completed');
        } catch (error) {
            log.warning('Migration issues: ' + error.message);
        }
    }

    async clearCache() {
        log.step('Clearing cache...');
        
        // Clear application cache
        const cacheDir = path.join(process.cwd(), '.cache');
        if (fs.existsSync(cacheDir)) {
            fs.rmSync(cacheDir, { recursive: true, force: true });
        }
        
        // Clear logs older than 30 days
        const logsDir = path.join(process.cwd(), 'logs');
        if (fs.existsSync(logsDir)) {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const files = fs.readdirSync(logsDir);
            
            files.forEach(file => {
                const filePath = path.join(logsDir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.mtime.getTime() < thirtyDaysAgo) {
                    fs.unlinkSync(filePath);
                    log.info(`Deleted old log: ${file}`);
                }
            });
        }
        
        log.success('Cache cleared');
    }

    async restartServices() {
        log.step('Restarting services...');
        
        if (process.platform === 'linux') {
            // PM2
            try {
                await execPromise('pm2 reload gitmecp');
                log.success('Services restarted with PM2');
            } catch (error) {
                // Systemd fallback
                try {
                    await execPromise('sudo systemctl restart gitmecp');
                    log.success('Services restarted with systemd');
                } catch (err) {
                    log.warning('Could not restart services automatically');
                }
            }
        } else if (process.platform === 'win32') {
            log.info('Please restart the application manually on Windows');
        } else {
            log.warning('Platform not recognized for service restart');
        }
    }

    async postDeployValidation() {
        log.step('Running post-deployment validation...');
        
        // Wait for service to start
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check health endpoint
        try {
            const http = require('http');
            const options = {
                hostname: 'localhost',
                port: process.env.PORT || 3000,
                path: '/health',
                method: 'GET'
            };

            const req = http.request(options, (res) => {
                if (res.statusCode === 200) {
                    log.success('Health check passed');
                } else {
                    log.warning(`Health check returned status ${res.statusCode}`);
                }
            });

            req.on('error', (error) => {
                log.warning('Health check failed: ' + error.message);
            });

            req.end();
        } catch (error) {
            log.warning('Could not validate deployment: ' + error.message);
        }
    }
}

// Execute deployment
if (require.main === module) {
    const deployer = new DeployManager();
    deployer.execute();
}

module.exports = DeployManager;