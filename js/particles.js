/* ============================================
   PARTICLES BACKGROUND - Subtle animated dots
   ============================================ */

let particlesConfig = null;
let particlesPresets = null;
let currentParticlesInstance = null;
let currentPreset = null;

/**
 * Get base path for GitHub Pages compatibility
 */
function getBasePath() {
    return window.location.pathname.includes('/skywireneo.github.io')
        ? '/skywireneo.github.io'
        : '';
}

/**
 * Load particles presets from JSON
 */
async function loadParticlesPresets() {
    try {
        const basePath = getBasePath();
        const configUrl = `${basePath}/_data/particles.json`;

        const response = await fetch(configUrl);
        if (!response.ok) {
            throw new Error('Failed to load particles.json');
        }

        const data = await response.json();
        particlesPresets = data.presets || {};

        // Auto-detect preset based on time if default is "auto"
        if (data.defaultPreset === 'auto') {
            const timePreset = autoDetectTimePreset(data.timeOfDay);
            if (timePreset) {
                setTimeout(() => setParticlesPreset(timePreset), 100);
            }
        }

    } catch (error) {
        console.error('Particles: failed to load presets', error);
    }
}

/**
 * Auto-detect preset based on time of day
 */
function autoDetectTimePreset(timeOfDay) {
    if (!timeOfDay) return 'day';

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    for (const [period, config] of Object.entries(timeOfDay)) {
        const [startHour, startMinute] = config.start.split(':').map(Number);
        const [endHour, endMinute] = config.end.split(':').map(Number);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        // Handle overnight periods (e.g., 22:00 - 06:00)
        if (startTime > endTime) {
            if (currentTime >= startTime || currentTime <= endTime) {
                return config.preset;
            }
        } else {
            if (currentTime >= startTime && currentTime <= endTime) {
                return config.preset;
            }
        }
    }

    return 'day';
}

/**
 * Set particles preset
 */
function setParticlesPreset(presetName) {

    if (!particlesPresets) {
        console.error(`[Particles] presets not loaded yet, trying to load...`);
        loadParticlesPresets().then(() => {
            if (particlesPresets && particlesPresets[presetName]) {
                setParticlesPreset(presetName);
            }
        });
        return false;
    }

    if (!particlesPresets[presetName]) {
        console.error(`[Particles] preset "${presetName}" not found in available presets`);
        return false;
    }

    const preset = particlesPresets[presetName];
    currentPreset = presetName;

    // Get base settings from config or use defaults
    const baseSettings = particlesConfig?.baseSettings || {
        particleCount: 25,
        connectionDistance: 100,
        mouseDistance: 150,
        speed: 0.3,
        size: { min: 1.5, max: 3 },
        opacity: { min: 0.2, max: 0.5 },
        lineWidth: 0.5,
        color: { r: 13, g: 148, b: 136 }
    };

    // Merge preset with base settings - preset values override base
    const newConfig = {
        ...baseSettings,
        ...preset,
        color: preset.color || baseSettings.color,
        size: preset.size || baseSettings.size,
        speed: preset.speed !== undefined ? preset.speed : baseSettings.speed,
        particleCount: preset.particleCount !== undefined ? preset.particleCount : baseSettings.particleCount,
        connectionDistance: preset.connectionDistance !== undefined ? preset.connectionDistance : baseSettings.connectionDistance,
        mouseDistance: preset.mouseDistance !== undefined ? preset.mouseDistance : baseSettings.mouseDistance,
        opacity: preset.opacity || baseSettings.opacity,
        lineWidth: preset.lineWidth !== undefined ? preset.lineWidth : baseSettings.lineWidth
    };

    // Update global config
    particlesConfig = {
        ...particlesConfig,
        baseSettings: newConfig
    };

    // Force complete reinitialization - destroy old instance completely
    if (currentParticlesInstance) {
        currentParticlesInstance.destroy();
        currentParticlesInstance = null;
    }

    // Small delay to ensure clean state
    setTimeout(() => {
        const canvas = document.getElementById('particles-canvas');
        if (canvas) {
            // Clear canvas completely
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            currentParticlesInstance = new ParticlesBackground('particles-canvas', newConfig);
        }
    }, 50);

    // Show notification
    if (window.DevModeNotifications && window.DevModeNotifications.show) {
        window.DevModeNotifications.show(
            `✨ Тема частиц: ${preset.icon} ${preset.name}`,
            preset.description,
            3000
        );
    }

    return true;
}


