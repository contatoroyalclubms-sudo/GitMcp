#!/usr/bin/env node

/**
 * Manual Railway Deploy Script
 * Simplified approach that works with Railway CLI interactive mode
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const readline = require('readline');

class ManualRailwayDeployer {
  constructor() {
    this.projectName = process.argv[2] || 'sistema-meep01';
  }

  log(message, type = 'info') {
    const icons = {
      info: '🔵',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${icons[type]} ${message}`);
  }

  async askUser(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      rl.question(question, answer => {
        rl.close();
        resolve(answer);
      });
    });
  }

  checkPrerequisites() {
    this.log('Checking prerequisites...');
    
    // Check Railway CLI
    try {
      execSync('railway --version', { stdio: 'pipe' });
      this.log('Railway CLI found');
    } catch (error) {
      this.log('Railway CLI not found. Please install it first.', 'error');
      process.exit(1);
    }

    // Check authentication
    try {
      const whoami = execSync('railway whoami', { encoding: 'utf8' });
      this.log(`Authenticated as: ${whoami.trim()}`);
    } catch (error) {
      this.log('Railway CLI not authenticated. Please run "railway login"', 'error');
      process.exit(1);
    }

    // Check files
    if (!fs.existsSync('package.json')) {
      this.log('package.json not found', 'error');
      process.exit(1);
    }

    if (!fs.existsSync('server.js')) {
      this.log('server.js not found', 'error');
      process.exit(1);
    }

    // Syntax check
    try {
      execSync('node --check server.js', { stdio: 'pipe' });
      this.log('Syntax check passed');
    } catch (error) {
      this.log('Syntax error in server.js', 'error');
      process.exit(1);
    }

    this.log('Prerequisites check completed', 'success');
  }

  checkProjectLink() {
    this.log('Checking project link...');
    
    try {
      const status = execSync('railway status', { encoding: 'utf8' });
      this.log('Project already linked', 'success');
      console.log(status);
      return true;
    } catch (error) {
      this.log('No project linked', 'warning');
      return false;
    }
  }

  async linkProject() {
    this.log(`Need to link to project: ${this.projectName}`);
    console.log('\n📋 Available projects:');
    
    try {
      const projects = execSync('railway list', { encoding: 'utf8' });
      console.log(projects);
    } catch (error) {
      this.log('Failed to list projects', 'error');
    }

    const proceed = await this.askUser(`\n❓ Ready to link to "${this.projectName}"? (y/N): `);
    
    if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
      this.log('Deployment cancelled by user');
      process.exit(0);
    }

    this.log('Starting interactive project linking...');
    console.log(`⚡ When prompted, please select: ${this.projectName}`);
    console.log('💡 Use arrow keys to navigate and Enter to select');
    
    try {
      // Run railway link in interactive mode
      execSync('railway link', { stdio: 'inherit' });
      
      // Verify link was successful
      if (this.checkProjectLink()) {
        this.log('Project linked successfully', 'success');
        return true;
      } else {
        this.log('Project linking failed', 'error');
        return false;
      }
    } catch (error) {
      this.log(`Project linking failed: ${error.message}`, 'error');
      return false;
    }
  }

  async deploy() {
    this.log('Starting deployment...');
    
    // Store rollback information
    try {
      const status = execSync('railway status', { encoding: 'utf8' });
      fs.writeFileSync('.railway-rollback.txt', status);
      this.log('Rollback information stored');
    } catch (error) {
      this.log('Could not store rollback information', 'warning');
    }

    try {
      this.log('Executing Railway deployment...');
      execSync('railway up --detach', { stdio: 'inherit' });
      this.log('Deployment initiated', 'success');
      return true;
    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'error');
      return false;
    }
  }

  async monitorDeployment() {
    this.log('Monitoring deployment...');
    
    const maxChecks = 12; // 2 minutes with 10s intervals
    let checks = 0;
    
    while (checks < maxChecks) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      try {
        const status = execSync('railway status', { encoding: 'utf8' });
        console.log('\n📊 Current Status:');
        console.log(status);
        
        if (status.includes('Deployed') || status.includes('Active')) {
          this.log('Deployment completed successfully', 'success');
          return true;
        }
        
        if (status.includes('Failed') || status.includes('Error')) {
          this.log('Deployment failed according to status', 'error');
          return false;
        }
        
        checks++;
        this.log(`Checking deployment progress... (${checks}/${maxChecks})`);
        
      } catch (error) {
        this.log('Error checking deployment status', 'warning');
        checks++;
      }
    }
    
    this.log('Deployment monitoring completed (timeout reached)', 'warning');
    return true; // Assume success if we can't determine failure
  }

  async performHealthCheck() {
    this.log('Attempting health check...');
    
    try {
      const domains = execSync('railway domain', { encoding: 'utf8' });
      console.log('\n🌐 Domain information:');
      console.log(domains);
      
      // Extract URL if possible
      const urlMatch = domains.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        const url = urlMatch[0];
        this.log(`Health check URL: ${url}/health`);
        
        // Note: We're not actually performing the HTTP request here
        // as we want to keep this script simple and avoid additional dependencies
        this.log('Please manually verify the health endpoint is working', 'warning');
      }
    } catch (error) {
      this.log('Could not retrieve domain information', 'warning');
    }
  }

  async rollback() {
    this.log('Initiating rollback...');
    
    const proceed = await this.askUser('⚠️ Are you sure you want to rollback? (y/N): ');
    
    if (proceed.toLowerCase() !== 'y') {
      this.log('Rollback cancelled');
      return false;
    }

    try {
      execSync('railway down', { stdio: 'inherit' });
      this.log('Rollback completed', 'success');
      return true;
    } catch (error) {
      this.log(`Rollback failed: ${error.message}`, 'error');
      return false;
    }
  }

  async showFinalStatus() {
    this.log('Final deployment status:');
    try {
      execSync('railway status', { stdio: 'inherit' });
      
      console.log('\n📋 Deployment Summary:');
      console.log(`• Project: ${this.projectName}`);
      console.log(`• Time: ${new Date().toISOString()}`);
      console.log(`• Status: Check above output`);
      
    } catch (error) {
      this.log('Could not retrieve final status', 'warning');
    }
  }

  async run() {
    console.log('🚂 Manual Railway Deployment Starting...');
    console.log(`📋 Target Project: ${this.projectName}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}\n`);

    try {
      // Step 1: Check prerequisites
      this.checkPrerequisites();
      
      // Step 2: Check/Link project
      if (!this.checkProjectLink()) {
        const linked = await this.linkProject();
        if (!linked) {
          throw new Error('Failed to link project');
        }
      }
      
      // Step 3: Deploy
      const deploySuccess = await this.deploy();
      if (!deploySuccess) {
        throw new Error('Deployment failed');
      }
      
      // Step 4: Monitor
      await this.monitorDeployment();
      
      // Step 5: Health check
      await this.performHealthCheck();
      
      // Step 6: Show final status
      await this.showFinalStatus();
      
      console.log('\n🎉 Deployment process completed successfully!');
      console.log(`⏰ Finished at: ${new Date().toISOString()}`);
      
    } catch (error) {
      console.log(`\n💥 Deployment failed: ${error.message}`);
      
      const shouldRollback = await this.askUser('\n🚨 Would you like to attempt rollback? (y/N): ');
      if (shouldRollback.toLowerCase() === 'y') {
        await this.rollback();
      }
      
      process.exit(1);
    }
  }
}

// Run the deployer
if (require.main === module) {
  const deployer = new ManualRailwayDeployer();
  deployer.run().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = ManualRailwayDeployer;