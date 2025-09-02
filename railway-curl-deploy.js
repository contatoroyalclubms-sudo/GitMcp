#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAILWAY_TOKEN = 'b7666038-be55-471e-aff1-5d436dd0dd52';
const PROJECT_NAME = 'protective-patience';

console.log('🚀 Railway cURL Deploy Starting...');
console.log(`📋 Target: ${PROJECT_NAME}`);

// Function to execute Railway API calls using cURL
function railwayAPI(endpoint, method = 'GET', data = null) {
    const url = `https://backboard.railway.app/graphql`;
    const headers = [
        '-H', `Authorization: Bearer ${RAILWAY_TOKEN}`,
        '-H', 'Content-Type: application/json'
    ];
    
    let curlCmd = ['curl', '-s', '-X', method, ...headers];
    
    if (data) {
        curlCmd.push('-d', JSON.stringify(data));
    }
    
    curlCmd.push(url);
    
    try {
        const result = execSync(curlCmd.join(' '), { encoding: 'utf8' });
        return JSON.parse(result);
    } catch (error) {
        console.error('API Error:', error.message);
        return null;
    }
}

// GraphQL query to get projects
function getProjects() {
    const query = {
        query: `
            query {
                projects {
                    edges {
                        node {
                            id
                            name
                            description
                            updatedAt
                        }
                    }
                }
            }
        `
    };
    
    console.log('🔍 Getting projects...');
    const result = railwayAPI('/graphql', 'POST', query);
    
    if (result && result.data && result.data.projects) {
        return result.data.projects.edges.map(edge => edge.node);
    }
    
    return [];
}

// Find project by name
function findProject(projects, name) {
    return projects.find(p => p.name === name);
}

// Create deployment using direct file upload
function createDeployment(projectId) {
    console.log('🚀 Creating deployment...');
    
    // First, let's try a simpler approach - create a git repo and push
    try {
        // Check if git repo exists
        if (!fs.existsSync('.git')) {
            console.log('🔧 Initializing git repository...');
            execSync('git init', { stdio: 'inherit' });
        }
        
        // Add all files
        execSync('git add .', { stdio: 'inherit' });
        
        // Check if there are any changes to commit
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            if (status.trim()) {
                execSync('git commit -m "Railway deployment commit"', { stdio: 'inherit' });
            }
        } catch (e) {
            // No changes to commit, or already committed
        }
        
        console.log('✅ Git repository ready');
        return true;
        
    } catch (error) {
        console.error('❌ Git setup failed:', error.message);
        return false;
    }
}

// Main deployment function
async function deploy() {
    console.log('🎯 Starting Railway deployment...');
    
    // Get projects
    const projects = getProjects();
    
    if (!projects || projects.length === 0) {
        console.error('❌ Could not retrieve projects');
        console.log('💡 Trying direct CLI approach...');
        return deployViaCLI();
    }
    
    console.log('📋 Available projects:');
    projects.forEach(p => console.log(`  - ${p.name} (${p.id})`));
    
    // Find target project
    const project = findProject(projects, PROJECT_NAME);
    
    if (!project) {
        console.error(`❌ Project '${PROJECT_NAME}' not found`);
        console.log('💡 Available projects:', projects.map(p => p.name).join(', '));
        return false;
    }
    
    console.log(`✅ Found project: ${project.name} (${project.id})`);
    
    // Create deployment
    const deploySuccess = createDeployment(project.id);
    
    if (deploySuccess) {
        console.log('🎉 Deployment prepared successfully!');
        console.log('💡 Now using Railway CLI to complete deployment...');
        return deployViaCLI(project.id);
    } else {
        console.error('❌ Deployment preparation failed');
        return false;
    }
}

// Deploy using Railway CLI with project ID
function deployViaCLI(projectId = null) {
    console.log('🔧 Using Railway CLI for deployment...');
    
    try {
        // Set environment variable for this process
        process.env.RAILWAY_TOKEN = RAILWAY_TOKEN;
        
        // Try to deploy without linking first
        console.log('🚀 Attempting direct deployment...');
        
        try {
            const result = execSync('railway up --detach', { 
                env: process.env,
                encoding: 'utf8',
                timeout: 60000
            });
            console.log('✅ Deployment result:', result);
            return true;
        } catch (deployError) {
            console.log('⚠️ Direct deployment failed, trying to link project first...');
            
            // Create railway config
            const railwayDir = '.railway';
            if (!fs.existsSync(railwayDir)) {
                fs.mkdirSync(railwayDir);
            }
            
            const config = {
                projectId: projectId || PROJECT_NAME,
                environmentId: 'production'
            };
            
            fs.writeFileSync(path.join(railwayDir, 'config.json'), JSON.stringify(config, null, 2));
            fs.writeFileSync('.railwayconfig', JSON.stringify(config));
            
            console.log('🔗 Railway config created, trying deployment again...');
            
            const result = execSync('railway up --detach', { 
                env: process.env,
                encoding: 'utf8',
                timeout: 60000
            });
            console.log('✅ Deployment successful:', result);
            return true;
        }
        
    } catch (error) {
        console.error('❌ CLI deployment failed:', error.message);
        
        // Final fallback - manual instructions
        console.log('\n💡 MANUAL DEPLOYMENT STEPS:');
        console.log('1. Open a new terminal');
        console.log(`2. Set token: set RAILWAY_TOKEN=${RAILWAY_TOKEN}`);
        console.log('3. Check auth: railway whoami');
        console.log(`4. Connect: railway connect ${PROJECT_NAME}`);
        console.log('5. Deploy: railway up');
        
        return false;
    }
}

// Execute deployment
deploy().then(success => {
    if (success) {
        console.log('\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!');
        
        // Try to get the deployment URL
        setTimeout(() => {
            try {
                process.env.RAILWAY_TOKEN = RAILWAY_TOKEN;
                const domain = execSync('railway domain', { 
                    env: process.env,
                    encoding: 'utf8' 
                });
                console.log('🌐 Service URL:', domain);
            } catch (e) {
                console.log('⚠️ Could not get service URL, check Railway dashboard');
            }
        }, 5000);
        
    } else {
        console.log('\n❌ DEPLOYMENT FAILED');
        console.log('Check the manual steps above or Railway dashboard');
    }
}).catch(error => {
    console.error('💥 Critical error:', error);
    process.exit(1);
});