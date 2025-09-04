/**
 * CONFIGURAÇÃO EXPANDIDA DO MENU MEEP
 * Adiciona todas as páginas SUPREMO ao menu lateral
 * Mantém compatibilidade com sistema existente
 */

class MenuConfigSupremo {
    constructor() {
        this.menuStructure = {
            // Seção DASHBOARD expandida
            'DASHBOARD': [
                { page: 'dashboard', icon: '📊', label: 'Dashboard Principal', original: true },
                { page: 'ai-dashboard', icon: '🤖', label: 'AI Dashboard' },
                { page: 'favorites', icon: '⭐', label: 'Favoritos', original: true },
                { page: 'cashflow', icon: '💰', label: 'Evento/Caixa', original: true }
            ],
            
            // Nova seção INTELLIGENCE
            'INTELLIGENCE': [
                { page: 'pdv-intelligence', icon: '🛒', label: 'PDV Intelligence' },
                { page: 'crm-intelligence', icon: '🤝', label: 'CRM Intelligence' }
            ],
            
            // CLIENTES expandido
            'CLIENTES': [
                { page: 'commands', icon: '🎫', label: 'Comandas', original: true },
                { page: 'cashless', icon: '💳', label: 'Cashless', original: true },
                { page: 'checkin-supremo', icon: '✅', label: 'Check-in QR' }
            ],
            
            // VENDAS expandido
            'VENDAS': [
                { page: 'cardapio-supremo', icon: '🍽️', label: 'Cardápio Digital' },
                { page: 'sales', icon: '💼', label: 'Gestão de Venda', original: true },
                { page: 'pdv-supremo', icon: '🏪', label: 'PDV Sistema' },
                { page: 'tickets', icon: '🎟️', label: 'Ingressos', original: true }
            ],
            
            // Nova seção EVENTOS
            'EVENTOS': [
                { page: 'eventos-supremo', icon: '🎉', label: 'Gestão de Eventos' },
                { page: 'checkin-supremo', icon: '📱', label: 'Check-in Digital' },
                { page: 'caixa-supremo', icon: '💵', label: 'Caixa de Evento' }
            ],
            
            // RELATÓRIOS expandido
            'RELATÓRIOS': [
                { page: 'reports-sales', icon: '💰', label: 'Vendas', original: true },
                { page: 'reports-financial', icon: '💼', label: 'Financeiro', original: true },
                { page: 'reports-clients', icon: '👥', label: 'Clientes', original: true },
                { page: 'relatorios-supremo', icon: '📈', label: 'Relatórios SUPREMO' }
            ],
            
            // FINANCEIRO expandido
            'FINANCEIRO': [
                { page: 'digital-account', icon: '🏦', label: 'Conta Digital', original: true },
                { page: 'pagamentos-supremo', icon: '💎', label: 'Pagamentos SUPREMO' },
                { page: 'financeiro-supremo', icon: '💹', label: 'Financeiro Completo' }
            ],
            
            // BI expandido
            'BI': [
                { page: 'automation', icon: '🤖', label: 'Automação', original: true },
                { page: 'integrations', icon: '🔌', label: 'Integrações', original: true },
                { page: 'bi-supremo', icon: '🚀', label: 'BI SUPREMO' }
            ],
            
            // Nova seção CONFIGURAÇÕES
            'CONFIGURAÇÕES': [
                { page: 'admin-config', icon: '⚙️', label: 'Administração' },
                { page: 'menu-navigation', icon: '📱', label: 'Menu Principal' }
            ]
        };
    }
    
    /**
     * Injeta o menu expandido no sidebar existente
     */
    injectMenu() {
        const sidebar = document.querySelector('.sidebar .menu');
        if (!sidebar) {
            console.error('Sidebar não encontrada');
            return;
        }
        
        // Backup do menu original
        this.backupOriginalMenu(sidebar);
        
        // Limpa menu atual
        sidebar.innerHTML = '';
        
        // Cria novo menu com todas as seções
        Object.entries(this.menuStructure).forEach(([sectionName, items]) => {
            const section = this.createMenuSection(sectionName, items);
            sidebar.appendChild(section);
        });
        
        console.log('✅ Menu SUPREMO injetado com sucesso');
    }
    
    /**
     * Faz backup do menu original
     */
    backupOriginalMenu(sidebar) {
        this.originalMenuHTML = sidebar.innerHTML;
        window._originalMenu = this.originalMenuHTML;
    }
    
