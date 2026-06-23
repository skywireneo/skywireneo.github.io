// Programmer's Day Theme - День программиста (256-й день года)
// Дата: 13 сентября (12 в високосный год)

(function () {
    'use strict';

    const ProgrammerDayTheme = {
        id: 'programmer',
        name: 'День программиста',
        icon: '💻',

        // Модальное окно
        modalTitle: 'С Днём программиста! 💻',
        modalContent: '256-й день года — праздник всех, кто превращает кофе в код и идеи в реальность. Пусть ваши команды всегда выполняются без ошибок!',

        // Плавающая дата - 256-й день года
        checkDate: function (date, year) {

            if (!window.SeasonalDateUtils) return false;
            const programmerDay = window.SeasonalDateUtils.getProgrammerDayDate(year);
            const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            return checkDate.getTime() === programmerDay.getTime();
        },

        // CSS переменные - терминальный стиль
        cssVars: {
            '--accent': '#22c55e', // зелёный терминала
            '--accent-secondary': '#16a34a',
            '--bg-primary': 'rgba(0, 20, 0, 0.9)',
            '--bg-secondary': 'rgba(0, 40, 0, 0.7)',
            '--text-highlight': '#4ade80',
            '--border-color': 'rgba(34, 197, 94, 0.3)',
            '--text-primary': '#86efac',
            '--text-secondary': '#4ade80'
        },

        // Canvas для падающего кода
        canvas: null,
        ctx: null,
        animationId: null,
        codeDrops: [],

        config: {
            dropCount: 50,
            chars: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
            fontSize: 14,
            minSpeed: 1,
            maxSpeed: 3
        },

        /**
         * Инициализация темы
         */
        init: function () {
            this.createCanvas();
            this.createBanner();
            this.createTerminalEffect();
            this.startCodeRain();
        },

        /**
         * Создаёт canvas
         */
        createCanvas: function () {
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'seasonal-canvas programmer-canvas';
            this.canvas.id = 'programmer-code-rain';
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
            banner.className = 'seasonal-banner programmer-banner';
            banner.id = 'programmer-banner';
            banner.innerHTML = '💻 С Днём программиста! 0x100';
            banner.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(0, 0, 0, 0.4))';
            banner.style.border = '1px solid rgba(34, 197, 94, 0.4)';
            banner.style.color = '#22c55e';
            banner.style.fontFamily = 'monospace';

            document.body.appendChild(banner);
        },

        /**
         * Создаёт эффект терминала
         */
        createTerminalEffect: function () {
            // Добавляем scanlines
            const scanlines = document.createElement('div');
            scanlines.id = 'programmer-scanlines';
            scanlines.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 2;
                background: repeating-linear-gradient(
                    0deg,
                    rgba(0, 0, 0, 0.1),
                    rgba(0, 0, 0, 0.1) 1px,
                    transparent 1px,
                    transparent 2px
                );
                opacity: 0.3;
            `;
            document.body.appendChild(scanlines);
        },

        /**
         * Инициализирует падающий код
         */
        initCodeDrops: function () {
            this.codeDrops = [];
            const columns = Math.floor(this.canvas.width / this.config.fontSize);

            for (let i = 0; i < this.config.dropCount; i++) {
                this.codeDrops.push({
                    x: Math.floor(Math.random() * columns) * this.config.fontSize,
                    y: Math.random() * -100,
                    speed: this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed),
                    chars: [],
                    brightness: 0.5 + Math.random() * 0.5
                });

                // Заполняем начальные символы
                const dropLength = 5 + Math.floor(Math.random() * 15);
                for (let j = 0; j < dropLength; j++) {
                    this.codeDrops[i].chars.push(
                        this.config.chars[Math.floor(Math.random() * this.config.chars.length)]
                    );
                }
            }
        },

        /**
         * Запускает анимацию падающего кода
         */
        startCodeRain: function () {
            this.initCodeDrops();
            this.ctx.font = `${this.config.fontSize}px monospace`;

            const animate = () => {
                // Полупрозрачный чёрный для эффекта следа
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                this.codeDrops.forEach(drop => {
                    // Обновляем символы
                    for (let i = 0; i < drop.chars.length; i++) {
                        const char = drop.chars[i];
                        const y = drop.y - i * this.config.fontSize;

                        // Первый символ - яркий, остальные - тусклые
                        if (i === 0) {
                            this.ctx.fillStyle = `rgba(134, 239, 172, ${drop.brightness})`;
                            this.ctx.shadowBlur = 10;
                            this.ctx.shadowColor = '#22c55e';
                        } else {
                            const alpha = (1 - i / drop.chars.length) * 0.5;
                            this.ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
                            this.ctx.shadowBlur = 0;
                        }

                        this.ctx.fillText(char, drop.x, y);
                    }

                    // Сбрасываем shadow
                    this.ctx.shadowBlur = 0;

                    // Обновляем позицию
                    drop.y += drop.speed;

                    // Обновляем символы
                    if (Math.random() > 0.95) {
                        drop.chars.pop();
                        drop.chars.unshift(
                            this.config.chars[Math.floor(Math.random() * this.config.chars.length)]
                        );
                    }

                    // Сброс позиции
                    if (drop.y - drop.chars.length * this.config.fontSize > this.canvas.height) {
                        drop.y = 0;
                        drop.x = Math.floor(Math.random() * (this.canvas.width / this.config.fontSize)) * this.config.fontSize;
                    }
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

            const banner = document.getElementById('programmer-banner');
            if (banner && banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }

            const scanlines = document.getElementById('programmer-scanlines');
            if (scanlines && scanlines.parentNode) {
                scanlines.parentNode.removeChild(scanlines);
            }

            window.removeEventListener('resize', () => this.resizeCanvas());

            this.codeDrops = [];
        }
    };

    // Регистрируем тему
    if (window.SeasonalManager) {
        window.SeasonalManager.registerTheme(ProgrammerDayTheme);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.SeasonalManager) {
                window.SeasonalManager.registerTheme(ProgrammerDayTheme);
            }
        });
    }
})();
