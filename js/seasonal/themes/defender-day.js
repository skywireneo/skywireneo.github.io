// Defender of the Fatherland Day Theme - 23 февраля
// Дата: 23 февраля

(function () {
    'use strict';

    const DefenderDayTheme = {
        id: 'defender-day',
        name: '23 февраля',
        icon: '🎖️',

        // Модальное окно
        modalTitle: 'С 23 февраля! 🎖️',
        modalContent: 'День защитника Отечества — праздник мужества, силы и отваги. Пусть в вашей жизни всегда будет место для настоящих подвигов и великих дел!',

        specificDate: '02-23',


        cssVars: {
            '--accent': '#22c55e',
            '--accent-secondary': '#166534',
            '--bg-primary': 'rgba(15, 23, 42, 0.8)',
            '--bg-secondary': 'rgba(30, 41, 59, 0.6)',
            '--text-highlight': '#4ade80',
            '--border-color': 'rgba(34, 197, 94, 0.3)'
        },

        init: function () {
            this.createBanner();
            this.createMedalDecoration();
            this.createGeorgianRibbon();
            this.createTankDecoration();
            this.createPlaneDecoration();
            this.createFireworks();
        },

        createBanner: function () {
            const banner = document.createElement('div');
            banner.className = 'seasonal-banner defender-day-banner';
            banner.id = 'defender-day-banner';
            banner.innerHTML = '🎖️ С 23 февраля! ⚔️';
            banner.style.cssText = `
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 101, 52, 0.2)) !important;
                border: 1px solid rgba(34, 197, 94, 0.4) !important;
                color: #4ade80 !important;
            `;
            document.body.appendChild(banner);
        },

        createMedalDecoration: function () {
            const medal = document.createElement('div');
            medal.id = 'defender-day-medal';
            medal.innerHTML = '🎖️';
            medal.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                font-size: 2.5rem;
                z-index: 100;
                animation: medalShine 3s ease-in-out infinite;
                pointer-events: none;
                filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.5));
            `;
            document.body.appendChild(medal);
        },

        createGeorgianRibbon: function () {
            const ribbon = document.createElement('div');
            ribbon.id = 'defender-day-ribbon';
            ribbon.innerHTML = '🎀';
            ribbon.style.cssText = `
                position: fixed;
                top: 80px;
                left: 20px;
                font-size: 2rem;
                z-index: 100;
                animation: ribbonWave 2s ease-in-out infinite;
                pointer-events: none;
                filter: drop-shadow(0 0 8px rgba(255, 0, 0, 0.4));
            `;
            document.body.appendChild(ribbon);
        },

        createTankDecoration: function () {
            const tank = document.createElement('div');
            tank.id = 'defender-day-tank';
            tank.innerHTML = '⬛⬛⬛<br>⬛🟨⬛<br>⬛⬛⬛';
            tank.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: -100px;
                font-size: 1.5rem;
                z-index: 99;
                animation: tankMove 15s linear infinite;
                pointer-events: none;
                opacity: 0.6;
            `;
            document.body.appendChild(tank);
        },

        createPlaneDecoration: function () {
            const plane = document.createElement('div');
            plane.id = 'defender-day-plane';
            plane.innerHTML = '✈️';
            plane.style.cssText = `
                position: fixed;
                top: 150px;
                right: -50px;
                font-size: 2rem;
                z-index: 99;
                animation: planeFly 12s linear infinite;
                pointer-events: none;
                opacity: 0.7;
            `;
            document.body.appendChild(plane);
        },

        createFireworks: function () {
            const container = document.createElement('div');
            container.id = 'defender-day-fireworks';
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

            for (let i = 0; i < 5; i++) {
                const firework = document.createElement('div');
                firework.innerHTML = '✦';
                firework.style.cssText = `
                    position: absolute;
                    font-size: ${1 + Math.random()}rem;
                    color: #22c55e;
                    left: ${10 + Math.random() * 80}%;
                    top: ${10 + Math.random() * 40}%;
                    animation: fireworkPop ${2 + Math.random() * 2}s ease-out infinite;
                    animation-delay: ${Math.random() * 3}s;
                    opacity: 0;
                `;
                container.appendChild(firework);
            }

            document.body.appendChild(container);
        },


        destroy: function () {
            const banner = document.getElementById('defender-day-banner');
            if (banner) banner.remove();

            const medal = document.getElementById('defender-day-medal');
            if (medal) medal.remove();

            const ribbon = document.getElementById('defender-day-ribbon');
            if (ribbon) ribbon.remove();

            const tank = document.getElementById('defender-day-tank');
            if (tank) tank.remove();

            const plane = document.getElementById('defender-day-plane');
            if (plane) plane.remove();

            const fireworks = document.getElementById('defender-day-fireworks');
            if (fireworks) fireworks.remove();
        }

    };

    if (window.SeasonalManager) {
        window.SeasonalManager.registerTheme(DefenderDayTheme);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.SeasonalManager) window.SeasonalManager.registerTheme(DefenderDayTheme);
        });
    }
})();