    /**
     * Restaura menu original se necessário
     */
    restoreOriginalMenu() {
        const sidebar = document.querySelector('.sidebar .menu');
        if (sidebar && this.originalMenuHTML) {
            sidebar.innerHTML = this.originalMenuHTML;
            console.log('✅ Menu original restaurado');
        }
    }
    
    /**
     * Cria uma seção do menu
     */
    createMenuSection(title, items) {
        const section = document.createElement('li');
        section.className = 'menu-section';
        
        const sectionTitle = document.createElement('span');
        sectionTitle.className = 'section-title';
        sectionTitle.textContent = title;
        section.appendChild(sectionTitle);
        
        const ul = document.createElement('ul');
        
        items.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.setAttribute('data-page', item.page);
            a.innerHTML = `${item.icon} ${item.label}`;
            
            // Marca itens novos
            if (!item.original) {
                a.classList.add('new-item');
                a.style.position = 'relative';
                
                // Badge "NOVO" opcional
                if (this.shouldShowNewBadge(item.page)) {
                    const badge = document.createElement('span');
                    badge.className = 'new-badge';
                    badge.textContent = 'NOVO';
                    badge.style.cssText = `
                        position: absolute;
                        right: 10px;
                        background: #e94560;
                        color: white;
                        font-size: 9px;
                        padding: 2px 5px;
                        border-radius: 3px;
                    `;
                    a.appendChild(badge);
                }
            }
            
            li.appendChild(a);
            ul.appendChild(li);
        });
        
        section.appendChild(ul);
        return section;
    }
    
    /**
     * Determina se deve mostrar badge "NOVO"
     */
    shouldShowNewBadge(page) {
        const newPages = [
            'dashboard-supremo',
            'bi-supremo',
            'customer-intelligence',
            'marketing-intelligence',
            'pdv-intelligence'
        ];
        return newPages.includes(page);
    }
    
    /**
     * Adiciona estilos CSS necessários
     */
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Estilos para itens novos do menu */
            .sidebar .menu .new-item {
                background: linear-gradient(90deg, transparent, rgba(233, 69, 96, 0.05));
                transition: all 0.3s ease;
            }
            
            .sidebar .menu .new-item:hover {
                background: linear-gradient(90deg, transparent, rgba(233, 69, 96, 0.1));
                transform: translateX(3px);
            }
            
            .sidebar .menu .new-badge {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            /* Seção INTELLIGENCE com destaque */
            .menu-section:has(.section-title:contains("INTELLIGENCE")) {
                border-top: 2px solid #e94560;
                margin-top: 10px;
                padding-top: 10px;
            }
            
            /* Scroll suave no sidebar para muitos itens */
            .sidebar .menu {
                max-height: calc(100vh - 150px);
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: #e94560 #1a1a2e;
            }
            
            .sidebar .menu::-webkit-scrollbar {
                width: 6px;
            }
            
            .sidebar .menu::-webkit-scrollbar-track {
                background: #1a1a2e;
            }
            
            .sidebar .menu::-webkit-scrollbar-thumb {
                background: #e94560;
                border-radius: 3px;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Inicializa o menu expandido
     */
    init() {
        // Injeta estilos
        this.injectStyles();
        
        // Injeta menu
        this.injectMenu();
        
        // Garante que o sistema de roteamento está ativo
        if (!window.routeIntegration) {
            const script = document.createElement('script');
            script.src = '/route-integration.js';
            document.head.appendChild(script);
        }
        
        console.log('🎯 Menu SUPREMO totalmente integrado');
    }
}

// Inicialização automática ou manual
document.addEventListener('DOMContentLoaded', () => {
    // Opção 1: Inicialização automática (descomente se quiser)
    // setTimeout(() => {
    //     const menuConfig = new MenuConfigSupremo();
    //     menuConfig.init();
    // }, 2000);
    
    // Opção 2: Inicialização manual via console
    window.MenuConfigSupremo = MenuConfigSupremo;
    
    console.log('📋 Menu Config SUPREMO carregado');
    console.log('Para ativar: new MenuConfigSupremo().init()');
});

// Função helper para ativação rápida
window.activateSupremoMenu = () => {
    const menuConfig = new MenuConfigSupremo();
    menuConfig.init();
    return '✅ Menu SUPREMO ativado!';
};