// Site Birthday Theme - День рождения сайта
// Дата: 5 августа

(function () {
    'use strict';

    const SiteBirthdayTheme = {
        id: 'site-birthday',
        name: 'День рождения сайта',
        icon: '🎂',

        // Модальное окно
        modalTitle: 'С Днём рождения сайта! 🎂',
        modalContent: 'Сегодня наш сайт празднует свой день рождения! Спасибо, что вы с нами. Пусть этот проект продолжает развиваться и приносить пользу!',

        // Конкретная дата
        specificDate: '08-05',


        // CSS переменные - праздничные цвета
        cssVars: {
            '--accent': '#f59e0b', // оранжевый
            '--accent-secondary': '#ec4899', // розовый
            '--bg-primary': 'rgba(15, 23, 42, 0.8)',
            '--bg-secondary': 'rgba(30, 41, 59, 0.6)',
            '--text-highlight': '#fbbf24',
            '--border-color': 'rgba(245, 158, 11, 0.3)'
        },

        // Canvas для конфетти
        canvas: null,
        ctx: null,
        animationId: null,
        confetti: [],

        config: {
            confettiCount: 150,
            colors: ['#f59e0b', '#ec4899', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#fbbf24'],
            gravity: 0.5,
            drag: 0.96
        },

        /**
         * Инициализация темы
         */
        init: function () {
            this.createCanvas();
            this.createBanner();
            this.createCakeDecoration();
            this.startConfetti();
        },

        /**
         * Создаёт canvas
         */
        createCanvas: function () {
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'seasonal-canvas site-birthday-canvas';
            this.canvas.id = 'site-birthday-confetti';
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
            banner.className = 'seasonal-banner site-birthday-banner';
            banner.id = 'site-birthday-banner';

            // Вычисляем возраст сайта
            const birthYear = 2024; // Предполагаем, что сайт создан в 2024
            const currentYear = new Date().getFullYear();
            const age = currentYear - birthYear;
            const ageText = age === 0 ? 'Первый день рождения!' : `${age} ${this.getAgeWord(age)}!`;

            banner.innerHTML = `🎂 ${ageText} 🎉`;
            banner.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(236, 72, 153, 0.2))';
            banner.style.border = '1px solid rgba(245, 158, 11, 0.4)';
            banner.style.color = '#fbbf24';

            document.body.appendChild(banner);
        },

        /**
         * Возвращает правильное слово для возраста
         */
        getAgeWord: function (age) {
            const lastDigit = age % 10;
            const lastTwoDigits = age % 100;

            if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'лет';
            if (lastDigit === 1) return 'год';
            if (lastDigit >= 2 && lastDigit <= 4) return 'года';
            return 'лет';
        },

        /**
         * Создаёт декорацию с тортом
         */
        createCakeDecoration: function () {
            const cake = document.createElement('div');
            cake.id = 'site-birthday-cake';
            cake.innerHTML = '🎂';
            cake.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                font-size: 3rem;
                z-index: 100;
                animation: cakeBounce 2s ease-in-out infinite;
                pointer-events: none;
                filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.5));
            `;

            // Добавляем keyframes если их нет
            if (!document.getElementById('site-birthday-animations')) {
                const style = document.createElement('style');
                style.id = 'site-birthday-animations';
                style.textContent = `
                    @keyframes cakeBounce {
                        0%, 100% { transform: translateY(0) scale(1); }
                        50% { transform: translateY(-10px) scale(1.1); }
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(cake);
        },

        /**
         * Создаёт частицу конфетти
         */
        createConfettiPiece: function () {
            return {
                x: Math.random() * this.canvas.width,
                y: -20,
                size: 5 + Math.random() * 10,
                color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
                speedY: 2 + Math.random() * 3,
                speedX: (Math.random() - 0.5) * 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                oscillation: Math.random() * Math.PI * 2,
                oscillationSpeed: 0.02 + Math.random() * 0.03
            };
        },

        /**
         * Инициализирует конфетти
         */
        initConfetti: function () {
            this.confetti = [];
            for (let i = 0; i < this.config.confettiCount; i++) {
                const piece = this.createConfettiPiece();
                // Разбрасываем начальные позиции
                piece.y = Math.random() * this.canvas.height;
                this.confetti.push(piece);
            }
        },

        /**
         * Рисует частицу конфетти
         */
        drawConfettiPiece: function (ctx, piece) {
            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate((piece.rotation * Math.PI) / 180);

            // Рисуем прямоугольник (конфетти)
            ctx.fillStyle = piece.color;
            ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size / 2);

            ctx.restore();
        },

        /**
         * Запускает анимацию конфетти
         */
        startConfetti: function () {
            this.initConfetti();

            const animate = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.confetti.forEach(piece => {
                    // Обновление позиции
                    piece.y += piece.speedY;
                    piece.x += piece.speedX + Math.sin(piece.oscillation) * 2;
                    piece.rotation += piece.rotationSpeed;
                    piece.oscillation += piece.oscillationSpeed;

                    // Сброс позиции если ушла за экран
                    if (piece.y > this.canvas.height + 20) {
                        Object.assign(piece, this.createConfettiPiece());
                    }
                    if (piece.x > this.canvas.width) {
                        piece.x = 0;
                    } else if (piece.x < 0) {
                        piece.x = this.canvas.width;
                    }

                    // Рисуем
                    this.drawConfettiPiece(this.ctx, piece);
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

            const banner = document.getElementById('site-birthday-banner');
            if (banner && banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }

            const cake = document.getElementById('site-birthday-cake');
            if (cake && cake.parentNode) {
                cake.parentNode.removeChild(cake);
            }

            const animations = document.getElementById('site-birthday-animations');
            if (animations && animations.parentNode) {
                animations.parentNode.removeChild(animations);
            }

            window.removeEventListener('resize', () => this.resizeCanvas());

            this.confetti = [];
        }
    };

    // Регистрируем тему
    if (window.SeasonalManager) {
        window.SeasonalManager.registerTheme(SiteBirthdayTheme);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.SeasonalManager) {
                window.SeasonalManager.registerTheme(SiteBirthdayTheme);
            }
        });
    }
})();
