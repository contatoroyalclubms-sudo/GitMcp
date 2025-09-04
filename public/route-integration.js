/**
 * SISTEMA DE INTEGRAÇÃO DE ROTAS MEEP
 * Integra todas as páginas SUPREMO ao painel lateral
 * Mantém compatibilidade total com sistema em produção
 */

class RouteIntegration {
    constructor() {
        // Mapeamento completo de todas as páginas disponíveis
        this.pageMapping = {
            // Dashboard Principal (Já funcionando)
            'dashboard': { type: 'spa', component: 'dashboard' },
            'favorites': { type: 'spa', component: 'favorites' },
            'cashflow': { type: 'spa', component: 'cashflow' },
            
            // Clientes (Já funcionando)
            'clients': { type: 'spa', component: 'clients' },
            'commands': { type: 'spa', component: 'commands' },
            'cashless': { type: 'spa', component: 'cashless' },
            'satisfaction': { type: 'spa', component: 'satisfaction' },
            
            // Vendas (Já funcionando)
            'menus': { type: 'spa', component: 'menus' },
            'sales': { type: 'spa', component: 'sales' },
            'online': { type: 'spa', component: 'online' },
            'tickets': { type: 'spa', component: 'tickets' },
            
            // Relatórios (Já funcionando)
            'reports-sales': { type: 'spa', component: 'reports-sales' },
            'reports-financial': { type: 'spa', component: 'reports-financial' },
            'reports-clients': { type: 'spa', component: 'reports-clients' },
            
            // Financeiro (Já funcionando)
            'digital-account': { type: 'spa', component: 'digital-account' },
            'payments': { type: 'spa', component: 'payments' },
            'invoices': { type: 'spa', component: 'invoices' },
            
            // BI (Já funcionando)
            'analytics': { type: 'spa', component: 'analytics' },
            'automation': { type: 'spa', component: 'automation' },
            'integrations': { type: 'spa', component: 'integrations' },
            
            // PÁGINAS SUPREMO - NOVA INTEGRAÇÃO
            'dashboard-supremo': { 
                type: 'iframe', 
                url: '/dashboard-supremo.html',
                title: 'Dashboard SUPREMO'
            },
            'supreme-dashboard': { 
                type: 'iframe', 
                url: '/supreme-dashboard.html',
                title: 'Supreme Dashboard'
            },
            'ai-dashboard': { 
                type: 'iframe', 
                url: '/ai-dashboard.html',
                title: 'AI Dashboard'
            },
            
            // BUSINESS INTELLIGENCE SUPREMO
            'bi-supremo': { 
                type: 'iframe', 
                url: '/business-intelligence-supremo.html',
                title: 'Business Intelligence SUPREMO'
            },
            'customer-intelligence': { 
                type: 'iframe', 
                url: '/customer-intelligence-supremo.html',
                title: 'Customer Intelligence'
            },
            'marketing-intelligence': { 
                type: 'iframe', 
                url: '/marketing-intelligence-supremo.html',
                title: 'Marketing Intelligence'
            },
            'operational-intelligence': { 
                type: 'iframe', 
                url: '/operational-intelligence-supremo.html',
                title: 'Operational Intelligence'
            },
            'inventory-intelligence': { 
                type: 'iframe', 
                url: '/inventory-intelligence-supremo.html',
                title: 'Inventory Intelligence'
            },
            'pdv-intelligence': { 
                type: 'iframe', 
                url: '/pdv-intelligence-supremo.html',
                title: 'PDV Intelligence'
            },
            'crm-intelligence': { 
                type: 'iframe', 
                url: '/crm-intelligence-supremo.html',
                title: 'CRM Intelligence'
            },
            
            // MÓDULOS FUNCIONAIS SUPREMO
            'pdv-supremo': { 
                type: 'iframe', 
                url: '/pdv.html',
                title: 'PDV Sistema'
            },
            'checkin-supremo': { 
                type: 'iframe', 
                url: '/checkin.html',
                title: 'Check-in QR'
            },
            'financeiro-supremo': { 
                type: 'iframe', 
                url: '/financeiro.html',
                title: 'Financeiro'
            },
            'caixa-supremo': { 
                type: 'iframe', 
                url: '/caixa-supremo.html',
                title: 'Caixa SUPREMO'
            },
            'cardapio-supremo': { 
                type: 'iframe', 
                url: '/cardapio-supremo.html',
                title: 'Cardápio Digital'
            },
            'eventos-supremo': { 
                type: 'iframe', 
                url: '/eventos-supremo.html',
                title: 'Eventos SUPREMO'
            },
            'pagamentos-supremo': { 
                type: 'iframe', 
                url: '/pagamentos-supremo.html',
                title: 'Pagamentos SUPREMO'
            },
            'relatorios-supremo': { 
                type: 'iframe', 
                url: '/relatorios-supremo.html',
                title: 'Relatórios SUPREMO'
            },
            
            // SISTEMA
            'menu-navigation': { 
                type: 'iframe', 
                url: '/menu-navigation.html',
                title: 'Menu Principal'
            },
            'admin-config': { 
                type: 'iframe', 
                url: '/admin-config.html',
                title: 'Configurações Admin'
            }
        };
        
        this.currentPage = null;
        this.contentContainer = null;
    }
    
