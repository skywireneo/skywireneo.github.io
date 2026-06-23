// Halloween Theme - Хэллоуин
// Дата: 31 октября

(function () {
    'use strict';

    const HalloweenTheme = {
        id: 'halloween',
        name: 'Хэллоуин',
        icon: '🎃',

        // Модальное окно
        modalTitle: 'Happy Halloween! 🎃',
        modalContent: 'В этот мистический день пусть ваш код работает как заклинание, а баги исчезают как привидения на рассвете!',

        // Конкретная дата
        specificDate: '10-31',


        // CSS переменные - тёмные/оранжевые
        cssVars: {
            '--accent': '#f97316', // оранжевый тыквы
            '--accent-secondary': '#7c2d12', // тёмно-оранжевый
            '--bg-primary': 'rgba(15, 10, 5, 0.9)',
            '--bg-secondary': 'rgba(30, 20, 10, 0.7)',
            '--text-highlight': '#f97316',
            '--border-color': 'rgba(249, 115, 22, 0.3)'
        },

        // Canvas для летучих мышей
        canvas: null,
        ctx: null,
        animationId: null,
        bats: [],

        config: {
            batCount: 20,
            minSpeed: 1,
            maxSpeed: 3
        },

        /**
         * Инициализация темы
         */
        init: function () {
            this.createCanvas();
            this.createBanner();
            this.createSpiderWeb();
            this.startBatAnimation();
        },

        /**
         * Создаёт canvas
         */
        createCanvas: function () {
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'seasonal-canvas halloween-canvas';
            this.canvas.id = 'halloween-bats';
            this.ctx = this.canvas.getContext('2d');

            this.resizeCanvas();
            document.body.appendChild(this.canvas);

            window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });
        },

        /**
         * Изменяет размер canvas
         */
        resizeCanvas: function () {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },

        /**
         * Создаёт баннер
         */
        createBanner: function () {
            const banner = document.createElement('div');
            banner.className = 'seasonal-banner halloween-banner';
            banner.id = 'halloween-banner';
            banner.innerHTML = '🎃 Happy Halloween! 👻';
            banner.style.background = 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(0, 0, 0, 0.4))';
            banner.style.border = '1px solid rgba(249, 115, 22, 0.4)';
            banner.style.color = '#f97316';

            document.body.appendChild(banner);
        },

        /**
         * Создаёт паутину в углах
         */
        createSpiderWeb: function () {
            const web = document.createElement('div');
            web.id = 'halloween-web';
            web.style.cssText = `
                position: fixed;
                top: 0;
                right: 0;
                width: 150px;
                height: 150px;
                pointer-events: none;
                z-index: 100;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M100,0 L0,100 M50,0 L100,50 M100,20 L20,100 M100,40 L40,100 M100,60 L60,100 M100,80 L80,100 M80,0 L100,20 M60,0 L100,40 M40,0 L100,60 M20,0 L100,80' stroke='rgba(255,255,255,0.1)' stroke-width='1' fill='none'/%3E%3C/svg%3E");
                background-size: contain;
                background-repeat: no-repeat;
                opacity: 0.5;
            `;
            document.body.appendChild(web);
        },

        /**
         * Рисует летучую мышь
         */
        drawBat: function (ctx, x, y, size, wingPhase) {
            ctx.save();
            ctx.translate(x, y);

            // Тело
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.ellipse(0, 0, size * 0.3, size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Крылья (анимированные)
            const wingSpread = Math.sin(wingPhase) * size * 0.8;

            // Левое крыло
            ctx.beginPath();
            ctx.moveTo(-size * 0.2, 0);
            ctx.quadraticCurveTo(-size * 0.8, -wingSpread, -size, size * 0.2);
            ctx.quadraticCurveTo(-size * 0.6, 0, -size * 0.2, size * 0.3);
            ctx.fill();

            // Правое крыло
            ctx.beginPath();
            ctx.moveTo(size * 0.2, 0);
            ctx.quadraticCurveTo(size * 0.8, -wingSpread, size, size * 0.2);
            ctx.quadraticCurveTo(size * 0.6, 0, size * 0.2, size * 0.3);
            ctx.fill();

            // Глаза (светятся)
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(-size * 0.1, -size * 0.1, size * 0.08, 0, Math.PI * 2);
            ctx.arc(size * 0.1, -size * 0.1, size * 0.08, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        },

        /**
         * Инициализирует летучих мышей
         */
        initBats: function () {
            this.bats = [];
            for (let i = 0; i < this.config.batCount; i++) {
                this.bats.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height * 0.5, // Только в верхней половине
                    size: 10 + Math.random() * 15,
                    speedX: (Math.random() - 0.5) * 2,
                    speedY: (Math.random() - 0.5) * 1,
                    wingPhase: Math.random() * Math.PI * 2,
                    wingSpeed: 0.1 + Math.random() * 0.1
                });
            }
        },

        /**
         * Запускает анимацию летучих мышей
         */
        startBatAnimation: function () {
            this.initBats();

            const animate = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.bats.forEach(bat => {
                    // Обновление позиции
                    bat.x += bat.speedX;
                    bat.y += bat.speedY;
                    bat.wingPhase += bat.wingSpeed;

                    // Колебание
                    bat.y += Math.sin(bat.wingPhase * 0.5) * 0.5;

                    // Сброс позиции если ушла за экран
                    if (bat.x < -50) bat.x = this.canvas.width + 50;
                    if (bat.x > this.canvas.width + 50) bat.x = -50;
                    if (bat.y < -50) bat.y = this.canvas.height * 0.5;
                    if (bat.y > this.canvas.height * 0.6) bat.y = -50;

                    // Рисуем
                    this.drawBat(this.ctx, bat.x, bat.y, bat.size, bat.wingPhase);
                });

                this.animationId = requestAnimationFrame(animate);
            };

            animate();
        },

        /**
         * Уничтожает тему
         */
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

            const banner = document.getElementById('halloween-banner');
            if (banner && banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }

            const web = document.getElementById('halloween-web');
            if (web && web.parentNode) {
                web.parentNode.removeChild(web);
            }

            window.removeEventListener('resize', () => this.resizeCanvas());

            this.bats = [];
        }
    };

    // Регистрируем тему
    if (window.SeasonalManager) {
        window.SeasonalManager.registerTheme(HalloweenTheme);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.SeasonalManager) {
                window.SeasonalManager.registerTheme(HalloweenTheme);
            }
        });
    }
})();
