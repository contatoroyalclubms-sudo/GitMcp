// Configuração de integração com o sistema MEEP
const CONFIG = {
    // URLs do sistema
    MEEP_FRONTEND: '/app',
    MEEP_BACKEND: 'https://backend-painel-universal-production.up.railway.app',
    
    // Deploy (Railway)
    MEEP_FRONTEND_PROD: '/app',
    MEEP_BACKEND_PROD: 'https://backend-painel-universal-production.up.railway.app',
    
    // Usar produção ou local
    USE_PRODUCTION: true,
    
    // Obter URL corretas baseado no ambiente
    get FRONTEND_URL() {
        return this.USE_PRODUCTION ? this.MEEP_FRONTEND_PROD : this.MEEP_FRONTEND;
    },
    
    get BACKEND_URL() {
        return this.USE_PRODUCTION ? this.MEEP_BACKEND_PROD : this.MEEP_BACKEND;
    }
};

// Função para redirecionar após login bem-sucedido
function redirectToMEEP() {
    // Salvar token se existir
    const token = localStorage.getItem('token');
    
    // Redirecionar para o dashboard do MEEP
    window.location.href = CONFIG.FRONTEND_URL + (token ? '?token=' + token : '');
}

// Exportar para uso global
window.CONFIG = CONFIG;
window.redirectToMEEP = redirectToMEEP;