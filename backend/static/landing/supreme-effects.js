// ===== SUPREME EVENTOS - EFEITOS MÁXIMOS =====

// MATRIX RAIN EFFECT
function createMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.className = 'matrix-bg';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-3';
    canvas.style.opacity = '0.1';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const matrix = "SUPREMEEVENTOS01";
    const matrixArray = matrix.split("");
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    const drops = [];
    
    for(let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
    
    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#6366f1';
        ctx.font = fontSize + 'px monospace';
        
        for(let i = 0; i < drops.length; i++) {
            const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(drawMatrix, 35);
}

// ENERGIA PARTICLES SUPREMAS
function createEnergyParticles() {
    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'energy-particle';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.animationDuration = (5 + Math.random() * 10) + 's';
        particle.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 15000);
    }, 300);
}

// LIGHTNING STRIKES
function createLightning() {
    setInterval(() => {
        const lightning = document.createElement('div');
        lightning.className = 'lightning';
        lightning.style.left = Math.random() * window.innerWidth + 'px';
        document.body.appendChild(lightning);
        
        setTimeout(() => lightning.remove(), 4000);
    }, 5000);
}

// CURSOR TRAIL EFFECT
let mouseX = 0, mouseY = 0;
const cursorTrails = [];

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    const trail = document.createElement('div');
    trail.style.position = 'fixed';
    trail.style.left = mouseX + 'px';
    trail.style.top = mouseY + 'px';
    trail.style.width = '10px';
    trail.style.height = '10px';
    trail.style.background = 'linear-gradient(45deg, #6366f1, #a855f7)';
    trail.style.borderRadius = '50%';
    trail.style.pointerEvents = 'none';
    trail.style.zIndex = '9999';
    trail.style.boxShadow = '0 0 10px #6366f1';
    trail.style.animation = 'fadeOut 1s ease-out forwards';
    
    document.body.appendChild(trail);
    
    setTimeout(() => trail.remove(), 1000);
});

// FADE OUT ANIMATION
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0); }
    }
`;
document.head.appendChild(fadeStyle);

// GLITCH TEXT EFFECT
document.querySelectorAll('h1, h2, h3').forEach(element => {
    element.classList.add('glitch');
    element.setAttribute('data-text', element.textContent);
});

// PARALLAX SUPREME
let ticking = false;
function updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach((element, index) => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
    
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick);

// AUDIO REACTIVE VISUALIZATION
function createAudioVisualizer() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.bottom = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100px';
    canvas.style.zIndex = '100';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.3';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = 100;
    
    function draw() {
        requestAnimationFrame(draw);
        
        analyser.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for(let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(0.5, '#a855f7');
            gradient.addColorStop(1, '#ec4899');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
    
    // Start visualization on user interaction
    document.addEventListener('click', () => {
        audioContext.resume();
        draw();
    }, { once: true });
}

// MORPHING BACKGROUND SHAPES
function createMorphingShapes() {
    for(let i = 0; i < 3; i++) {
        const shape = document.createElement('div');
        shape.className = 'morph-shape';
        shape.style.top = Math.random() * window.innerHeight + 'px';
        shape.style.left = Math.random() * window.innerWidth + 'px';
        shape.style.animationDelay = i * 2 + 's';
        document.body.appendChild(shape);
    }
}

// TYPING ANIMATION SUPREME
class TypewriterSupreme {
    constructor(element, words, speed = 100) {
        this.element = element;
        this.words = words;
        this.speed = speed;
        this.wordIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.type();
    }
    
    type() {
        const current = this.wordIndex % this.words.length;
        const fullText = this.words[current];
        
        if(this.isDeleting) {
            this.element.textContent = fullText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = fullText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        let typeSpeed = this.isDeleting ? this.speed / 2 : this.speed;
        
        if(!this.isDeleting && this.charIndex === fullText.length) {
            typeSpeed = 2000;
            this.isDeleting = true;
        } else if(this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// SCROLL REVEAL SUPREME
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.style.animation = 'slideInUp 0.8s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .stat-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// SLIDE IN ANIMATION
const slideStyle = document.createElement('style');
slideStyle.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(slideStyle);

// MAGNETIC BUTTONS
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        button.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0, 0)';
    });
});

// RIPPLE EFFECT ON CLICK
document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.position = 'fixed';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    ripple.style.width = '0';
    ripple.style.height = '0';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(99, 102, 241, 0.3)';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'rippleEffect 1s ease-out forwards';
    
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
});

// RIPPLE ANIMATION
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleEffect {
        to {
            width: 500px;
            height: 500px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// INITIALIZE ALL SUPREME EFFECTS
window.addEventListener('load', () => {
    createMatrixRain();
    createEnergyParticles();
    createLightning();
    createMorphingShapes();
    // createAudioVisualizer(); // Comentado para não solicitar permissão de áudio
    
    // Add supreme classes
    document.querySelector('.hero-title').classList.add('text-supreme');
    document.querySelectorAll('.btn-primary, .btn-glow').forEach(btn => {
        btn.classList.add('btn-liquid');
    });
    document.querySelectorAll('.feature-card, .stat-card').forEach(card => {
        card.classList.add('glass-supreme');
    });
    
    console.log('🔥 SUPREME EFFECTS LOADED!');
    console.log('⚡ MAXIMUM POWER ACTIVATED!');
    console.log('🚀 PERFORMANCE: ULTRA!');
});

// KONAMI CODE EASTER EGG
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if(e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if(konamiIndex === konamiCode.length) {
            activateSupremeMode();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateSupremeMode() {
    document.body.style.animation = 'supremeMode 2s ease-in-out';
    
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4rem;
        font-weight: 900;
        color: #fff;
        text-shadow: 0 0 30px #6366f1;
        z-index: 10000;
        animation: supremeText 2s ease-in-out forwards;
    `;
    message.textContent = 'MODO SUPREMO ATIVADO! 🔥';
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 3000);
    
    // Adiciona mais partículas
    for(let i = 0; i < 50; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'super-particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = Math.random() * window.innerHeight + 'px';
            particle.style.width = '5px';
            particle.style.height = '5px';
            particle.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            particle.style.borderRadius = '50%';
            particle.style.boxShadow = `0 0 10px currentColor`;
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 20000);
        }, i * 50);
    }
}

// SUPREME MODE ANIMATION
const supremeStyle = document.createElement('style');
supremeStyle.textContent = `
    @keyframes supremeMode {
        0% { filter: hue-rotate(0deg) saturate(100%); }
        50% { filter: hue-rotate(180deg) saturate(200%); }
        100% { filter: hue-rotate(360deg) saturate(100%); }
    }
    @keyframes supremeText {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
    }
`;
document.head.appendChild(supremeStyle);