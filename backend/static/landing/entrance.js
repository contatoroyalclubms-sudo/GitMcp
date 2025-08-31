// ===== SUPREME EVENTOS - ENTRADA CINEMATOGRÁFICA MÁXIMA =====

// CRIAR TELA DE LOADING ÉPICA
function createSupremeEntrance() {
    // Overlay principal
    const entranceOverlay = document.createElement('div');
    entranceOverlay.id = 'supreme-entrance';
    entranceOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 100000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    `;
    
    // Logo animado
    const logo = document.createElement('div');
    logo.innerHTML = `
        <div class="entrance-logo" style="
            font-size: 5rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 10px;
            position: relative;
            opacity: 0;
            animation: logoReveal 1s ease-out forwards;
        ">
            <span style="
                background: linear-gradient(45deg, #6366f1, #a855f7, #ec4899);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                display: block;
                animation: textGlow 2s ease-in-out infinite;
            ">SUPREME</span>
            <span style="
                color: #fff;
                font-size: 3rem;
                letter-spacing: 20px;
                display: block;
                margin-top: -10px;
                opacity: 0;
                animation: fadeInUp 1s ease-out 0.5s forwards;
            ">EVENTOS</span>
        </div>
    `;
    
    // Barra de progresso
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
        width: 400px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        margin-top: 50px;
        overflow: hidden;
        position: relative;
    `;
    
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
        border-radius: 2px;
        transition: width 0.3s ease;
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.8);
    `;
    progressContainer.appendChild(progressBar);
    
    // Texto de carregamento
    const loadingText = document.createElement('div');
    loadingText.style.cssText = `
        color: #fff;
        font-size: 0.9rem;
        margin-top: 20px;
        opacity: 0.7;
        font-family: 'Space Grotesk', monospace;
        letter-spacing: 2px;
    `;
    loadingText.textContent = 'INICIALIZANDO SISTEMA...';
    
    // Partículas de fundo
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'entrance-particles';
    particlesContainer.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        pointer-events: none;
    `;
    
    // Criar partículas
    for(let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: #fff;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: 0;
            animation: particleFade 3s ease-in-out infinite;
            animation-delay: ${Math.random() * 3}s;
        `;
        particlesContainer.appendChild(particle);
    }
    
    // Adicionar elementos
    entranceOverlay.appendChild(particlesContainer);
    entranceOverlay.appendChild(logo);
    entranceOverlay.appendChild(progressContainer);
    entranceOverlay.appendChild(loadingText);
    document.body.appendChild(entranceOverlay);
    
    // Animações CSS
    const entranceStyles = document.createElement('style');
    entranceStyles.textContent = `
        @keyframes logoReveal {
            0% {
                opacity: 0;
                transform: scale(0.5) rotateX(90deg);
            }
            50% {
                opacity: 1;
                transform: scale(1.1) rotateX(0deg);
            }
            100% {
                opacity: 1;
                transform: scale(1) rotateX(0deg);
            }
        }
        
        @keyframes textGlow {
            0%, 100% {
                filter: brightness(1) drop-shadow(0 0 20px rgba(99, 102, 241, 0.5));
            }
            50% {
                filter: brightness(1.2) drop-shadow(0 0 40px rgba(168, 85, 247, 0.8));
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes particleFade {
            0%, 100% {
                opacity: 0;
                transform: translateY(0) scale(0);
            }
            50% {
                opacity: 1;
                transform: translateY(-50px) scale(1);
            }
        }
        
        @keyframes entranceExit {
            0% {
                opacity: 1;
                transform: scale(1);
            }
            100% {
                opacity: 0;
                transform: scale(1.5);
                filter: blur(20px);
            }
        }
        
        @keyframes glitchEffect {
            0%, 100% {
                transform: translate(0);
                filter: hue-rotate(0deg);
            }
            20% {
                transform: translate(-2px, 2px);
                filter: hue-rotate(90deg);
            }
            40% {
                transform: translate(-2px, -2px);
                filter: hue-rotate(180deg);
            }
            60% {
                transform: translate(2px, 2px);
                filter: hue-rotate(270deg);
            }
            80% {
                transform: translate(2px, -2px);
                filter: hue-rotate(360deg);
            }
        }
    `;
    document.head.appendChild(entranceStyles);
    
    // Sequência de carregamento
    const loadingSteps = [
        'INICIALIZANDO SISTEMA...',
        'CARREGANDO MÓDULOS IA...',
        'CONECTANDO 54 AGENTES...',
        'ATIVANDO 173 FERRAMENTAS...',
        'SINCRONIZANDO BANCO DE DADOS...',
        'PREPARANDO INTERFACE...',
        'SISTEMA PRONTO!'
    ];
    
    let currentStep = 0;
    let progress = 0;
    
    const loadingInterval = setInterval(() => {
        progress += 15;
        progressBar.style.width = Math.min(progress, 100) + '%';
        
        if(currentStep < loadingSteps.length) {
            loadingText.textContent = loadingSteps[currentStep];
            currentStep++;
        }
        
        // Efeito glitch no texto
        if(progress > 50 && progress < 80) {
            loadingText.style.animation = 'glitchEffect 0.3s ease infinite';
        } else {
            loadingText.style.animation = 'none';
        }
        
        if(progress >= 100) {
            clearInterval(loadingInterval);
            
            // Animação de saída épica
            setTimeout(() => {
                entranceOverlay.style.animation = 'entranceExit 1s ease-out forwards';
                
                // Criar explosão de partículas
                createParticleExplosion();
                
                // Remover overlay
                setTimeout(() => {
                    entranceOverlay.remove();
                    
                    // Iniciar animações da página principal
                    startMainPageAnimations();
                    
                    // Mostrar notificação de boas-vindas
                    showWelcomeNotification();
                }, 1000);
            }, 500);
        }
    }, 400);
}

// EXPLOSÃO DE PARTÍCULAS
function createParticleExplosion() {
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];
    
    for(let i = 0; i < 100; i++) {
        const particle = document.createElement('div');
        const angle = (Math.PI * 2 * i) / 100;
        const velocity = 5 + Math.random() * 10;
        
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            left: 50%;
            top: 50%;
            pointer-events: none;
            z-index: 99999;
            box-shadow: 0 0 10px currentColor;
        `;
        
        document.body.appendChild(particle);
        
        // Animar partícula
        let x = 0, y = 0;
        const animateParticle = () => {
            x += Math.cos(angle) * velocity;
            y += Math.sin(angle) * velocity;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = Math.max(0, 1 - Math.abs(x) / 1000);
            
            if(Math.abs(x) < 1000) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animateParticle);
    }
}

// ANIMAÇÕES DA PÁGINA PRINCIPAL
function startMainPageAnimations() {
    // Adicionar classe de animação aos elementos principais
    document.querySelectorAll('.hero-title, .hero-description, .hero-actions').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.animation = `fadeInUp 0.8s ease-out ${index * 0.2}s forwards`;
    });
    
    // Efeito de onda nos cards
    document.querySelectorAll('.feature-card, .stat-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// NOTIFICAÇÃO DE BOAS-VINDAS
function showWelcomeNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: -400px;
        padding: 20px 30px;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        color: white;
        border-radius: 15px;
        font-weight: 600;
        box-shadow: 0 20px 40px rgba(99, 102, 241, 0.4);
        z-index: 10000;
        transition: right 0.5s ease-out;
        display: flex;
        align-items: center;
        gap: 15px;
    `;
    
    notification.innerHTML = `
        <div style="
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        ">🚀</div>
        <div>
            <div style="font-size: 1.1rem;">Bem-vindo ao Supreme Eventos!</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">Sistema carregado com sucesso</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.right = '20px';
    }, 100);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.right = '-400px';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// INICIAR ENTRADA QUANDO A PÁGINA CARREGAR
window.addEventListener('DOMContentLoaded', () => {
    createSupremeEntrance();
});

// EFEITO DE SOM (OPCIONAL)
function playEntranceSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAADAAAAA');
    audio.volume = 0.3;
    audio.play().catch(() => {});
}

console.log('🔥 SUPREME ENTRANCE LOADED!');
console.log('🚀 CINEMATOGRAPHIC EXPERIENCE READY!');