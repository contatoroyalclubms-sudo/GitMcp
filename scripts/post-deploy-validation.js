#!/usr/bin/env node

/**
 * POST-DEPLOY VALIDATION SCRIPT
 * Validação completa após deploy em produção
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Configuração
const config = {
    baseUrl: process.env.APP_URL || 'http://localhost:3000',
    timeout: 30000,
    testsToRun: {
        health: true,
        authentication: true,
        database: true,
        api: true,
        performance: true,
        security: true
    }
};

// Cores para output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Logger
const log = {
    info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    section: (msg) => console.log(`\n${colors.blue}▶ ${msg}${colors.reset}`)
};

class PostDeployValidator {
    constructor() {
        this.results = {
            passed: [],
            failed: [],
            warnings: [],
            metrics: {}
        };
        this.startTime = Date.now();
    }

    async run() {
        log.info('═'.repeat(60));
        log.info('POST-DEPLOY VALIDATION');
        log.info(`URL: ${config.baseUrl}`);
        log.info(`Time: ${new Date().toISOString()}`);
        log.info('═'.repeat(60));

        try {
            // Run all validation tests
            if (config.testsToRun.health) await this.validateHealth();
            if (config.testsToRun.authentication) await this.validateAuthentication();
            if (config.testsToRun.database) await this.validateDatabase();
            if (config.testsToRun.api) await this.validateAPI();
            if (config.testsToRun.performance) await this.validatePerformance();
            if (config.testsToRun.security) await this.validateSecurity();

            // Generate report
            this.generateReport();

            // Determine exit code
            const exitCode = this.results.failed.length > 0 ? 1 : 0;
            process.exit(exitCode);

        } catch (error) {
            log.error(`Validation failed: ${error.message}`);
            process.exit(1);
        }
    }

    async validateHealth() {
        log.section('Health Check Validation');

        // Check main health endpoint
        const health = await this.makeRequest('/health');
        
        if (health.status === 200) {
            log.success('Main health check passed');
            this.results.passed.push('Health check');
            
            // Check detailed health
            const data = JSON.parse(health.body);
            
            if (data.checks) {
                // Database health
                if (data.checks.database?.status === 'healthy') {
                    log.success('Database is healthy');
                    this.results.passed.push('Database health');
                } else {
                    log.error('Database is not healthy');
                    this.results.failed.push('Database health');
                }

                // Cache health
                if (data.checks.cache?.status === 'healthy') {
                    log.success('Cache is healthy');
                    this.results.passed.push('Cache health');
                } else {
                    log.warning('Cache is not healthy');
                    this.results.warnings.push('Cache health');
                }

                // Memory usage
                if (data.checks.memory?.status === 'healthy') {
                    log.success(`Memory usage is healthy: ${data.checks.memory.heapUsed}`);
                    this.results.passed.push('Memory health');
                } else {
                    log.warning('Memory usage is high');
                    this.results.warnings.push('Memory health');
                }
            }
        } else {
            log.error('Main health check failed');
            this.results.failed.push('Health check');
        }

        // Check readiness
        const ready = await this.makeRequest('/health/ready');
        if (ready.status === 200) {
            log.success('Application is ready');
            this.results.passed.push('Readiness check');
        } else {
            log.error('Application is not ready');
            this.results.failed.push('Readiness check');
        }

        // Check version
        const version = await this.makeRequest('/health/version');
        if (version.status === 200) {
            const data = JSON.parse(version.body);
            log.info(`Version: ${data.version}`);
            log.info(`Environment: ${data.environment}`);
            this.results.metrics.version = data.version;
            this.results.metrics.environment = data.environment;
        }
    }

    async validateAuthentication() {
        log.section('Authentication Validation');

        // Test registration
        const testEmail = `test${Date.now()}@validation.com`;
        const register = await this.makeRequest('/api/auth/register', 'POST', {
            name: 'Validation Test',
            email: testEmail,
            password: 'Test@123'
        });

        if (register.status === 201) {
            log.success('Registration endpoint working');
            this.results.passed.push('Registration');

            const data = JSON.parse(register.body);
            const token = data.token;

            // Test login
            const login = await this.makeRequest('/api/auth/login', 'POST', {
                email: testEmail,
                password: 'Test@123'
            });

            if (login.status === 200) {
                log.success('Login endpoint working');
                this.results.passed.push('Login');
            } else {
                log.error('Login endpoint failed');
                this.results.failed.push('Login');
            }

            // Test protected route
            const me = await this.makeRequest('/api/auth/me', 'GET', null, {
                'Authorization': `Bearer ${token}`
            });

            if (me.status === 200) {
                log.success('JWT authentication working');
                this.results.passed.push('JWT authentication');
            } else {
                log.error('JWT authentication failed');
                this.results.failed.push('JWT authentication');
            }
        } else {
            log.error('Registration endpoint failed');
            this.results.failed.push('Registration');
        }
    }

    async validateDatabase() {
        log.section('Database Validation');

        // This is covered by health check
        // Additional database-specific tests can be added here
        
        log.info('Database validation completed via health check');
    }

    async validateAPI() {
        log.section('API Endpoints Validation');

        const endpoints = [
            { path: '/api/events', method: 'GET', name: 'Events' },
            { path: '/api/clients', method: 'GET', name: 'Clients' },
            { path: '/api/products', method: 'GET', name: 'Products' },
            { path: '/api/dashboard/stats', method: 'GET', name: 'Dashboard', protected: true }
        ];

        // Get auth token for protected routes
        let token = null;
        const loginResult = await this.makeRequest('/api/auth/login', 'POST', {
            email: 'admin@meep.com',
            password: 'admin123'
        });

        if (loginResult.status === 200) {
            const data = JSON.parse(loginResult.body);
            token = data.token;
        }

        for (const endpoint of endpoints) {
            const headers = {};
            if (endpoint.protected && token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const result = await this.makeRequest(
                endpoint.path,
                endpoint.method,
                null,
                headers
            );

            if (result.status < 500) {
                log.success(`${endpoint.name} endpoint responding`);
                this.results.passed.push(`API: ${endpoint.name}`);
            } else {
                log.error(`${endpoint.name} endpoint failed`);
                this.results.failed.push(`API: ${endpoint.name}`);
            }
        }
    }

    async validatePerformance() {
        log.section('Performance Validation');

        const requests = [];
        const startTime = performance.now();

        // Send 20 concurrent requests
        for (let i = 0; i < 20; i++) {
            requests.push(this.makeRequest('/health/live'));
        }

        const results = await Promise.all(requests);
        const totalTime = performance.now() - startTime;
        const avgTime = totalTime / 20;

        log.info(`20 concurrent requests completed in ${totalTime.toFixed(2)}ms`);
        log.info(`Average response time: ${avgTime.toFixed(2)}ms`);

        if (avgTime < 100) {
            log.success('Performance is excellent');
            this.results.passed.push('Performance');
        } else if (avgTime < 500) {
            log.success('Performance is acceptable');
            this.results.passed.push('Performance');
        } else {
            log.warning('Performance needs optimization');
            this.results.warnings.push('Performance');
        }

        this.results.metrics.avgResponseTime = avgTime;
    }

    async validateSecurity() {
        log.section('Security Validation');

        // Check security headers
        const response = await this.makeRequest('/');
        const headers = response.headers;

        // Check for security headers
        const securityHeaders = [
            { name: 'x-content-type-options', expected: 'nosniff' },
            { name: 'x-frame-options', expected: 'DENY' },
            { name: 'x-xss-protection', expected: '1; mode=block' }
        ];

        for (const header of securityHeaders) {
            if (headers[header.name]) {
                log.success(`Security header ${header.name} is set`);
                this.results.passed.push(`Security: ${header.name}`);
            } else {
                log.warning(`Security header ${header.name} is missing`);
                this.results.warnings.push(`Security: ${header.name}`);
            }
        }

        // Test SQL injection protection
        const sqlTest = await this.makeRequest('/api/auth/login', 'POST', {
            email: "admin' OR '1'='1",
            password: "password"
        });

        if (sqlTest.status === 400 || sqlTest.status === 401) {
            log.success('SQL injection protection working');
            this.results.passed.push('SQL injection protection');
        } else {
            log.error('SQL injection protection may be inadequate');
            this.results.failed.push('SQL injection protection');
        }
    }

    async makeRequest(path, method = 'GET', body = null, headers = {}) {
        return new Promise((resolve) => {
            const url = new URL(config.baseUrl + path);
            const protocol = url.protocol === 'https:' ? https : http;

            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname + url.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                timeout: config.timeout
            };

            const req = protocol.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                });
            });

            req.on('error', (error) => {
                resolve({
                    status: 0,
                    headers: {},
                    body: error.message
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    status: 0,
                    headers: {},
                    body: 'Request timeout'
                });
            });

            if (body) {
                req.write(JSON.stringify(body));
            }

            req.end();
        });
    }

    generateReport() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

        log.info('\n' + '═'.repeat(60));
        log.info('VALIDATION REPORT');
        log.info('═'.repeat(60));

        log.info(`\nDuration: ${duration}s`);
        log.info(`Environment: ${this.results.metrics.environment || 'Unknown'}`);
        log.info(`Version: ${this.results.metrics.version || 'Unknown'}`);

        log.info('\n📊 RESULTS SUMMARY:');
        log.success(`Passed: ${this.results.passed.length}`);
        if (this.results.warnings.length > 0) {
            log.warning(`Warnings: ${this.results.warnings.length}`);
        }
        if (this.results.failed.length > 0) {
            log.error(`Failed: ${this.results.failed.length}`);
        }

        if (this.results.failed.length > 0) {
            log.info('\n❌ FAILED TESTS:');
            this.results.failed.forEach(test => log.error(`  - ${test}`));
        }

        if (this.results.warnings.length > 0) {
            log.info('\n⚠️  WARNINGS:');
            this.results.warnings.forEach(test => log.warning(`  - ${test}`));
        }

        // Save report to file
        const reportData = {
            timestamp: new Date().toISOString(),
            duration: duration,
            environment: config.baseUrl,
            results: this.results,
            success: this.results.failed.length === 0
        };

        const reportPath = path.join(
            process.cwd(),
            `validation-report-${Date.now()}.json`
        );

        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        log.info(`\n📄 Report saved to: ${reportPath}`);

        // Final status
        if (this.results.failed.length === 0) {
            log.info('\n' + '='.repeat(60));
            log.success('✅ POST-DEPLOY VALIDATION PASSED!');
            log.info('='.repeat(60));
        } else {
            log.info('\n' + '='.repeat(60));
            log.error('❌ POST-DEPLOY VALIDATION FAILED!');
            log.info('='.repeat(60));
        }
    }
}

// Run validation
if (require.main === module) {
    const validator = new PostDeployValidator();
    validator.run();
}

module.exports = PostDeployValidator;