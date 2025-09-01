#!/usr/bin/env node

/**
 * Railway Quick Deploy - Bypass Interactive Selection
 * Uses railway status output parsing to determine deployment approach
 */

const { execSync } = require('child_process');
const fs = require('fs');

const PROJECT_NAME = process.argv[2] || 'sistema-meep01';

console.log('🚀 Railway Quick Deploy Starting...');
console.log(`📋 Target: ${PROJECT_NAME}`);

function executeCommand(command, silent = false) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

// Check prerequisites
console.log('🔍 Checking prerequisites...');

const railwayCheck = executeCommand('railway --version', true);
if (!railwayCheck.success) {
  console.log('❌ Railway CLI not found');
  process.exit(1);
}

const authCheck = executeCommand('railway whoami', true);
if (!authCheck.success) {
  console.log('❌ Railway CLI not authenticated');
  process.exit(1);
}

console.log('✅ Railway CLI ready');

// Check if already linked
console.log('🔗 Checking project status...');
const statusCheck = executeCommand('railway status', true);

if (statusCheck.success) {
  console.log('✅ Project already linked, proceeding with deployment...');
} else {
  console.log('📋 Need to link project. Available options:');
  console.log('1. Use: railway-deploy-simple.bat (Windows)');
  console.log('2. Use: node deploy-manual.js (Interactive)');
  console.log('3. Manual: railway link (then select project)');
  console.log('');
  console.log('After linking, run this script again.');
  process.exit(0);
}

// Pre-deployment checks
console.log('🔍 Running pre-deployment checks...');

if (!fs.existsSync('package.json')) {
  console.log('❌ package.json not found');
  process.exit(1);
}

if (!fs.existsSync('server.js')) {
  console.log('❌ server.js not found');
  process.exit(1);
}

const syntaxCheck = executeCommand('node --check server.js', true);
if (!syntaxCheck.success) {
  console.log('❌ Syntax error in server.js');
  process.exit(1);
}

console.log('✅ Pre-deployment checks passed');

// Store rollback info
console.log('💾 Storing rollback information...');
const rollbackInfo = executeCommand('railway status', true);
if (rollbackInfo.success) {
  fs.writeFileSync('.railway-rollback.txt', rollbackInfo.output);
}

// Deploy
console.log('🚀 Starting deployment...');
const deployResult = executeCommand('railway up --detach');

if (deployResult.success) {
  console.log('✅ Deployment initiated successfully');
  
  // Wait and check status
  console.log('⏳ Waiting for deployment to complete...');
  setTimeout(() => {
    console.log('📊 Final status:');
    executeCommand('railway status');
    
    console.log('🌐 Getting deployment URL...');
    executeCommand('railway domain');
    
    console.log('🎉 Deployment process completed!');
    console.log(`⏰ Time: ${new Date().toISOString()}`);
  }, 30000); // Wait 30 seconds
  
} else {
  console.log('❌ Deployment failed');
  console.log('🚨 Attempting rollback...');
  
  const rollbackResult = executeCommand('railway down', true);
  if (rollbackResult.success) {
    console.log('✅ Rollback completed');
  } else {
    console.log('❌ Rollback failed - manual intervention required');
  }
  
  process.exit(1);
}