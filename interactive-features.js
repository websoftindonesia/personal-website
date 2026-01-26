// ===== 🎨 INTERACTIVE FEATURES - WEBSOFT INDONESIA =====
// 20+ Unique JavaScript Interactions

// ===== 1. CURSOR TRAIL EFFECT =====
const cursorTrail = [];
const maxTrailLength = 15;

document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.7) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = e.pageX + 'px';
        trail.style.top = e.pageY + 'px';
        document.body.appendChild(trail);
        
        cursorTrail.push(trail);
        if (cursorTrail.length > maxTrailLength) {
            const oldTrail = cursorTrail.shift();
            oldTrail.remove();
        }
        
        setTimeout(() => trail.remove(), 800);
    }
});

// ===== 2. KONAMI CODE EASTER EGG =====
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateKonamiMode();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateKonamiMode() {
    showNotification('🎮 Konami Code Activated! Secret Mode Unlocked!', 'success');
    createConfetti();
    document.body.style.animation = 'rainbow 3s linear infinite';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 5000);
}

// ===== 3. CONFETTI EFFECT =====
function createConfetti() {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }
}

// ===== 4. SHAKE TO REVEAL =====
let lastX = 0, lastY = 0, lastZ = 0;
let shakeCount = 0;

if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', (e) => {
        const acc = e.accelerationIncludingGravity;
        const threshold = 15;
        
        if (Math.abs(acc.x - lastX) > threshold || 
            Math.abs(acc.y - lastY) > threshold || 
            Math.abs(acc.z - lastZ) > threshold) {
            shakeCount++;
            if (shakeCount > 3) {
                showNotification('📱 Shake detected! Here\'s a surprise!', 'success');
                createConfetti();
                shakeCount = 0;
            }
        }
        
        lastX = acc.x;
        lastY = acc.y;
        lastZ = acc.z;
    });
}

// ===== 5. TEXT SCRAMBLE EFFECT =====
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    
    update() {
        let output = '';
        let complete = 0;
        
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += char;
            } else {
                output += from;
            }
        }
        
        this.el.innerText = output;
        
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// Apply scramble effect to section titles
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.section-header h2').forEach(el => {
        const fx = new TextScramble(el);
        const originalText = el.innerText;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    fx.setText(originalText);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(el);
    });
});

// ===== 6. ACHIEVEMENT SYSTEM =====
const achievements = {
    explorer: { name: 'Explorer', desc: 'Visited all sections', icon: '🗺️', unlocked: false },
    speedster: { name: 'Speedster', desc: 'Scrolled super fast', icon: '⚡', unlocked: false },
    curious: { name: 'Curious Mind', desc: 'Clicked 10+ items', icon: '🔍', unlocked: false },
    chatter: { name: 'Chatterbox', desc: 'Sent 5+ chat messages', icon: '💬', unlocked: false },
    nightowl: { name: 'Night Owl', desc: 'Visited at night', icon: '🦉', unlocked: false },
    earlybird: { name: 'Early Bird', desc: 'Visited in morning', icon: '🌅', unlocked: false },
    loyal: { name: 'Loyal Visitor', desc: 'Visited 5+ times', icon: '⭐', unlocked: false }
};

let clickCount = 0;
let chatMessageCount = 0;
let visitedSections = new Set();

function unlockAchievement(key) {
    if (!achievements[key].unlocked) {
        achievements[key].unlocked = true;
        const ach = achievements[key];
        showAchievement(ach.icon, ach.name, ach.desc);
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }
}

function showAchievement(icon, name, desc) {
    const achDiv = document.createElement('div');
    achDiv.className = 'achievement-popup';
    achDiv.innerHTML = `
        <div class="achievement-icon">${icon}</div>
        <div class="achievement-content">
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-name">${name}</div>
            <div class="achievement-desc">${desc}</div>
        </div>
    `;
    document.body.appendChild(achDiv);
    
    setTimeout(() => achDiv.classList.add('show'), 100);
    setTimeout(() => {
        achDiv.classList.remove('show');
        setTimeout(() => achDiv.remove(), 500);
    }, 4000);
}

