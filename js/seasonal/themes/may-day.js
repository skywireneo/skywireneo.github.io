// May Day Theme - 1 мая
(function () {
    'use strict';

    const MayDayTheme = {
        id: 'may-day',
        name: '1 мая',
        icon: '🌸',

        // Модальное окно
        modalTitle: 'С 1 мая! 🌸',
        modalContent: 'Праздник Весны и Труда — время цветения, новых начинаний и достижений. Пусть ваш труд приносит радость и плодотворные результаты!',

        specificDate: '05-01',


        cssVars: {
            '--accent': '#ec4899',
            '--accent-secondary': '#22c55e',
            '--text-highlight': '#f472b6'
        },

        init: function () {
            this.createBanner();
            this.createFlowerBouquet();
            this.createButterflies();
            this.createFallingPetals();
            this.createBee();
        },

        createBanner: function () {
            const banner = document.createElement('div');
            banner.className = 'seasonal-banner may-day-banner';
            banner.id = 'may-day-banner';
            banner.innerHTML = '🌸 С 1 мая! 🌷';
            banner.style.cssText = `
                background: linear-gradient(135deg, rgba(236,72,153,0.2), rgba(34,197,94,0.2)) !important;
                border: 1px solid rgba(236,72,153,0.4) !important;
                color: #f472b6 !important;
            `;
            document.body.appendChild(banner);
        },

        createFlowerBouquet: function () {
            const bouquet = document.createElement('div');
            bouquet.id = 'may-day-bouquet';
            bouquet.innerHTML = '💐';
            bouquet.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                font-size: 3rem;
                z-index: 100;
                animation: bouquetSway 3s ease-in-out infinite;
                pointer-events: none;
                filter: drop-shadow(0 0 15px rgba(236, 72, 153, 0.4));
            `;
            document.body.appendChild(bouquet);
        },

        createButterflies: function () {
            const container = document.createElement('div');
            container.id = 'may-day-butterflies';
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

            const butterflies = ['🦋', '🐛', '🐝'];

            for (let i = 0; i < 6; i++) {
                const butterfly = document.createElement('div');
                butterfly.innerHTML = butterflies[Math.floor(Math.random() * butterflies.length)];
                butterfly.style.cssText = `
                    position: absolute;
                    font-size: ${1.5 + Math.random()}rem;
                    left: ${10 + Math.random() * 80}%;
                    top: ${20 + Math.random() * 60}%;
                    animation: butterflyFly ${8 + Math.random() * 6}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 5}s;
                    opacity: ${0.7 + Math.random() * 0.3};
                `;
                container.appendChild(butterfly);
            }

            document.body.appendChild(container);
        },

        createFallingPetals: function () {
            const container = document.createElement('div');
            container.id = 'may-day-petals';
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

            const petals = ['🌸', '🌺', '🌷', '🌹', '🌻', '🌼'];
            const colors = ['#ec4899', '#f472b6', '#fb7185', '#fda4af', '#f9a8d4'];

            for (let i = 0; i < 20; i++) {
                const petal = document.createElement('div');
                petal.innerHTML = petals[Math.floor(Math.random() * petals.length)];
                petal.style.cssText = `
                    position: absolute;
                    font-size: ${0.8 + Math.random() * 0.7}rem;
                    left: ${Math.random() * 100}%;
                    top: -30px;
                    color: ${colors[Math.floor(Math.random() * colors.length)]};
                    animation: petalFall ${8 + Math.random() * 6}s linear infinite;
                    animation-delay: ${Math.random() * 8}s;
                    opacity: ${0.5 + Math.random() * 0.5};
                `;
                container.appendChild(petal);
            }

            document.body.appendChild(container);
        },

        createBee: function () {
            const bee = document.createElement('div');
            bee.id = 'may-day-bee';
            bee.innerHTML = '🐝';
            bee.style.cssText = `
                position: fixed;
                top: 100px;
                left: 50px;
                font-size: 1.8rem;
                z-index: 100;
                animation: beeBuzz 4s ease-in-out infinite;
                pointer-events: none;
                filter: drop-shadow(0 0 5px rgba(234, 179, 8, 0.5));
            `;
            document.body.appendChild(bee);
        },

        destroy: function () {
            const banner = document.getElementById('may-day-banner');
            if (banner) banner.remove();

            const bouquet = document.getElementById('may-day-bouquet');
            if (bouquet) bouquet.remove();

            const butterflies = document.getElementById('may-day-butterflies');
            if (butterflies) butterflies.remove();

            const petals = document.getElementById('may-day-petals');
            if (petals) petals.remove();

            const bee = document.getElementById('may-day-bee');
            if (bee) bee.remove();
        }

    };

    if (window.SeasonalManager) {
        window.SeasonalManager.registerTheme(MayDayTheme);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.SeasonalManager) window.SeasonalManager.registerTheme(MayDayTheme);
        });
    }
})();
