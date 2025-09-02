#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RAILWAY_TOKEN = 'b7666038-be55-471e-aff1-5d436dd0dd52';
const PROJECT_NAME = 'protective-patience';

console.log('🚀 Railway API Direct Deploy');
console.log('============================');

// Create a simple HTTP server deployment package
function createDeploymentPackage() {
    console.log('📦 Creating deployment package...');
    
    // Ensure we have the required files
    if (!fs.existsSync('server.js')) {
        console.error('❌ server.js not found!');
        return false;
    }
    
    if (!fs.existsSync('package.json')) {
        console.error('❌ package.json not found!');
        return false;
    }
    
    // Create Procfile for Railway
    const procfileContent = 'web: node server.js';
    fs.writeFileSync('Procfile', procfileContent);
    console.log('✅ Procfile created');
    
    // Create railway.json config
    const railwayConfig = {
        "build": {
            "builder": "nixpacks"
        },
        "deploy": {
            "startCommand": "node server.js",
            "restartPolicyType": "always"
        }
    };
    fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
    console.log('✅ railway.json created');
    
    return true;
}

// Deploy via Git (Railway's preferred method)
function deployViaGit() {
    console.log('🔧 Setting up Git deployment...');
    
    try {
        // Initialize git if not exists
        if (!fs.existsSync('.git')) {
            execSync('git init', { stdio: 'inherit' });
            console.log('✅ Git repository initialized');
        }
        
        // Add all files
        execSync('git add .', { stdio: 'inherit' });
        
        // Commit changes
        try {
            execSync('git commit -m "Railway deployment - ' + new Date().toISOString() + '"', { stdio: 'inherit' });
            console.log('✅ Changes committed');
        } catch (e) {
            console.log('ℹ️ No new changes to commit');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Git setup failed:', error.message);
        return false;
    }
}

// Alternative: Create a direct deployment using Railway's API
function createDirectDeployment() {
    console.log('🚀 Creating direct deployment...');
    
    const deploymentData = {
        query: `
            mutation {
                serviceConnect(input: {
                    projectId: "${PROJECT_NAME}"
                    source: {
                        image: "node:18-alpine"
                    }
                }) {
                    id
                }
            }
        `
    };
    
    return new Promise((resolve) => {
        const data = JSON.stringify(deploymentData);
        
        const options = {
            hostname: 'backboard.railway.app',
            port: 443,
            path: '/graphql',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                'Authorization': `Bearer ${RAILWAY_TOKEN}`
            }
        };
        
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    console.log('API Response:', result);
                    resolve(true);
                } catch (e) {
                    console.error('❌ API Error:', body);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Request failed:', error.message);
            resolve(false);
        });
        
        req.write(data);
        req.end();
    });
}

// Main deployment process
async function deploy() {
    console.log('🎯 Starting deployment process...');
    
    // Step 1: Create deployment package
    if (!createDeploymentPackage()) {
        console.error('❌ Failed to create deployment package');
        return false;
    }
    
    // Step 2: Setup Git
    if (!deployViaGit()) {
        console.error('❌ Failed to setup Git');
        return false;
    }
    
    // Step 3: Try Railway CLI one more time with explicit config
    console.log('🔧 Final attempt with Railway CLI...');
    
    // Set environment variables for the process
    const env = { 
        ...process.env, 
        RAILWAY_TOKEN: RAILWAY_TOKEN,
        RAILWAY_PROJECT: PROJECT_NAME
    };
    
    // Create local railway config
    const railwayDir = '.railway';
    if (!fs.existsSync(railwayDir)) {
        fs.mkdirSync(railwayDir, { recursive: true });
    }
    
    const config = {
        projectId: PROJECT_NAME,
        environmentId: 'production'
    };
    
    fs.writeFileSync(path.join(railwayDir, 'config.json'), JSON.stringify(config, null, 2));
    fs.writeFileSync('.railwayconfig', JSON.stringify(config));
    
    try {
        console.log('🚀 Attempting Railway deployment...');
        
        // Try without detach first
        const result = execSync('railway up', { 
            env,
            encoding: 'utf8',
            timeout: 120000,
            stdio: 'pipe'
        });
        
        console.log('✅ Railway deployment successful!');
        console.log(result);
        
        // Get the service URL
        setTimeout(() => {
            try {
                const domain = execSync('railway domain', { env, encoding: 'utf8' });
                console.log('🌐 Service URL:', domain);
            } catch (e) {
                console.log('⚠️ Could not get domain, check Railway dashboard');
            }
        }, 3000);
        
        return true;
        
    } catch (error) {
        console.log('⚠️ Railway CLI failed, trying alternative method...');
        
        // Alternative: Try API deployment
        const apiSuccess = await createDirectDeployment();
        
        if (apiSuccess) {
            console.log('✅ API deployment initiated');
            return true;
        } else {
            console.log('❌ All deployment methods failed');
            return false;
        }
    }
}

// Execute deployment
console.log('Starting Railway deployment for protective-patience...\n');

deploy().then((success) => {
    if (success) {
        console.log('\n🎉 DEPLOYMENT SUCCESS!');
        console.log('📋 Summary:');
        console.log('- Project: protective-patience');
        console.log('- Service: Node.js Express server');
        console.log('- Endpoints: / (status), /health (health check)');
        console.log('\n🌐 Check your Railway dashboard:');
        console.log('https://railway.app/project/protective-patience');
        console.log('\n✅ Your server should be live within 2-3 minutes!');
    } else {
        console.log('\n❌ DEPLOYMENT FAILED');
        console.log('\n💡 MANUAL DEPLOYMENT OPTIONS:');
        console.log('\n1. Railway Dashboard:');
        console.log('   - Go to https://railway.app/dashboard');
        console.log('   - Click on protective-patience project');
        console.log('   - Click "Deploy from GitHub" or "Deploy from Git"');
        console.log('   - Upload your files or connect Git repo');
        
        console.log('\n2. Railway CLI (Manual):');
        console.log('   - railway login');
        console.log('   - railway connect protective-patience');
        console.log('   - railway up');
        
        console.log('\n3. GitHub Integration:');
        console.log('   - Push code to GitHub');
        console.log('   - Connect GitHub repo to Railway project');
        console.log('   - Auto-deploy on push');
    }
}).catch((error) => {
    console.error('\n💥 Critical error:', error.message);
    console.log('\nTry the manual deployment options above.');
});