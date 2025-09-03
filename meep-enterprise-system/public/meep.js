// MEEP SUPREME - JavaScript Functions

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('MEEP SUPREME Loaded!');
    
    // Check if we have token
    const token = localStorage.getItem('token');
    if (token) {
        console.log('User authenticated');
        loadDashboard();
    }
});

// Load Dashboard Data
async function loadDashboard() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/dashboard/metrics', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log('Dashboard data:', data);
        updateMetrics(data);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Update metrics on page
function updateMetrics(data) {
    // Update total revenue
    const revenueElement = document.querySelector('.metric-value.revenue');
    if (revenueElement && data.totalRevenue) {
        revenueElement.textContent = `R$ ${data.totalRevenue.toLocaleString('pt-BR')}`;
    }
    
    // Update active events
    const eventsElement = document.querySelector('.metric-value.events');
    if (eventsElement && data.activeEvents) {
        eventsElement.textContent = data.activeEvents;
    }
    
    // Update total customers
    const customersElement = document.querySelector('.metric-value.customers');
    if (customersElement && data.totalCustomers) {
        customersElement.textContent = data.totalCustomers.toLocaleString('pt-BR');
    }
}

// Login function
async function login(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log('Login successful!');
            window.location.reload();
            return true;
        } else {
            console.error('Login failed');
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Navigate to different pages
function navigateTo(page) {
    console.log('Navigating to:', page);
    
    const pages = {
        'dashboard': '/',
        'pdv': '/pdv.html',
        'checkin': '/checkin.html',
        'financeiro': '/financeiro.html',
        'ai': '/ai-dashboard.html',
        'supreme': '/supreme-dashboard.html'
    };
    
    if (pages[page]) {
        window.location.href = pages[page];
    }
}

// Real-time updates simulation
function startRealTimeUpdates() {
    setInterval(() => {
        // Update random metrics
        const metrics = document.querySelectorAll('.metric-value');
        metrics.forEach(metric => {
            if (metric.textContent.includes('R$')) {
                const value = parseFloat(metric.textContent.replace('R$ ', '').replace('.', '').replace(',', '.'));
                const newValue = value + (Math.random() - 0.5) * 100;
                metric.textContent = `R$ ${newValue.toFixed(2).replace('.', ',')}`;
            }
        });
    }, 5000);
}

// Chart initialization (if Chart.js is loaded)
function initCharts() {
    if (typeof Chart !== 'undefined') {
        const ctx = document.getElementById('salesChart');
        if (ctx) {
            new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [{
                        label: 'Vendas',
                        data: [65000, 72000, 68000, 89000, 95000, 112000],
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: { color: '#fff' }
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#fff' }
                        },
                        x: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#fff' }
                        }
                    }
                }
            });
        }
    }
}

// Export functions to global scope
window.meep = {
    login,
    logout,
    navigateTo,
    loadDashboard,
    startRealTimeUpdates,
    initCharts
};

// Auto-start features
if (document.querySelector('.metric-value')) {
    startRealTimeUpdates();
}

if (document.getElementById('salesChart')) {
    initCharts();
}

console.log('MEEP Functions loaded! Use window.meep to access functions.');