// Track section visits
document.addEventListener('DOMContentLoaded', () => {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visitedSections.add(entry.target.id);
                if (visitedSections.size >= 5) {
                    unlockAchievement('explorer');
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('section[id]').forEach(section => {
        sectionObserver.observe(section);
    });
});

// Track clicks
document.addEventListener('click', () => {
    clickCount++;
    if (clickCount >= 10) unlockAchievement('curious');
});

// Track scroll speed
let lastScrollTime = Date.now();
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const now = Date.now();
    const currentY = window.scrollY;
    const speed = Math.abs(currentY - lastScrollY) / (now - lastScrollTime);
    
    if (speed > 5) {
        unlockAchievement('speedster');
    }
    
    lastScrollTime = now;
    lastScrollY = currentY;
}, { passive: true });

// Check time of day
const hour = new Date().getHours();
if (hour >= 22 || hour < 6) {
    setTimeout(() => unlockAchievement('nightowl'), 3000);
} else if (hour >= 5 && hour < 9) {
    setTimeout(() => unlockAchievement('earlybird'), 3000);
}

// ===== 7. INTERACTIVE BACKGROUND =====
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { offsetWidth, offsetHeight } = hero;
            
            const xPos = (clientX / offsetWidth - 0.5) * 20;
            const yPos = (clientY / offsetHeight - 0.5) * 20;
            
            const shapes = hero.querySelectorAll('.hero-shape');
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.5;
                shape.style.transform = `translate(${xPos * speed}px, ${yPos * speed}px)`;
            });
        });
    }
});

// ===== 8. SOUND EFFECTS =====
const sounds = {
    click: () => playTone(800, 0.1, 0.05),
    hover: () => playTone(600, 0.05, 0.03),
    success: () => playTone(1000, 0.2, 0.1)
};

function playTone(frequency, duration, volume = 0.1) {
    if (!window.AudioContext) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Add sound to buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button, .btn, a.nav-link').forEach(el => {
        el.addEventListener('mouseenter', () => sounds.hover());
        el.addEventListener('click', () => sounds.click());
    });
});

// ===== 9. PARALLAX SCROLL EFFECT =====
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    
    document.querySelectorAll('.hero-shape').forEach((shape, index) => {
        const speed = (index + 1) * 0.3;
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
}, { passive: true });

// ===== 10. DOUBLE CLICK EASTER EGG =====
let clickTimer = null;
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
                showNotification('🎭 Developer mode activated!', 'success');
                console.log('%c🚀 Welcome Developer!', 'font-size: 20px; color: #6366f1; font-weight: bold;');
                console.log('Achievements:', achievements);
                console.log('Sections Visited:', Array.from(visitedSections));
            } else {
                clickTimer = setTimeout(() => {
                    clickTimer = null;
                }, 300);
            }
        });
    }
});

// ===== 11. LONG PRESS EFFECT =====
let pressTimer;
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.portfolio-card, .service-card').forEach(card => {
        card.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => {
                card.style.transform = 'scale(1.05) rotate(2deg)';
                showNotification('✨ Long press detected!', 'success');
            }, 1000);
        });
        
        card.addEventListener('mouseup', () => {
            clearTimeout(pressTimer);
            card.style.transform = '';
        });
        
        card.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
            card.style.transform = '';
        });
    });
});

// ===== 12. VISITOR STATS TRACKER =====
function updateVisitorStats() {
    const stats = JSON.parse(localStorage.getItem('visitorStats') || '{}');
    stats.visits = (stats.visits || 0) + 1;
    stats.lastVisit = new Date().toISOString();
    stats.totalTimeSpent = (stats.totalTimeSpent || 0);
    localStorage.setItem('visitorStats', JSON.stringify(stats));
    
    if (stats.visits >= 5) {
        unlockAchievement('loyal');
    }
}

