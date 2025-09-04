/**
 * PM2 CONFIGURATION FOR PRODUCTION
 * Process manager configuration for GitMcp Enterprise
 */

module.exports = {
    apps: [{
        name: 'gitmecp',
        script: './server.js',
        
        // Cluster mode
        instances: process.env.PM2_INSTANCES || 'max',
        exec_mode: 'cluster',
        
        // Environment variables
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        
        // Logging
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        merge_logs: true,
        
        // Restart policies
        max_restarts: 10,
        min_uptime: '10s',
        max_memory_restart: '1G',
        
        // Monitoring
        instance_var: 'INSTANCE_ID',
        
        // Graceful shutdown
        kill_timeout: 5000,
        wait_ready: true,
        listen_timeout: 10000,
        
        // Auto restart
        autorestart: true,
        watch: false,
        
        // Node.js arguments
        node_args: '--max-old-space-size=2048',
        
        // Advanced features
        source_map_support: true,
        
        // Environment specific configurations
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        
        env_staging: {
            NODE_ENV: 'staging',
            PORT: 3001
        }
    }],
    
    // Deploy configuration
    deploy: {
        production: {
            user: 'deploy',
            host: 'production.gitmecp.com',
            ref: 'origin/main',
            repo: 'git@github.com:gitmecp/enterprise.git',
            path: '/var/www/gitmecp',
            'pre-deploy-local': 'npm test',
            'post-deploy': 'npm install && npm run migrate && pm2 reload ecosystem.config.js --env production',
            'pre-setup': 'npm install pm2 -g'
        },
        
        staging: {
            user: 'deploy',
            host: 'staging.gitmecp.com',
            ref: 'origin/develop',
            repo: 'git@github.com:gitmecp/enterprise.git',
            path: '/var/www/gitmecp-staging',
            'post-deploy': 'npm install && npm run migrate && pm2 reload ecosystem.config.js --env staging'
        }
    }
};