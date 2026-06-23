// Victory Day Theme - 9 мая
// Дата: 9 мая

(function () {
    'use strict';

    const VictoryDayTheme = {
        id: 'victory-day',
        name: '9 мая - День Победы',
        icon: '🕊️',

        // Модальное окно
        modalTitle: 'С Днём Победы! 🕊️',
        modalContent: '9 мая — день, когда мы чтим память героев и благодарим их за мирное небо над головой. Вечная слава защитникам Отечества!',

        specificDate: '05-09',


        cssVars: {
            '--accent': '#ef4444',
            '--accent-secondary': '#f97316',
            '--bg-primary': 'rgba(15, 23, 42, 0.8)',
            '--bg-secondary': 'rgba(30, 41, 59, 0.6)',
            '--text-highlight': '#fca5a5',
            '--border-color': 'rgba(239, 68, 68, 0.3)'
        },

        canvas: null,
        ctx: null,
        animationId: null,
        fireworks: [],

        init: function () {
            this.createCanvas();
            this.createBanner();
            this.createGeorgianRibbon();
            this.startFireworks();
        },

        createCanvas: function () {
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'seasonal-canvas victory-day-canvas';
            this.canvas.id = 'victory-day-fireworks';
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            document.body.appendChild(this.canvas);
            window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });
        },

        resizeCanvas: function () {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },

        createBanner: function () {
            const banner = document.createElement('div');
            banner.className = 'seasonal-banner victory-day-banner';
            banner.id = 'victory-day-banner';
            banner.innerHTML = '🕊️ С Днём Победы! 🎆';
            banner.style.cssText = `
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(249, 115, 22, 0.2)) !important;
                border: 1px solid rgba(239, 68, 68, 0.4) !important;
                color: #fca5a5 !important;
            `;
            document.body.appendChild(banner);
        },

        createGeorgianRibbon: function () {
            const ribbon = document.createElement('div');
            ribbon.id = 'victory-day-ribbon';
            ribbon.style.cssText = `
                position: fixed;
                top: 60px;
                left: 20px;
                width: 60px;
                height: 20px;
                background: linear-gradient(90deg, #000 33%, #ff8c00 33%, #ff8c00 66%, #000 66%);
                z-index: 100;
                transform: rotate(-15deg);
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                pointer-events: none;
            `;
            document.body.appendChild(ribbon);
        },

        createFirework: function () {
            const x = Math.random() * this.canvas.width;
            const y = this.canvas.height;
            const colors = ['#ef4444', '#f97316', '#fbbf24', '#ffffff', '#3b82f6'];

            return {
                x: x,
                y: y,
                targetY: Math.random() * this.canvas.height * 0.4 + 50,
                speed: 3 + Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                exploded: false,
                particles: []
            };
        },

        createParticles: function (x, y, color) {
            const particles = [];
            const count = 20 + Math.random() * 20;

            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count;
                const speed = 2 + Math.random() * 3;

                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    color: color
                });
            }

            return particles;
        },

        startFireworks: function () {
            this.fireworks = [];

            const animate = () => {
                // Полностью очищаем canvas (прозрачный фон)
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                // Создаём новый салют с шансом
                if (Math.random() < 0.03 && this.fireworks.length < 5) {
                    this.fireworks.push(this.createFirework());
                }

                this.fireworks.forEach((firework, index) => {
                    if (!firework.exploded) {
                        // Движение вверх
                        firework.y -= firework.speed;

                        // Рисуем ракету с тенью для лучшей видимости
                        this.ctx.shadowBlur = 10;
                        this.ctx.shadowColor = firework.color;
                        this.ctx.fillStyle = firework.color;
                        this.ctx.beginPath();
                        this.ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.shadowBlur = 0;

                        // Взрыв
                        if (firework.y <= firework.targetY) {
                            firework.exploded = true;
                            firework.particles = this.createParticles(firework.x, firework.y, firework.color);
                        }
                    } else {
                        // Частицы взрыва
                        firework.particles.forEach(p => {
                            p.x += p.vx;
                            p.y += p.vy;
                            p.vy += 0.1; // гравитация
                            p.life -= 0.02;

                            if (p.life > 0) {
                                this.ctx.globalAlpha = p.life;
                                this.ctx.shadowBlur = 5;
                                this.ctx.shadowColor = p.color;
                                this.ctx.fillStyle = p.color;
                                this.ctx.beginPath();
                                this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                                this.ctx.fill();
                                this.ctx.shadowBlur = 0;
                            }
                        });

                        // Удаляем мёртвые частицы
                        firework.particles = firework.particles.filter(p => p.life > 0);

                        // Удаляем салют если все частицы мертвы
                        if (firework.particles.length === 0) {
                            this.fireworks.splice(index, 1);
                        }
                    }
                });

                this.ctx.globalAlpha = 1;
                this.animationId = requestAnimationFrame(animate);
            };

            animate();
        },


        destroy: function () {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }

            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
                this.canvas = null;
                this.ctx = null;
            }

            const banner = document.getElementById('victory-day-banner');
            if (banner) banner.remove();

            const ribbon = document.getElementById('victory-day-ribbon');
            if (ribbon) ribbon.remove();

            this.fireworks = [];
        }
    };

    if (window.SeasonalManager) {
        window.SeasonalManager.registerTheme(VictoryDayTheme);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.SeasonalManager) window.SeasonalManager.registerTheme(VictoryDayTheme);
        });
    }
})();