updateVisitorStats();

// Track time spent
let startTime = Date.now();
window.addEventListener('beforeunload', () => {
    const stats = JSON.parse(localStorage.getItem('visitorStats') || '{}');
    stats.totalTimeSpent = (stats.totalTimeSpent || 0) + (Date.now() - startTime);
    localStorage.setItem('visitorStats', JSON.stringify(stats));
});

// ===== 13. TYPING INDICATOR FOR CHAT =====
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        const typing = document.createElement('div');
        typing.className = 'chat-typing';
        typing.id = 'typingIndicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typing);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function hideTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

// ===== 14. NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3500);
}

// ===== 15. SCROLL PROGRESS BAR =====
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
}, { passive: true });

// ===== 16. COPY TO CLIPBOARD =====
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.contact-item p').forEach(el => {
        el.style.cursor = 'pointer';
        el.title = 'Click to copy';
        el.addEventListener('click', () => {
            navigator.clipboard.writeText(el.textContent).then(() => {
                showNotification('📋 Copied to clipboard!', 'success');
            });
        });
    });
});

// ===== 17. IMAGE LAZY LOADING WITH BLUR =====
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// ===== 18. DARK MODE TOGGLE =====
const darkModeToggle = document.createElement('button');
darkModeToggle.className = 'dark-mode-toggle';
darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
darkModeToggle.title = 'Toggle Dark Mode';
document.body.appendChild(darkModeToggle);

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    darkModeToggle.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
    localStorage.setItem('darkMode', isDark);
});

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// ===== 19. READING TIME ESTIMATOR =====
function calculateReadingTime() {
    const text = document.body.innerText;
    const words = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // 200 words per minute
    return readingTime;
}

// ===== 20. KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Open chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('chatToggle')?.click();
    }
    
    // Ctrl/Cmd + /: Show shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        showNotification('⌨️ Shortcuts: Ctrl+K (Chat), Ctrl+H (Home), Ctrl+C (Contact)', 'success');
    }
    
    // Ctrl/Cmd + H: Scroll to home
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Ctrl/Cmd + C: Scroll to contact
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('kontak')?.scrollIntoView({ behavior: 'smooth' });
    }
});

// ===== 21. MOUSE PARTICLE EXPLOSION =====
document.addEventListener('click', (e) => {
    if (Math.random() > 0.8) {
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'click-particle';
            particle.style.left = e.pageX + 'px';
            particle.style.top = e.pageY + 'px';
            particle.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
            particle.style.setProperty('--ty', (Math.random() - 0.5) * 200 + 'px');
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    }
});

// ===== 22. SCROLL SNAP SECTIONS =====
let isScrolling;
window.addEventListener('scroll', () => {
    clearTimeout(isScrolling);
    isScrolling = setTimeout(() => {
        const sections = document.querySelectorAll('section');
        let closest = null;
        let closestDistance = Infinity;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const distance = Math.abs(rect.top);
            if (distance < closestDistance && distance < 200) {
                closestDistance = distance;
                closest = section;
            }
        });
        
        if (closest && closestDistance < 100) {
            closest.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 150);
}, { passive: true });

// ===== CONSOLE WELCOME MESSAGE =====
console.log('%c🚀 Websoft Indonesia', 'font-size: 24px; color: #6366f1; font-weight: bold;');
console.log('%cInteractive features loaded!', 'font-size: 14px; color: #8b5cf6;');
console.log('%cTry these:', 'font-size: 12px; color: #666;');
console.log('- Konami Code: ↑↑↓↓←→←→BA');
console.log('- Double click logo');
console.log('- Long press cards');
console.log('- Shake your device');
console.log('- Keyboard shortcuts: Ctrl+K, Ctrl+H, Ctrl+C');
console.log('- Explore all sections for achievements!');
