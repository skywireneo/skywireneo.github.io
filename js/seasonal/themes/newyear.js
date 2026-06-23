// New Year Theme - Новогоднее оформление
// Период: 20 декабря - 15 января

(function () {
    'use strict';

    const NewYearTheme = {
        id: 'newyear',
        name: 'Новый год',
        icon: '🎄',

        // Модальное окно
        modalTitle: 'С Новым годом! 🎄',
        modalContent: 'Пусть этот год принесёт новые возможности, интересные проекты и яркие достижения! Желаю кода без багов и деплоя без проблем!',

        // Диапазон дат
        dateRange: {

            start: '12-20',
            end: '01-15'
        },

        // CSS переменные для переопределения
        cssVars: {
            '--accent': '#fbbf24', // золотой
            '--accent-secondary': '#3b82f6', // синий
            '--bg-primary': 'rgba(15, 23, 42, 0.8)',
            '--bg-secondary': 'rgba(30, 41, 59, 0.6)',
            '--text-highlight': '#fbbf24',
            '--border-color': 'rgba(251, 191, 36, 0.3)'
        },

        // Canvas для снежинок
        canvas: null,
        ctx: null,
        animationId: null,
        snowflakes: [],

        // Конфигурация снежинок
        config: {
            snowflakeCount: 100,
            minSize: 2,
            maxSize: 6,
            minSpeed: 0.5,
            maxSpeed: 2,
            wind: 0.5
        },

        /**
         * Инициализация темы
         */
        init: function () {
            this.createCanvas();
            this.createGarland();
            this.createBanner();
            this.startSnowfall();
        },

        /**
         * Создаёт canvas для снежинок
         */
        createCanvas: function () {
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'seasonal-canvas newyear-canvas';
            this.canvas.id = 'newyear-snow';
            this.ctx = this.canvas.getContext('2d');

            this.resizeCanvas();
            document.body.appendChild(this.canvas);

            // Обработчик изменения размера
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
         * Создаёт гирлянду
         */
        createGarland: function () {
            const garland = document.createElement('div');
            garland.className = 'seasonal-garland newyear-garland';
            garland.id = 'newyear-garland';

            // Добавляем мигающие огни
            const colors = ['#ef4444', '#3b82f6', '#22c55e', '#fbbf24', '#ec4899', '#8b5cf6'];
            for (let i = 0; i < 20; i++) {
                const light = document.createElement('div');
                light.className = 'seasonal-light';
                light.style.left = `${5 + i * 5}%`;
                light.style.top = '15px';
                light.style.backgroundColor = colors[i % colors.length];
                light.style.animationDelay = `${i * 0.1}s`;
                garland.appendChild(light);
            }

            document.body.appendChild(garland);
        },

        /**
         * Создаёт баннер
         */
        createBanner: function () {
            const banner = document.createElement('div');
            banner.className = 'seasonal-banner newyear-banner';
            banner.id = 'newyear-banner';
            banner.innerHTML = '🎄 С Новым годом! 🎅';
            banner.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(59, 130, 246, 0.2))';
            banner.style.border = '1px solid rgba(251, 191, 36, 0.3)';
            banner.style.color = '#fbbf24';

            document.body.appendChild(banner);
        },

        /**
         * Инициализирует снежинки
         */
        initSnowflakes: function () {
            this.snowflakes = [];
            for (let i = 0; i < this.config.snowflakeCount; i++) {
                this.snowflakes.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: this.config.minSize + Math.random() * (this.config.maxSize - this.config.minSize),
                    speed: this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed),
                    opacity: 0.3 + Math.random() * 0.7,
                    sway: Math.random() * Math.PI * 2
                });
            }
        },

        /**
         * Запускает анимацию снегопада
         */
        startSnowfall: function () {
            this.initSnowflakes();

            const animate = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.snowflakes.forEach(flake => {
                    // Обновление позиции
                    flake.y += flake.speed;
                    flake.sway += 0.02;
                    flake.x += Math.sin(flake.sway) * 0.5 + this.config.wind;

                    // Сброс позиции если ушла за экран
                    if (flake.y > this.canvas.height) {
                        flake.y = -10;
                        flake.x = Math.random() * this.canvas.width;
                    }
                    if (flake.x > this.canvas.width) {
                        flake.x = 0;
                    } else if (flake.x < 0) {
                        flake.x = this.canvas.width;
                    }

                    // Рисуем снежинку
                    this.ctx.beginPath();
                    this.ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
                    this.ctx.fill();

                    // Добавляем блик
                    this.ctx.beginPath();
                    this.ctx.arc(flake.x - flake.size * 0.3, flake.y - flake.size * 0.3, flake.size * 0.2, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.8})`;
                    this.ctx.fill();
                });

                this.animationId = requestAnimationFrame(animate);
            };

            animate();
        },

        /**
         * Уничтожает тему
         */
        destroy: function () {
            // Останавливаем анимацию
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }

            // Удаляем canvas
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
                this.canvas = null;
                this.ctx = null;
            }

            // Удаляем гирлянду
            const garland = document.getElementById('newyear-garland');
            if (garland && garland.parentNode) {
                garland.parentNode.removeChild(garland);
            }

            // Удаляем баннер
            const banner = document.getElementById('newyear-banner');
            if (banner && banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }

            // Удаляем обработчик resize
            window.removeEventListener('resize', () => this.resizeCanvas());

            this.snowflakes = [];
        }
    };

    // Регистрируем тему
    if (window.SeasonalManager) {
        window.SeasonalManager.registerTheme(NewYearTheme);
    } else {
        // Если менеджер ещё не загружен, ждём
        window.addEventListener('DOMContentLoaded', () => {
            if (window.SeasonalManager) {
                window.SeasonalManager.registerTheme(NewYearTheme);
            }
        });
    }
})();
