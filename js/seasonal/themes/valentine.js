// Valentine Theme - День Святого Валентина
// Дата: 14 февраля

(function () {
    'use strict';

    const ValentineTheme = {
        id: 'valentine',
        name: 'День влюблённых',
        icon: '💕',

        // Модальное окно
        modalTitle: 'С Днём Святого Валентина! 💕',
        modalContent: 'Пусть этот день наполнит вашу жизнь теплом, любовью и нежностью. Цените своих близких и дарите им улыбки!',

        // Конкретная дата
        specificDate: '02-14',


        // CSS переменные
        cssVars: {
            '--accent': '#ec4899', // розовый
            '--accent-secondary': '#f43f5e', // красный
            '--bg-primary': 'rgba(15, 23, 42, 0.8)',
            '--bg-secondary': 'rgba(30, 41, 59, 0.6)',
            '--text-highlight': '#ec4899',
            '--border-color': 'rgba(236, 72, 153, 0.3)'
        },

        // Canvas для сердечек
        canvas: null,
        ctx: null,
        animationId: null,
        hearts: [],

        config: {
            heartCount: 50,
            minSize: 10,
            maxSize: 25,
            minSpeed: 0.3,
            maxSpeed: 1.5
        },

        /**
         * Инициализация темы
         */
        init: function () {
            this.createCanvas();
            this.createBanner();
            this.startHeartAnimation();
        },

        /**
         * Создаёт canvas
         */
        createCanvas: function () {
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'seasonal-canvas valentine-canvas';
            this.canvas.id = 'valentine-hearts';
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
            banner.className = 'seasonal-banner valentine-banner';
            banner.id = 'valentine-banner';
            banner.innerHTML = '💕 С Днём Святого Валентина! 💕';
            banner.style.background = 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(244, 63, 94, 0.2))';
            banner.style.border = '1px solid rgba(236, 72, 153, 0.3)';
            banner.style.color = '#ec4899';

            document.body.appendChild(banner);
        },

        /**
         * Рисует сердечко
         */
        drawHeart: function (ctx, x, y, size, color) {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(size / 20, size / 20);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-10, -10, -20, 5, 0, 20);
            ctx.bezierCurveTo(20, 5, 10, -10, 0, 0);
            ctx.fillStyle = color;
            ctx.fill();

            ctx.restore();
        },

        /**
         * Инициализирует сердечки
         */
        initHearts: function () {
            this.hearts = [];
            const colors = ['#ec4899', '#f43f5e', '#fda4af', '#fb7185', '#e11d48'];

            for (let i = 0; i < this.config.heartCount; i++) {
                this.hearts.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: this.config.minSize + Math.random() * (this.config.maxSize - this.config.minSize),
                    speed: this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed),
                    opacity: 0.3 + Math.random() * 0.7,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    sway: Math.random() * Math.PI * 2,
                    swaySpeed: 0.01 + Math.random() * 0.02
                });
            }
        },

        /**
         * Запускает анимацию сердечек
         */
        startHeartAnimation: function () {
            this.initHearts();

            const animate = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.hearts.forEach(heart => {
                    // Обновление позиции
                    heart.y -= heart.speed; // Сердечки плывут вверх
                    heart.sway += heart.swaySpeed;
                    heart.x += Math.sin(heart.sway) * 0.5;

                    // Сброс позиции если ушла за экран
                    if (heart.y < -30) {
                        heart.y = this.canvas.height + 30;
                        heart.x = Math.random() * this.canvas.width;
                    }
                    if (heart.x > this.canvas.width) {
                        heart.x = 0;
                    } else if (heart.x < 0) {
                        heart.x = this.canvas.width;
                    }

                    // Рисуем сердечко
                    this.ctx.globalAlpha = heart.opacity;
                    this.drawHeart(this.ctx, heart.x, heart.y, heart.size, heart.color);
                });

                this.ctx.globalAlpha = 1;
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

            const banner = document.getElementById('valentine-banner');
            if (banner && banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }

            window.removeEventListener('resize', () => this.resizeCanvas());

            this.hearts = [];
        }
    };

    // Регистрируем тему
    if (window.SeasonalManager) {
        window.SeasonalManager.registerTheme(ValentineTheme);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.SeasonalManager) {
                window.SeasonalManager.registerTheme(ValentineTheme);
            }
        });
    }
})();
