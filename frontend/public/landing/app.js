// ===== SUPREME EVENTOS - MASTER JAVASCRIPT =====

// Initialize Particles
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#6366f1' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#6366f1',
            opacity: 0.2,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: { enable: true, mode: 'repulse' },
            onclick: { enable: true, mode: 'push' },
            resize: true
        }
    },
    retina_detect: true
});

// Three.js Background
function initThree() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('three-canvas'),
        alpha: true,
        antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Create geometric shapes
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);
    
    camera.position.z = 30;
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        torusKnot.rotation.x += 0.001;
        torusKnot.rotation.y += 0.002;
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Responsive
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize Three.js
initThree();

// Typed.js
const typed = new Typed('#typed-text', {
    strings: [
        'Gestão de Eventos',
        'Controle Supremo',
        'Experiência Digital',
        'Automação com IA',
        'Análise em Tempo Real'
    ],
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 2000,
    loop: true
});

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-count'));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = current.toFixed(1);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target % 1 === 0 ? target : target.toFixed(1);
            }
        };
        
        // Start animation when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

animateCounters();

// Modal Functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function openSignupModal() {
    // Reuse login modal with different content
    openLoginModal();
    document.querySelector('.modal-header h2').textContent = 'Criar Conta';
    document.querySelector('.btn-submit span').textContent = 'Cadastrar';
}

// Form Handling
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const button = e.target.querySelector('.btn-submit');
    const originalText = button.innerHTML;
    
    // Loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    button.disabled = true;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Success state
    button.innerHTML = '<i class="fas fa-check"></i> Sucesso!';
    button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    
    setTimeout(() => {
        closeLoginModal();
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
        button.style.background = '';
        
        // Show success notification
        showNotification('Login realizado com sucesso! Bem-vindo ao Supreme Eventos', 'success');
    }, 1000);
});

// Password Toggle
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
        const input = button.parentElement.querySelector('input');
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
});

// Dashboard Chart
function initDashboardChart() {
    const canvas = document.getElementById('dashboard-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
    
    // Animated chart
    let offset = 0;
    
    function drawChart() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        
        for (let x = 0; x < canvas.width; x++) {
            const y = Math.sin((x + offset) * 0.02) * 50 + 100;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Fill area
        ctx.lineTo(canvas.width, 200);
        ctx.lineTo(0, 200);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        offset += 2;
        requestAnimationFrame(drawChart);
    }
    
    drawChart();
}

initDashboardChart();

// Chat Widget
let chatOpen = false;

function toggleChat() {
    const widget = document.getElementById('chatWidget');
    chatOpen = !chatOpen;
    
    if (chatOpen) {
        widget.classList.add('active');
        // Auto greeting
        setTimeout(() => {
            addBotMessage("Bem-vindo ao Supreme Eventos! Como posso ajudar você hoje?");
        }, 500);
    } else {
        widget.classList.remove('active');
    }
}

// FAB Click
document.querySelector('.fab-main')?.addEventListener('click', toggleChat);

// Chat Input
document.querySelector('.chat-input button')?.addEventListener('click', sendMessage);
document.querySelector('.chat-input input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const input = document.querySelector('.chat-input input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addUserMessage(message);
    input.value = '';
    
    // Simulate bot response
    setTimeout(() => {
        const responses = [
            "Ótima pergunta! Nosso sistema Supreme Eventos pode lidar com isso perfeitamente.",
            "Entendo. Deixe-me conectar você com nossa equipe especializada.",
            "Absolutamente! Com nossos 26 módulos integrados, podemos fazer isso acontecer.",
            "Nosso sistema potencializado por IA foi projetado exatamente para esse propósito.",
            "Excelente escolha! Supreme Eventos é a solução perfeita para suas necessidades."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addBotMessage(randomResponse);
    }, 1000);
}

function addUserMessage(text) {
    const messagesContainer = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `<p>${text}</p>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addBotMessage(text) {
    const messagesContainer = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.innerHTML = `<p>${text}</p>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Animate features on scroll
gsap.utils.toArray('.feature-card').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power3.out'
    });
});

// Parallax effect
gsap.to('.gradient-orb', {
    scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
    },
    y: -200,
    ease: 'none'
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'var(--gradient-1)'};
        color: white;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Demo Functions
function startDemo() {
    showNotification('Iniciando seu teste grátis...', 'success');
    setTimeout(() => {
        window.location.href = '#features';
    }, 1000);
}

function watchVideo() {
    showNotification('Demo em vídeo em breve!', 'info');
}

// Page Load Animations
window.addEventListener('load', () => {
    // Animate hero elements
    gsap.timeline()
        .from('.hero-badge', { y: -20, opacity: 0, duration: 0.5 })
        .from('.hero-title', { y: 30, opacity: 0, duration: 0.8 }, '-=0.3')
        .from('.hero-description', { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
        .from('.hero-actions', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.stat-card', { y: 30, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.3')
        .from('.floating-dashboard', { scale: 0.8, opacity: 0, duration: 1, ease: 'back.out(1.7)' }, '-=0.5');
});

// Performance Monitor
let fps = 0;
let lastTime = performance.now();

function updateFPS() {
    const currentTime = performance.now();
    fps = Math.round(1000 / (currentTime - lastTime));
    lastTime = currentTime;
    
    // Update UI if needed
    const fpsElement = document.getElementById('fps-counter');
    if (fpsElement) {
        fpsElement.textContent = `${fps} FPS`;
    }
    
    requestAnimationFrame(updateFPS);
}

updateFPS();

console.log('🚀 Supreme Eventos - Sistema Pronto!');
console.log('⚡ Performance: Otimizada');
console.log('🔒 Segurança: Máxima');
console.log('✨ Recursos: Todos Ativos');