    /**
     * Inicializa o sistema de roteamento integrado
     */
    init() {
        this.contentContainer = document.getElementById('content');
        
        if (!this.contentContainer) {
            console.error('Container de conteúdo não encontrado');
            return;
        }
        
        // Preserva manipuladores existentes
        this.preserveExistingHandlers();
        
        // Adiciona novos manipuladores para páginas SUPREMO
        this.attachSupremoHandlers();
        
        // Adiciona navegação por histórico
        this.setupHistoryNavigation();
        
        console.log('✅ Sistema de roteamento integrado inicializado');
    }
    
    /**
     * Preserva handlers existentes do sistema em produção
     */
    preserveExistingHandlers() {
        // Mantém os event listeners originais
        const originalLinks = document.querySelectorAll('[data-page]');
        originalLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (this.pageMapping[page] && this.pageMapping[page].type === 'spa') {
                // Mantém comportamento original para páginas SPA existentes
                link._originalHandler = true;
            }
        });
    }
    
    /**
     * Adiciona handlers para páginas SUPREMO
     */
    attachSupremoHandlers() {
        // Intercepta cliques em links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (!link || link._originalHandler) return;
            
            e.preventDefault();
            const page = link.getAttribute('data-page');
            this.navigateToPage(page);
        });
    }
    
    /**
     * Navega para uma página específica
     */
    navigateToPage(pageId) {
        const pageConfig = this.pageMapping[pageId];
        
        if (!pageConfig) {
            console.warn(`Página não encontrada: ${pageId}`);
            return;
        }
        
        // Remove classe ativa dos links
        document.querySelectorAll('[data-page]').forEach(link => {
            link.classList.remove('active');
        });
        
        // Adiciona classe ativa ao link atual
        const currentLink = document.querySelector(`[data-page="${pageId}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        }
        
        // Carrega o conteúdo baseado no tipo
        if (pageConfig.type === 'iframe') {
            this.loadIframePage(pageConfig);
        } else {
            // Mantém comportamento original para páginas SPA
            if (window.app && window.app.navigateTo) {
                window.app.navigateTo(pageId);
            }
        }
        
        this.currentPage = pageId;
        
        // Atualiza URL sem recarregar
        history.pushState({ page: pageId }, pageConfig.title || '', `#${pageId}`);
    }
    
    /**
     * Carrega página em iframe (para páginas SUPREMO)
     */
    loadIframePage(pageConfig) {
        // Limpa conteúdo existente
        this.contentContainer.innerHTML = '';
        
        // Cria container para o iframe
        const iframeContainer = document.createElement('div');
        iframeContainer.className = 'iframe-container';
        iframeContainer.style.cssText = `
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
        `;
        
        // Cria iframe
        const iframe = document.createElement('iframe');
        iframe.src = pageConfig.url;
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: white;
        `;
        iframe.setAttribute('title', pageConfig.title);
        
        // Loading indicator
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = '<span>Carregando...</span>';
        loading.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        `;
        
        iframeContainer.appendChild(loading);
        iframeContainer.appendChild(iframe);
        
        iframe.onload = () => {
            // Remove loading quando carregar
            setTimeout(() => {
                loading.style.display = 'none';
            }, 300);
            
            // Injeta token de autenticação no iframe se necessário
            try {
                const token = localStorage.getItem('token');
                if (token && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'auth_token',
                        token: token
                    }, '*');
                }
            } catch (e) {
                console.log('Não foi possível enviar token para iframe');
            }
        };
        
        iframe.onerror = () => {
            loading.innerHTML = '<span style="color: red">Erro ao carregar página</span>';
        };
        
        this.contentContainer.appendChild(iframeContainer);
    }
    
    /**
     * Configura navegação por histórico
     */
    setupHistoryNavigation() {
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.navigateToPage(event.state.page);
            }
        });
        
        // Carrega página inicial baseada no hash
        const hash = window.location.hash.replace('#', '');
        if (hash && this.pageMapping[hash]) {
            this.navigateToPage(hash);
        }
    }
    
    /**
     * Adiciona novo item ao menu dinamicamente
     */
    addMenuItem(sectionTitle, items) {
        const menu = document.querySelector('.menu');
        const section = Array.from(menu.querySelectorAll('.section-title'))
            .find(title => title.textContent === sectionTitle);
        
        if (section) {
            const ul = section.nextElementSibling;
            items.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#" data-page="${item.page}">${item.icon} ${item.label}</a>`;
                ul.appendChild(li);
                
                // Adiciona ao mapeamento
                if (item.config) {
                    this.pageMapping[item.page] = item.config;
                }
            });
        }
    }
}

// Inicializa quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    // Espera o app principal carregar
    setTimeout(() => {
        const routeIntegration = new RouteIntegration();
        routeIntegration.init();
        
        // Expõe globalmente para uso
        window.routeIntegration = routeIntegration;
        
        console.log('🚀 Sistema de roteamento integrado carregado');
    }, 1000);
});

// Expõe classe globalmente
window.RouteIntegration = RouteIntegration;