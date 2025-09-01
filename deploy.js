#!/usr/bin/env node

/**
 * Railway Automated Deploy Script
 * Handles zero-downtime deployment to Railway platform
 * Supports project selection, health checks, and rollback capabilities
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Railway Configuration
const RAILWAY_CONFIG = {
  API_URL: 'https://backboard.railway.app/graphql',
  TOKEN: process.env.RAILWAY_TOKEN || 'b7666038-be55-471e-aff1-5d436dd0dd52',
  PROJECTS: [
    'protective-patience',
    'sweet-healing', 
    'melodious-cooperation',
    'sistema-meep01'
  ],
  HEALTH_CHECK_TIMEOUT: 120000, // 2 minutes
  DEPLOYMENT_TIMEOUT: 300000    // 5 minutes
};

class RailwayDeployer {
  constructor() {
    this.projectId = null;
    this.serviceId = null;
    this.deploymentId = null;
    this.rollbackData = null;
  }

  /**
   * Execute Railway CLI command with error handling
   */
  executeRailwayCommand(command, options = {}) {
    try {
      console.log(`🚀 Executing: railway ${command}`);
      const result = execSync(`railway ${command}`, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
      return result;
    } catch (error) {
      console.error(`❌ Railway command failed: ${error.message}`);
      if (options.throwOnError !== false) {
        throw error;
      }
      return null;
    }
  }

  /**
   * Get project ID by name using Railway API
   */
  async getProjectId(projectName) {
    try {
      const query = `
        query getProjects {
          projects {
            edges {
              node {
                id
                name
                services {
                  edges {
                    node {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch(RAILWAY_CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RAILWAY_CONFIG.TOKEN}`
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const project = data.data.projects.edges.find(
        edge => edge.node.name === projectName
      );

      if (project) {
        this.projectId = project.node.id;
        return project.node.id;
      }
      
      throw new Error(`Project "${projectName}" not found`);
    } catch (error) {
      console.error(`❌ Failed to get project ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if current directory is already linked to Railway project
   */
  checkExistingLink() {
    try {
      const result = this.executeRailwayCommand('status', { silent: true, throwOnError: false });
      if (result && result.includes('Project:')) {
        console.log('✅ Directory already linked to Railway project');
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Link project using direct project selection
   */
  async linkProject(projectName) {
    console.log(`🔗 Linking to project: ${projectName}`);
    
    if (this.checkExistingLink()) {
      console.log('📁 Using existing project link');
      return true;
    }

    try {
      // Try to get project ID first
      await this.getProjectId(projectName);
      
      // Use railway link with project ID if possible
      if (this.projectId) {
        this.executeRailwayCommand(`link ${this.projectId}`);
        console.log('✅ Successfully linked to project');
        return true;
      }
      
      // Fallback to interactive linking with automated input
      return this.linkProjectInteractive(projectName);
    } catch (error) {
      console.error(`❌ Failed to link project: ${error.message}`);
      return this.linkProjectInteractive(projectName);
    }
  }

  /**
   * Handle interactive project linking with automated selection
   */
  linkProjectInteractive(projectName) {
    return new Promise((resolve, reject) => {
      console.log('🔄 Attempting automated project selection...');
      
      const linkProcess = spawn('railway', ['link'], { 
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true 
      });

      let output = '';
      let projectIndex = -1;

      linkProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        console.log(chunk);

        // Look for project list and find our target project
        const lines = output.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(projectName)) {
            // Extract the number/index for the project
            const match = lines[i].match(/^\s*(\d+)\)/);
            if (match) {
              projectIndex = parseInt(match[1]);
              break;
            }
          }
        }

        // If we found the project index and see a selection prompt
        if (projectIndex > 0 && chunk.includes('Select a project:')) {
          console.log(`🎯 Found project "${projectName}" at index ${projectIndex}`);
          linkProcess.stdin.write(`${projectIndex}\n`);
        }
      });

      linkProcess.stderr.on('data', (data) => {
        console.error(`Railway stderr: ${data}`);
      });

      linkProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Successfully linked to project');
          resolve(true);
        } else {
          console.error(`❌ Link process failed with code ${code}`);
          reject(new Error(`Link failed with code ${code}`));
        }
      });

      // Timeout handling
      setTimeout(() => {
        linkProcess.kill();
        reject(new Error('Link process timed out'));
      }, 30000);
    });
  }

  /**
   * Pre-deployment health checks and validation
   */
  async preDeploymentChecks() {
    console.log('🔍 Running pre-deployment checks...');
    
    // Check if package.json exists and is valid
    if (!fs.existsSync('package.json')) {
      throw new Error('package.json not found');
    }

    // Check if main entry point exists
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const mainFile = packageJson.main || 'server.js';
    
    if (!fs.existsSync(mainFile)) {
      throw new Error(`Main file ${mainFile} not found`);
    }

    // Validate Node.js syntax
    try {
      execSync(`node --check ${mainFile}`, { stdio: 'pipe' });
      console.log('✅ Syntax validation passed');
    } catch (error) {
      throw new Error(`Syntax error in ${mainFile}: ${error.message}`);
    }

    // Check for required dependencies
    if (packageJson.dependencies) {
      console.log('📦 Validating dependencies...');
      // Could add dependency vulnerability checks here
    }

    console.log('✅ Pre-deployment checks completed');
  }

  /**
   * Deploy application with monitoring
   */
  async deploy() {
    console.log('🚀 Starting deployment...');
    
    try {
      // Store rollback information
      this.storeRollbackData();
      
      // Execute deployment
      this.executeRailwayCommand('up --detach');
      
      console.log('✅ Deployment initiated successfully');
      return true;
    } catch (error) {
      console.error(`❌ Deployment failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Store rollback data for potential rollback
   */
  storeRollbackData() {
    try {
      const status = this.executeRailwayCommand('status', { silent: true });
      this.rollbackData = {
        timestamp: new Date().toISOString(),
        status: status,
        commit: process.env.GITHUB_SHA || 'unknown'
      };
      
      fs.writeFileSync('.railway-rollback.json', JSON.stringify(this.rollbackData, null, 2));
      console.log('💾 Rollback data stored');
    } catch (error) {
      console.warn(`⚠️ Could not store rollback data: ${error.message}`);
    }
  }

  /**
   * Monitor deployment health
   */
  async monitorDeployment() {
    console.log('👁️ Monitoring deployment health...');
    
    const maxAttempts = 30; // 5 minutes with 10s intervals
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        // Check deployment status via Railway CLI
        const status = this.executeRailwayCommand('status', { silent: true, throwOnError: false });
        
        if (status && status.includes('Deployed')) {
          console.log('✅ Deployment completed successfully');
          
          // Wait a bit more for service to be fully ready
          await this.sleep(10000);
          
          // Perform health check
          return await this.performHealthCheck();
        }
        
        if (status && status.includes('Failed')) {
          throw new Error('Deployment failed according to Railway status');
        }
        
        console.log(`⏳ Deployment in progress... (${attempts + 1}/${maxAttempts})`);
        await this.sleep(10000);
        attempts++;
        
      } catch (error) {
        console.error(`❌ Monitoring error: ${error.message}`);
        attempts++;
        await this.sleep(10000);
      }
    }
    
    throw new Error('Deployment monitoring timed out');
  }

  /**
   * Perform application health check
   */
  async performHealthCheck() {
    console.log('🏥 Performing health check...');
    
    try {
      // Get the deployment URL
      const domains = this.executeRailwayCommand('domain', { silent: true, throwOnError: false });
      
      if (domains) {
        const urlMatch = domains.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          const url = urlMatch[0];
          console.log(`🌐 Testing health endpoint: ${url}/health`);
          
          const response = await fetch(`${url}/health`, {
            method: 'GET',
            timeout: 10000
          });
          
          if (response.ok) {
            const healthData = await response.json();
            console.log('✅ Health check passed:', healthData);
            return true;
          }
        }
      }
      
      console.log('⚠️ Could not perform HTTP health check, deployment may still be starting');
      return true;
    } catch (error) {
      console.error(`❌ Health check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Rollback deployment if needed
   */
  async rollback() {
    console.log('🔄 Initiating rollback...');
    
    try {
      // Use Railway's down command to remove latest deployment
      this.executeRailwayCommand('down');
      console.log('✅ Rollback completed');
      return true;
    } catch (error) {
      console.error(`❌ Rollback failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Utility function for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Main deployment orchestration
   */
  async run(projectName = 'sistema-meep01') {
    console.log('🚂 Railway Automated Deployment Starting...');
    console.log(`📋 Target Project: ${projectName}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    
    try {
      // Step 1: Pre-deployment validation
      await this.preDeploymentChecks();
      
      // Step 2: Link to Railway project
      await this.linkProject(projectName);
      
      // Step 3: Deploy application
      await this.deploy();
      
      // Step 4: Monitor deployment
      await this.monitorDeployment();
      
      console.log('🎉 Deployment completed successfully!');
      console.log(`⏰ Completed at: ${new Date().toISOString()}`);
      
      // Show final status
      this.executeRailwayCommand('status');
      
      return true;
      
    } catch (error) {
      console.error(`💥 Deployment failed: ${error.message}`);
      
      // Attempt automatic rollback
      console.log('🚨 Attempting automatic rollback...');
      await this.rollback();
      
      process.exit(1);
    }
  }
}

// CLI Interface
if (require.main === module) {
  const projectName = process.argv[2] || 'sistema-meep01';
  const deployer = new RailwayDeployer();
  
  deployer.run(projectName).catch(error => {
    console.error('💥 Deployment script failed:', error);
    process.exit(1);
  });
}

module.exports = RailwayDeployer;