/**
 * Get current preset name
 */
function getCurrentParticlesPreset() {
    return currentPreset;
}

/**
 * Open particles themes modal
 */
function openParticlesThemesModal() {
    if (!particlesPresets) {
        console.error('Particles: presets not loaded yet');
        // Try to load presets first
        loadParticlesPresets().then(() => {
            if (particlesPresets) {
                openParticlesThemesModal();
            } else {
                // Show notification that presets are loading
                if (window.DevModeNotifications && window.DevModeNotifications.show) {
                    window.DevModeNotifications.show(
                        '⏳ Загрузка тем',
                        'Пресеты частиц загружаются, попробуйте снова через секунду',
                        2000
                    );
                }
            }
        });
        return;
    }


    // Create modal if not exists
    let modal = document.getElementById('particlesThemesModal');
    if (!modal) {
        modal = createParticlesThemesModal();
    }

    // Generate preset cards
    const grid = modal.querySelector('.particles-themes-grid');
    if (grid) {
        grid.innerHTML = Object.entries(particlesPresets).map(([id, preset]) => `
            <div class="particles-theme-card ${currentPreset === id ? 'active' : ''}" 
                 onclick="setParticlesPreset('${id}'); closeParticlesThemesModal();"
                 style="cursor: pointer; padding: 16px; border-radius: 12px; background: rgba(31, 41, 55, 0.8); border: 2px solid ${currentPreset === id ? 'var(--accent)' : 'transparent'}; transition: all 0.3s ease; text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 8px;">${preset.icon}</div>
                <div style="font-weight: 600; color: var(--text); margin-bottom: 4px;">${preset.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">${preset.description}</div>
                <div style="margin-top: 8px; width: 100%; height: 4px; border-radius: 2px; background: rgb(${preset.color.r}, ${preset.color.g}, ${preset.color.b});"></div>
            </div>
        `).join('');
    }

    modal.style.display = 'flex';
    setTimeout(() => modal.style.opacity = '1', 10);
}

/**
 * Create particles themes modal
 */
