/**
 * Complete route testing script
 * Tests all MEEP system endpoints
 */

const request = require('supertest');
const app = require('./server');

async function testAllRoutes() {
    console.log('🧪 TESTING ALL MEEP ROUTES\n');
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const results = [];
    
    // Test function
    async function testRoute(method, path, expectedStatus, description, authToken = null, body = null) {
        totalTests++;
        try {
            let req = request(app)[method.toLowerCase()](path);
            
            if (authToken) {
                req = req.set('Authorization', `Bearer ${authToken}`);
            }
            
            if (body) {
                req = req.send(body);
            }
            
            const response = await req;
            
            if (response.status === expectedStatus) {
                passedTests++;
                console.log(`✅ ${method} ${path} - ${description} (${response.status})`);
                results.push({ path, method, status: 'PASS', responseStatus: response.status });
            } else {
                failedTests++;
                console.log(`❌ ${method} ${path} - Expected ${expectedStatus}, got ${response.status}`);
                results.push({ path, method, status: 'FAIL', expected: expectedStatus, got: response.status });
            }
            
            return response;
        } catch (error) {
            failedTests++;
            console.log(`❌ ${method} ${path} - Error: ${error.message}`);
            results.push({ path, method, status: 'ERROR', error: error.message });
            return null;
        }
    }
    
    // 1. Test health check
    console.log('\n📋 HEALTH CHECK');
    await testRoute('GET', '/health', 200, 'Health check');
    await testRoute('GET', '/api/health', 200, 'API Health check');
    
    // 2. Test authentication
    console.log('\n🔐 AUTHENTICATION');
    const registerResponse = await testRoute('POST', '/api/auth/register', 201, 'User registration', null, {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'Test@123'
    });
    
    const loginResponse = await testRoute('POST', '/api/auth/login', 200, 'User login', null, {
        email: 'admin@meep.com',
        password: 'Admin@123'
    });
    
    const authToken = loginResponse?.body?.token;
    
    // 3. Test public routes (no auth required)
    console.log('\n🌐 PUBLIC ROUTES');
    await testRoute('GET', '/api/events', 200, 'List events');
    await testRoute('GET', '/api/menu', 200, 'Get menu');
    
    // 4. Test protected routes
    console.log('\n🔒 PROTECTED ROUTES');
    
    // Dashboard
    await testRoute('GET', '/api/dashboard/stats', authToken ? 200 : 401, 'Dashboard stats', authToken);
    await testRoute('GET', '/api/dashboard/charts', authToken ? 200 : 401, 'Dashboard charts', authToken);
    
    // Clients
    await testRoute('GET', '/api/clients', authToken ? 200 : 401, 'List clients', authToken);
    await testRoute('POST', '/api/clients', authToken ? 201 : 401, 'Create client', authToken, {
        name: 'New Client',
        email: 'newclient@example.com',
        phone: '1234567890'
    });
    
    // PDV
    await testRoute('GET', '/api/pdv/products', authToken ? 200 : 401, 'PDV products', authToken);
    await testRoute('GET', '/api/pdv/sales', authToken ? 200 : 401, 'PDV sales', authToken);
    
    // Inventory
    await testRoute('GET', '/api/inventory', authToken ? 200 : 401, 'Inventory list', authToken);
    
    // Sales
    await testRoute('GET', '/api/sales', authToken ? 200 : 401, 'Sales list', authToken);
    
    // Finance
    await testRoute('GET', '/api/finance/summary', authToken ? 200 : 401, 'Finance summary', authToken);
    await testRoute('GET', '/api/finance/transactions', authToken ? 200 : 401, 'Finance transactions', authToken);
    
    // Team
    await testRoute('GET', '/api/team', authToken ? 200 : 401, 'Team members', authToken);
    
    // Marketing
    await testRoute('GET', '/api/marketing/campaigns', authToken ? 200 : 401, 'Marketing campaigns', authToken);
    await testRoute('GET', '/api/marketing/analytics', authToken ? 200 : 401, 'Marketing analytics', authToken);
    
    // Reports
    await testRoute('GET', '/api/reports/summary', authToken ? 200 : 401, 'Reports summary', authToken);
    await testRoute('GET', '/api/reports/sales', authToken ? 200 : 401, 'Sales reports', authToken);
    
    // Cashless
    await testRoute('GET', '/api/cashless/cards', authToken ? 200 : 401, 'Cashless cards', authToken);
    
    // Configuration
    await testRoute('GET', '/api/config', authToken ? 200 : 401, 'System config', authToken);
    
    // Business Intelligence
    await testRoute('GET', '/api/bi/overview', authToken ? 200 : 401, 'BI overview', authToken);
    await testRoute('GET', '/api/bi/predictions', authToken ? 200 : 401, 'BI predictions', authToken);
    
    // AI
    await testRoute('POST', '/api/ai/predict', authToken ? 200 : 401, 'AI predictions', authToken, {
        data: { test: 'data' }
    });
    
    // 5. Test 404 handling
    console.log('\n🚫 ERROR HANDLING');
    await testRoute('GET', '/api/nonexistent', 404, '404 handling');
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests/totalTests)*100).toFixed(1)}%`);
    
    // List failed tests
    if (failedTests > 0) {
        console.log('\n❌ FAILED TESTS:');
        results.filter(r => r.status !== 'PASS').forEach(r => {
            console.log(`  - ${r.method} ${r.path}: ${r.error || `Expected ${r.expected}, got ${r.got}`}`);
        });
    }
    
    process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
testAllRoutes().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});