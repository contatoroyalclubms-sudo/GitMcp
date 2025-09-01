#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Railway API configuration
const RAILWAY_TOKEN = 'b7666038-be55-471e-aff1-5d436dd0dd52';
const PROJECT_NAME = 'protective-patience';
const API_BASE = 'https://api.railway.app';

console.log('🚀 Railway Direct API Deploy Starting...');
console.log(`📋 Target Project: ${PROJECT_NAME}`);

// Function to make Railway API calls
async function railwayAPI(endpoint, method = 'GET', body = null) {
    const fetch = (await import('node-fetch')).default;
    
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${RAILWAY_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
}

// Deploy using Railway CLI with environment setup
async function deployWithCLI() {
    try {
        // Set Railway token as environment variable
        process.env.RAILWAY_TOKEN = RAILWAY_TOKEN;
        
        console.log('🔧 Setting up Railway environment...');
        
        // Create .railway directory if it doesn't exist
        const railwayDir = path.join(process.cwd(), '.railway');
        if (!fs.existsSync(railwayDir)) {
            fs.mkdirSync(railwayDir, { recursive: true });
        }
        
        // Try to get project list and find our project
        console.log('🔍 Finding project...');
        
        try {
            const result = execSync('railway projects', { 
                env: { ...process.env, RAILWAY_TOKEN }, 
                encoding: 'utf8',
                timeout: 30000
            });
            console.log('📋 Available projects:', result);
        } catch (error) {
            console.log('⚠️ Could not list projects, proceeding with direct deploy...');
        }
        
        // Create railway.json with project configuration
        const railwayConfig = {
            project: PROJECT_NAME,
            service: "web"
        };
        
        fs.writeFileSync(path.join(railwayDir, 'config.json'), JSON.stringify(railwayConfig, null, 2));
        console.log('✅ Railway config created');
        
        // Create .railwayconfig file
        const railwayConfigContent = `{"projectId": "${PROJECT_NAME}", "environmentId": "production"}`;
        fs.writeFileSync('.railwayconfig', railwayConfigContent);
        console.log('✅ Railway config file created');
        
        // Try direct deployment
        console.log('🚀 Starting deployment...');
        
        const deployCmd = 'railway up --detach';
        console.log(`🔧 Running: ${deployCmd}`);
        
        const deployResult = execSync(deployCmd, { 
            env: { ...process.env, RAILWAY_TOKEN },
            encoding: 'utf8',
            timeout: 120000
        });
        
        console.log('✅ Deploy result:', deployResult);
        
        // Get deployment status
        setTimeout(() => {
            try {
                const statusResult = execSync('railway status', { 
                    env: { ...process.env, RAILWAY_TOKEN },
                    encoding: 'utf8'
                });
                console.log('📊 Status:', statusResult);
            } catch (error) {
                console.log('⚠️ Status check failed:', error.message);
            }
        }, 5000);
        
        return true;
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        return false;
    }
}

// Alternative: Use Git push deployment
async function deployWithGit() {
    try {
        console.log('🔄 Trying Git deployment method...');
        
        // Initialize git if not already
        try {
            execSync('git status', { encoding: 'utf8' });
        } catch (error) {
            console.log('🔧 Initializing Git repository...');
            execSync('git init', { encoding: 'utf8' });
            execSync('git add .', { encoding: 'utf8' });
            execSync('git commit -m "Initial deployment commit"', { encoding: 'utf8' });
        }
        
        // Try to add Railway remote
        const railwayRemote = `https://railway.app/project/${PROJECT_NAME}`;
        
        try {
            execSync(`git remote add railway ${railwayRemote}`, { encoding: 'utf8' });
        } catch (error) {
            console.log('⚠️ Railway remote might already exist');
        }
        
        // Push to Railway
        console.log('🚀 Pushing to Railway...');
        const pushResult = execSync('git push railway main --force', { 
            encoding: 'utf8',
            timeout: 120000
        });
        
        console.log('✅ Git push result:', pushResult);
        return true;
        
    } catch (error) {
        console.error('❌ Git deployment failed:', error.message);
        return false;
    }
}

// Main deployment function
async function deploy() {
    console.log('🎯 Starting Railway deployment process...');
    
    // Method 1: Try CLI deployment
    console.log('📋 Method 1: Railway CLI deployment');
    const cliSuccess = await deployWithCLI();
    
    if (cliSuccess) {
        console.log('🎉 Deployment successful via Railway CLI!');
        return;
    }
    
    // Method 2: Try Git deployment
    console.log('📋 Method 2: Git deployment');
    const gitSuccess = await deployWithGit();
    
    if (gitSuccess) {
        console.log('🎉 Deployment successful via Git!');
        return;
    }
    
    console.log('❌ All deployment methods failed. Check your configuration.');
    console.log('💡 Fallback options:');
    console.log('1. Run: railway login');
    console.log('2. Run: railway link');
    console.log('3. Run: railway up');
}

// Execute deployment
deploy().catch(error => {
    console.error('💥 Critical deployment error:', error);
    process.exit(1);
});