function createParticlesThemesModal() {
    const modal = document.createElement('div');
    modal.id = 'particlesThemesModal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 99999;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%); 
                    border: 1px solid rgba(13, 148, 136, 0.3); 
                    border-radius: 16px; 
                    max-width: 800px; 
                    width: 90%; 
                    max-height: 85vh; 
                    overflow-y: auto; 
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
            <div style="padding: 20px; border-bottom: 1px solid rgba(13, 148, 136, 0.3); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: var(--text); font-size: 1.3rem;">
                    <i class="fas fa-palette" style="color: var(--accent); margin-right: 0.5rem;"></i>
                    Темы частиц
                </h3>
                <button onclick="closeParticlesThemesModal()" 
                        style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                    &times;
                </button>
            </div>
            <div style="padding: 20px;">
                <p style="color: var(--text-muted); margin-bottom: 1rem; font-size: 0.9rem;">
                    Выберите тему для анимации частиц. Тема автоматически меняется в зависимости от времени суток.
                </p>
                <div class="particles-themes-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
                    <!-- Preset cards will be inserted here -->
                </div>
            </div>
            <div style="padding: 15px 20px; border-top: 1px solid rgba(13, 148, 136, 0.3); display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-muted); font-size: 0.85rem;">
                    Текущая: <span id="currentPresetName" style="color: var(--accent);">-</span>
                </span>
                <button onclick="closeParticlesThemesModal()" 
                        style="background: rgba(13, 148, 136, 0.2); border: 1px solid rgba(13, 148, 136, 0.4); color: var(--accent); padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                    Закрыть
                </button>
            </div>
        </div>
    `;

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeParticlesThemesModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeParticlesThemesModal();
        }
    });

    document.body.appendChild(modal);
    return modal;
}

/**
 * Close particles themes modal
 */
function closeParticlesThemesModal() {
    const modal = document.getElementById('particlesThemesModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

// Export functions
window.loadParticlesPresets = loadParticlesPresets;
window.setParticlesPreset = setParticlesPreset;
window.getCurrentParticlesPreset = getCurrentParticlesPreset;
window.openParticlesThemesModal = openParticlesThemesModal;
window.closeParticlesThemesModal = closeParticlesThemesModal;


/**
 * Load particles configuration from JSON
 */
async function loadParticlesConfig() {
    try {
        const basePath = getBasePath();
        const configUrl = `${basePath}/_data/particles.json`;

        const response = await fetch(configUrl);
        if (!response.ok) {
            throw new Error('Failed to load particles.json');
        }

        particlesConfig = await response.json();

        // Initialize particles if enabled
        if (particlesConfig.enabled && document.getElementById('particles-canvas')) {
            new ParticlesBackground('particles-canvas', particlesConfig);
        }

    } catch (error) {
        console.error('Particles: failed to load config, using defaults', error);
        // Fallback to default configuration
        particlesConfig = {
            enabled: true,
            particleCount: 25,
            connectionDistance: 100,
            mouseDistance: 150,
            speed: 0.3,
            size: { min: 1.5, max: 3 },
            opacity: { min: 0.2, max: 0.5 },
            lineWidth: 0.5,
            color: { r: 13, g: 148, b: 136 }
        };

        if (document.getElementById('particles-canvas')) {
            new ParticlesBackground('particles-canvas', particlesConfig);
        }
    }
}

class ParticlesBackground {
    constructor(canvasId, config = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.connections = [];

        // Configuration - merge with defaults
        this.config = {
            particleCount: 25,
            connectionDistance: 100,
            mouseDistance: 150,
            speed: 0.3,
            size: { min: 1.5, max: 3 },
            opacity: { min: 0.2, max: 0.5 },
            lineWidth: 0.5,
            color: { r: 13, g: 148, b: 136 },
            ...config
        };

        this.mouse = { x: null, y: null };
        this.animationId = null;

        // Store reference
        currentParticlesInstance = this;

        this.init();
    }


    init() {
        this.resize();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    resize() {
        const parent = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        // Set display size (css pixels)
        this.canvas.style.width = parent.offsetWidth + 'px';
        this.canvas.style.height = parent.offsetHeight + 'px';

        // Set actual size in memory (scaled to account for extra pixel density)
        this.canvas.width = parent.offsetWidth * dpr;
        this.canvas.height = parent.offsetHeight * dpr;

        // Normalize coordinate system to use css pixels
        this.ctx.scale(dpr, dpr);

        // Store logical size for calculations
        this.logicalWidth = parent.offsetWidth;
        this.logicalHeight = parent.offsetHeight;
    }


    createParticles() {
        this.particles = [];
        const width = this.logicalWidth || this.canvas.width;
        const height = this.logicalHeight || this.canvas.height;

        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * this.config.speed,
                vy: (Math.random() - 0.5) * this.config.speed,
                size: Math.random() * (this.config.size.max - this.config.size.min) + this.config.size.min,
                opacity: Math.random() * (this.config.opacity.max - this.config.opacity.min) + this.config.opacity.min
            });
        }
    }


    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // Mouse interaction - subtle
        this.canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.parentElement.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    updateParticles() {
        const width = this.logicalWidth || this.canvas.width;
        const height = this.logicalHeight || this.canvas.height;

        this.particles.forEach(p => {
            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            // Keep in bounds
            p.x = Math.max(0, Math.min(width, p.x));
            p.y = Math.max(0, Math.min(height, p.y));


            // Mouse interaction - gentle repulsion
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.mouseDistance) {
                    const force = (this.config.mouseDistance - distance) / this.config.mouseDistance;
                    p.vx -= (dx / distance) * force * 0.02;
                    p.vy -= (dy / distance) * force * 0.02;
                }
            }

            // Limit velocity
            const maxSpeed = this.config.speed * 2;
            p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));
            p.vy = Math.max(-maxSpeed, Math.min(maxSpeed, p.vy));
        });
    }

    drawParticles() {
        const width = this.logicalWidth || this.canvas.width;
        const height = this.logicalHeight || this.canvas.height;

        this.ctx.clearRect(0, 0, width, height);

        // Draw connections first (behind particles)
        this.drawConnections();

        // Draw particles
        const { r, g, b } = this.config.color;

        // Debug: log color on first draw
        if (!this._colorLogged) {
            this._colorLogged = true;
        }

        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
            this.ctx.fill();
        });
    }



    drawConnections() {
        const { r, g, b } = this.config.color;
        const lineWidth = this.config.lineWidth || 0.5;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.connectionDistance) {
                    const opacity = (1 - distance / this.config.connectionDistance) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    this.ctx.lineWidth = lineWidth;
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadParticlesConfig();
    loadParticlesPresets();
});

// Export for potential use
window.loadParticlesConfig = loadParticlesConfig;
window.ParticlesBackground = ParticlesBackground;
