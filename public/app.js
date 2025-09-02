class MEEPApp {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        this.currentPage = 'dashboard';
        this.ws = null;
        this.charts = {};
        this.init();
    }

    init() {
        if (!this.token) {
            this.showLoginModal();
        } else {
            this.initializeApp();
        }
        this.attachEventListeners();
    }

    showLoginModal() {
        document.getElementById('login-modal').style.display = 'flex';
    }

    hideLoginModal() {
        document.getElementById('login-modal').style.display = 'none';
    }

    attachEventListeners() {
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.navigateTo(page);
            });
        });
    }

    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await axios.post('/api/auth/login', { email, password });
            this.token = response.data.token;
            this.user = response.data.user;
            localStorage.setItem('token', this.token);
            this.hideLoginModal();
            this.initializeApp();
        } catch (error) {
            alert('Login failed: ' + (error.response?.data?.error || 'Unknown error'));
        }
    }

    initializeApp() {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        this.connectWebSocket();
        this.loadDashboard();
        this.startRealtimeUpdates();
    }

    connectWebSocket() {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.ws = new WebSocket(`${wsProtocol}//${window.location.host}`);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.ws.send(JSON.stringify({ 
                type: 'subscribe_dashboard',
                token: this.token 
            }));
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }

    handleWebSocketMessage(data) {
        switch(data.type) {
            case 'dashboard_update':
                this.updateDashboardMetrics(data.data);
                break;
            case 'sales_update':
                this.updateSalesChart(data.data);
                break;
            case 'notification':
                this.showNotification(data.data);
                break;
        }
    }

    async loadDashboard() {
        try {
            const response = await axios.get('/api/dashboard/metrics');
            this.updateDashboardMetrics(response.data);
            this.initCharts();
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    }

    updateDashboardMetrics(data) {
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards[0]) {
            statCards[0].querySelector('.stat-value').textContent = `R$ ${(data.totalRevenue || 0).toLocaleString('pt-BR')}`;
            statCards[1].querySelector('.stat-value').textContent = data.activeEvents || 0;
            statCards[2].querySelector('.stat-value').textContent = data.totalClients || 0;
            statCards[3].querySelector('.stat-value').textContent = `${data.satisfaction || 0}/5`;
        }
    }

    initCharts() {
        const salesCtx = document.getElementById('salesChart');
        if (salesCtx) {
            this.charts.sales = new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: this.getLast7Days(),
                    datasets: [{
                        label: 'Vendas',
                        data: this.generateRandomData(7, 5000, 15000),
                        borderColor: '#e94560',
                        backgroundColor: 'rgba(233, 69, 96, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#8f9397'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#8f9397'
                            }
                        }
                    }
                }
            });
        }

        const productsCtx = document.getElementById('productsChart');
        if (productsCtx) {
            this.charts.products = new Chart(productsCtx, {
                type: 'bar',
                data: {
                    labels: ['Bebidas', 'Comidas', 'Ingressos', 'Merchandise', 'Combos'],
                    datasets: [{
                        label: 'Vendas',
                        data: this.generateRandomData(5, 100, 500),
                        backgroundColor: [
                            '#e94560',
                            '#0f3460',
                            '#00d25b',
                            '#ffab00',
                            '#8f9397'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#8f9397'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#8f9397'
                            }
                        }
                    }
                }
            });
        }
    }

    updateSalesChart(data) {
        if (this.charts.sales) {
            this.charts.sales.data.datasets[0].data.shift();
            this.charts.sales.data.datasets[0].data.push(data.currentSales);
            this.charts.sales.update();
        }
    }

    navigateTo(page) {
        this.currentPage = page;
        document.querySelectorAll('[data-page]').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
        this.loadPage(page);
    }

    async loadPage(page) {
        const content = document.getElementById('content');
        
        switch(page) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'clients':
                content.innerHTML = await this.loadClientsPage();
                break;
            case 'sales':
                content.innerHTML = await this.loadSalesPage();
                break;
            case 'inventory':
                content.innerHTML = await this.loadInventoryPage();
                break;
            case 'reports-sales':
                content.innerHTML = await this.loadReportsPage();
                break;
            case 'analytics':
                content.innerHTML = await this.loadAnalyticsPage();
                break;
            default:
                content.innerHTML = '<h2>Page under construction</h2>';
        }
    }

    async loadClientsPage() {
        try {
            const response = await axios.get('/api/clients');
            const clients = response.data.clients;
            
            return `
                <h2>Gestão de Clientes</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Categoria</th>
                                <th>Saldo Cashless</th>
                                <th>Pontos</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clients.map(client => `
                                <tr>
                                    <td>${client.name}</td>
                                    <td>${client.email || '-'}</td>
                                    <td>${client.category}</td>
                                    <td>R$ ${client.cashlessBalance}</td>
                                    <td>${client.loyaltyPoints}</td>
                                    <td>
                                        <button class="btn btn-primary">Editar</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            return '<p>Failed to load clients</p>';
        }
    }

    async loadSalesPage() {
        try {
            const response = await axios.get('/api/sales/list');
            const sales = response.data.sales;
            
            return `
                <h2>Gestão de Vendas</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Pagamento</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sales.map(sale => `
                                <tr>
                                    <td>${new Date(sale.createdAt).toLocaleString('pt-BR')}</td>
                                    <td>${sale.Client?.name || 'Guest'}</td>
                                    <td>R$ ${sale.total}</td>
                                    <td>${sale.paymentMethod}</td>
                                    <td>${sale.status}</td>
                                    <td>
                                        <button class="btn btn-primary">Detalhes</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            return '<p>Failed to load sales</p>';
        }
    }

    async loadInventoryPage() {
        try {
            const response = await axios.get('/api/inventory/products');
            const products = response.data.products;
            
            return `
                <h2>Gestão de Estoque</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Categoria</th>
                                <th>Estoque</th>
                                <th>Mínimo</th>
                                <th>Preço</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(product => `
                                <tr>
                                    <td>${product.name}</td>
                                    <td>${product.category || '-'}</td>
                                    <td>${product.stock}</td>
                                    <td>${product.minStock}</td>
                                    <td>R$ ${product.price}</td>
                                    <td>${product.stock < product.minStock ? '<span style="color: #fc424a">Baixo</span>' : '<span style="color: #00d25b">OK</span>'}</td>
                                    <td>
                                        <button class="btn btn-primary">Editar</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            return '<p>Failed to load inventory</p>';
        }
    }

    async loadReportsPage() {
        return `
            <h2>Relatórios de Vendas</h2>
            <div class="dashboard-grid">
                <div class="stat-card">
                    <h3>Vendas Hoje</h3>
                    <p class="stat-value">R$ ${Math.floor(Math.random() * 10000).toLocaleString('pt-BR')}</p>
                    <span class="stat-change positive">+12%</span>
                </div>
                <div class="stat-card">
                    <h3>Vendas Semana</h3>
                    <p class="stat-value">R$ ${Math.floor(Math.random() * 50000).toLocaleString('pt-BR')}</p>
                    <span class="stat-change positive">+8%</span>
                </div>
                <div class="stat-card">
                    <h3>Vendas Mês</h3>
                    <p class="stat-value">R$ ${Math.floor(Math.random() * 200000).toLocaleString('pt-BR')}</p>
                    <span class="stat-change positive">+15%</span>
                </div>
                <div class="stat-card">
                    <h3>Ticket Médio</h3>
                    <p class="stat-value">R$ ${Math.floor(Math.random() * 200 + 50)}</p>
                    <span class="stat-change positive">+5%</span>
                </div>
            </div>
        `;
    }

    async loadAnalyticsPage() {
        return `
            <h2>Business Intelligence</h2>
            <div class="dashboard-grid">
                <div class="stat-card">
                    <h3>Previsão Receita</h3>
                    <p class="stat-value">R$ ${Math.floor(Math.random() * 300000).toLocaleString('pt-BR')}</p>
                    <span class="stat-change">Próximo mês</span>
                </div>
                <div class="stat-card">
                    <h3>Taxa Conversão</h3>
                    <p class="stat-value">${(Math.random() * 30 + 50).toFixed(1)}%</p>
                    <span class="stat-change positive">+3%</span>
                </div>
                <div class="stat-card">
                    <h3>Clientes em Risco</h3>
                    <p class="stat-value">${Math.floor(Math.random() * 100)}</p>
                    <span class="stat-change negative">Atenção</span>
                </div>
                <div class="stat-card">
                    <h3>ROI Marketing</h3>
                    <p class="stat-value">${(Math.random() * 5 + 2).toFixed(1)}x</p>
                    <span class="stat-change positive">Excelente</span>
                </div>
            </div>
        `;
    }

    startRealtimeUpdates() {
        setInterval(() => {
            this.addActivity(`Venda realizada: R$ ${Math.floor(Math.random() * 500 + 50)}`);
        }, 10000);
    }

    addActivity(message) {
        const list = document.getElementById('activities-list');
        if (list) {
            const li = document.createElement('li');
            li.textContent = `${new Date().toLocaleTimeString('pt-BR')} - ${message}`;
            list.insertBefore(li, list.firstChild);
            if (list.children.length > 10) {
                list.removeChild(list.lastChild);
            }
        }
    }

    showNotification(data) {
        console.log('Notification:', data);
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('pt-BR', { weekday: 'short' }));
        }
        return days;
    }

    generateRandomData(count, min, max) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.floor(Math.random() * (max - min) + min));
        }
        return data;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new MEEPApp();
});