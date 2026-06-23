// Women's Day Theme - 8 марта
// Дата: 8 марта

(function () {
    'use strict';

    const WomenDayTheme = {
        id: 'women-day',
        name: '8 марта',
        icon: '🌸',

        // Модальное окно
        modalTitle: 'С 8 марта! 🌸',
        modalContent: 'В этот весенний день желаю вдохновения, радости и прекрасного настроения. Пусть каждый день приносит новые возможности и приятные сюрпризы!',

        // Конкретная дата
        specificDate: '03-08',


        // CSS переменные - весенние/нежные
        cssVars: {
            '--accent': '#ec4899', // розовый
            '--accent-secondary': '#f472b6', // светло-розовый
            '--bg-primary': 'rgba(15, 23, 42, 0.8)',
            '--bg-secondary': 'rgba(30, 41, 59, 0.6)',
            '--text-highlight': '#f472b6',
            '--border-color': 'rgba(236, 72, 153, 0.3)'
        },

        // Canvas для лепестков
        canvas: null,
        ctx: null,
        animationId: null,
        petals: [],

        config: {
            petalCount: 60,
            minSize: 5,
            maxSize: 15,
            minSpeed: 0.5,
            maxSpeed: 2
        },

        /**
         * Инициализация темы
         */
        init: function () {
            this.createCanvas();
            this.createBanner();
            this.createFlowerDecoration();
            this.startPetalAnimation();
        },

        /**
         * Создаёт canvas
         */
        createCanvas: function () {
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'seasonal-canvas women-day-canvas';
            this.canvas.id = 'women-day-petals';
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
            banner.className = 'seasonal-banner women-day-banner';
            banner.id = 'women-day-banner';
            banner.innerHTML = '🌸 С 8 марта! 🌷';
            banner.style.background = 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(244, 114, 182, 0.2))';
            banner.style.border = '1px solid rgba(236, 72, 153, 0.4)';
            banner.style.color = '#ec4899';

            document.body.appendChild(banner);
        },

        /**
         * Создаёт декорацию с цветами
         */
        createFlowerDecoration: function () {
            const flower = document.createElement('div');
            flower.id = 'women-day-flower';
            flower.innerHTML = '🌷';
            flower.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                font-size: 3rem;
                z-index: 100;
                animation: flowerSway 3s ease-in-out infinite;
                pointer-events: none;
                filter: drop-shadow(0 0 10px rgba(236, 72, 153, 0.3));
            `;

            // Добавляем keyframes
            if (!document.getElementById('women-day-animations')) {
                const style = document.createElement('style');
                style.id = 'women-day-animations';
                style.textContent = `
                    @keyframes flowerSway {
                        0%, 100% { transform: rotate(-5deg); }
                        50% { transform: rotate(5deg); }
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(flower);
        },

        /**
         * Рисует лепесток
         */
        drawPetal: function (ctx, x, y, size, rotation, color) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        },

        /**
         * Инициализирует лепестки
         */
        initPetals: function () {
            this.petals = [];
            const colors = ['#fbcfe8', '#f9a8d4', '#f472b6', '#fda4af', '#fce7f3'];

            for (let i = 0; i < this.config.petalCount; i++) {
                this.petals.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * -100,
                    size: this.config.minSize + Math.random() * (this.config.maxSize - this.config.minSize),
                    speed: this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed),
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.05,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    sway: Math.random() * Math.PI * 2,
                    swaySpeed: 0.01 + Math.random() * 0.02
                });
            }
        },

        /**
         * Запускает анимацию лепестков
         */
        startPetalAnimation: function () {
            this.initPetals();

            const animate = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.petals.forEach(petal => {
                    // Обновление позиции
                    petal.y += petal.speed;
                    petal.rotation += petal.rotationSpeed;
                    petal.sway += petal.swaySpeed;
                    petal.x += Math.sin(petal.sway) * 0.5;

                    // Сброс позиции если ушла за экран
                    if (petal.y > this.canvas.height + 20) {
                        petal.y = -20;
                        petal.x = Math.random() * this.canvas.width;
                    }
                    if (petal.x > this.canvas.width) {
                        petal.x = 0;
                    } else if (petal.x < 0) {
                        petal.x = this.canvas.width;
                    }

                    // Рисуем
                    this.drawPetal(this.ctx, petal.x, petal.y, petal.size, petal.rotation, petal.color);
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

            const banner = document.getElementById('women-day-banner');
            if (banner && banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }

            const flower = document.getElementById('women-day-flower');
            if (flower && flower.parentNode) {
                flower.parentNode.removeChild(flower);
            }

            const animations = document.getElementById('women-day-animations');
            if (animations && animations.parentNode) {
                animations.parentNode.removeChild(animations);
            }

            window.removeEventListener('resize', () => this.resizeCanvas());

            this.petals = [];
        }
    };

    // Регистрируем тему
    if (window.SeasonalManager) {
        window.SeasonalManager.registerTheme(WomenDayTheme);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.SeasonalManager) {
                window.SeasonalManager.registerTheme(WomenDayTheme);
            }
        });
    }
})();
