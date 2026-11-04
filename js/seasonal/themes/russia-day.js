// Russia Day Theme - 12 июня
(function () {
    'use strict';

    const RussiaDayTheme = {
        id: 'russia-day',
        name: 'День России',
        icon: '🇷🇺',

        // Модальное окно
        modalTitle: 'С Днём России! 🇷🇺',
        modalContent: 'День России — праздник нашей великой страны, её истории, культуры и достижений. Гордимся прошлым и строим будущее вместе!',

        specificDate: '06-12',


        cssVars: {
            '--accent': '#3b82f6',
            '--accent-secondary': '#ef4444',
            '--text-highlight': '#60a5fa'
        },

        init: function () {
            this.createBanner();
            this.createFlags();
            this.createBalloons();
            this.createConfetti();
        },

        createBanner: function () {
            const banner = document.createElement('div');
            banner.className = 'seasonal-banner russia-day-banner';
            banner.id = 'russia-day-banner';
            banner.innerHTML = '🇷🇺 С Днём России! 🇷🇺';
            banner.style.cssText = `
                background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(59,130,246,0.2), rgba(239,68,68,0.2)) !important;
                border: 1px solid rgba(59,130,246,0.4) !important;
                color: #60a5fa !important;
            `;
            document.body.appendChild(banner);
        },

        createFlags: function () {
            // Создаём несколько флагов в разных местах
            const positions = [
                { top: '60px', right: '20px', size: '40px' },
                { top: '150px', left: '30px', size: '30px' },
                { bottom: '100px', right: '50px', size: '35px' },
                { bottom: '200px', left: '20px', size: '25px' }
            ];

            positions.forEach((pos, index) => {
                const flag = document.createElement('div');
                flag.id = `russia-day-flag-${index}`;
                flag.className = 'russia-day-flag';
                flag.style.cssText = `
                    position: fixed;
                    width: ${pos.size};
                    height: calc(${pos.size} * 0.75);
                    background: linear-gradient(to bottom, #fff 33%, #0055ff 33%, #0055ff 66%, #ff0000 66%);
                    z-index: 100;
                    border-radius: 3px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    pointer-events: none;
                    animation: flagWave 2s ease-in-out infinite;
                    animation-delay: ${index * 0.3}s;
                    ${pos.top ? `top: ${pos.top};` : ''}
                    ${pos.bottom ? `bottom: ${pos.bottom};` : ''}
                    ${pos.left ? `left: ${pos.left};` : ''}
                    ${pos.right ? `right: ${pos.right};` : ''}
                `;
                document.body.appendChild(flag);
            });
        },

        createBalloons: function () {
            const container = document.createElement('div');
            container.id = 'russia-day-balloons';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 2;
                overflow: hidden;
            `;

            const colors = ['#ffffff', '#0055ff', '#ff0000'];

            for (let i = 0; i < 8; i++) {
                const balloon = document.createElement('div');
                balloon.innerHTML = '🎈';
                balloon.style.cssText = `
                    position: absolute;
                    font-size: ${1.5 + Math.random()}rem;
                    left: ${10 + Math.random() * 80}%;
                    bottom: -50px;
                    animation: balloonFloat ${8 + Math.random() * 6}s linear infinite;
                    animation-delay: ${Math.random() * 5}s;
                    filter: hue-rotate(${Math.random() * 30}deg);
                `;
                container.appendChild(balloon);
            }

            document.body.appendChild(container);
        },

        createConfetti: function () {
            const container = document.createElement('div');
            container.id = 'russia-day-confetti';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
                overflow: hidden;
            `;

            const colors = ['#ffffff', '#0055ff', '#ff0000', '#ffd700'];

            for (let i = 0; i < 30; i++) {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: absolute;
                    width: ${5 + Math.random() * 5}px;
                    height: ${5 + Math.random() * 5}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}%;
                    top: -10px;
                    animation: confettiFall ${5 + Math.random() * 5}s linear infinite;
                    animation-delay: ${Math.random() * 5}s;
                    opacity: ${0.5 + Math.random() * 0.5};
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                `;
                container.appendChild(confetti);
            }

            document.body.appendChild(container);
        },

        destroy: function () {
            const banner = document.getElementById('russia-day-banner');
            if (banner) banner.remove();

            // Удаляем все флаги
            document.querySelectorAll('.russia-day-flag').forEach(flag => flag.remove());

            const balloons = document.getElementById('russia-day-balloons');
            if (balloons) balloons.remove();

            const confetti = document.getElementById('russia-day-confetti');
            if (confetti) confetti.remove();
        }

    };

    if (window.SeasonalManager) {
        window.SeasonalManager.registerTheme(RussiaDayTheme);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.SeasonalManager) window.SeasonalManager.registerTheme(RussiaDayTheme);
        });
    }
})();
