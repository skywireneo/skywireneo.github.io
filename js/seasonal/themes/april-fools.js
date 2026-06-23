// April Fools Theme - 1 апреля
(function () {
    'use strict';

    const AprilFoolsTheme = {
        id: 'april-fools',
        name: '1 апреля',
        icon: '🤡',

        // Модальное окно
        modalTitle: 'С 1 апреля! 🤡',
        modalContent: 'Смейтесь, шутите и радуйтесь жизни! Но помните: лучшие розыгрыши — те, после которых все смеются вместе. С праздником юмора!',

        specificDate: '04-01',


        cssVars: {
            '--accent': '#eab308',
            '--accent-secondary': '#ec4899',
            '--text-highlight': '#facc15'
        },

        init: function () {
            this.createBanner();
            this.createClownFace();
            this.createJokeBubbles();
            this.createRotatingElements();
            this.createConfetti();
        },

        createBanner: function () {
            const banner = document.createElement('div');
            banner.className = 'seasonal-banner april-fools-banner';
            banner.id = 'april-fools-banner';
            banner.innerHTML = '🤡 С 1 апреля! 🎪';
            banner.style.cssText = `
                background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(236, 72, 153, 0.2)) !important;
                border: 1px solid rgba(234, 179, 8, 0.4) !important;
                color: #facc15 !important;
            `;
            document.body.appendChild(banner);
        },

        createClownFace: function () {
            const clown = document.createElement('div');
            clown.id = 'april-fools-clown';
            clown.innerHTML = '🤡';
            clown.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                font-size: 3rem;
                z-index: 100;
                animation: clownBounce 2s ease-in-out infinite;
                pointer-events: none;
                filter: drop-shadow(0 0 15px rgba(234, 179, 8, 0.5));
            `;
            document.body.appendChild(clown);
        },

        createJokeBubbles: function () {
            const container = document.createElement('div');
            container.id = 'april-fools-bubbles';
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

            const jokes = ['😂', '🤣', '🎭', '🃏', '🎪', '🎈', '🎉'];

            for (let i = 0; i < 10; i++) {
                const bubble = document.createElement('div');
                bubble.innerHTML = jokes[Math.floor(Math.random() * jokes.length)];
                bubble.style.cssText = `
                    position: absolute;
                    font-size: ${1.5 + Math.random()}rem;
                    left: ${10 + Math.random() * 80}%;
                    bottom: -50px;
                    animation: bubbleFloat ${5 + Math.random() * 5}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 5}s;
                    opacity: ${0.6 + Math.random() * 0.4};
                `;
                container.appendChild(bubble);
            }

            document.body.appendChild(container);
        },

        createRotatingElements: function () {
            const elements = ['🎪', '🎭', '🃏', '🎈'];
            const positions = [
                { top: '100px', left: '30px' },
                { top: '200px', right: '40px' },
                { bottom: '150px', left: '50px' },
                { top: '300px', right: '60px' }
            ];

            positions.forEach((pos, index) => {
                const el = document.createElement('div');
                el.className = 'april-fools-rotating';
                el.innerHTML = elements[index % elements.length];
                el.style.cssText = `
                    position: fixed;
                    font-size: 2rem;
                    z-index: 100;
                    pointer-events: none;
                    animation: rotateElement ${3 + index}s linear infinite;
                    ${pos.top ? `top: ${pos.top};` : ''}
                    ${pos.bottom ? `bottom: ${pos.bottom};` : ''}
                    ${pos.left ? `left: ${pos.left};` : ''}
                    ${pos.right ? `right: ${pos.right};` : ''}
                `;
                document.body.appendChild(el);
            });
        },

        createConfetti: function () {
            const container = document.createElement('div');
            container.id = 'april-fools-confetti';
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

            const colors = ['#eab308', '#ec4899', '#22c55e', '#3b82f6', '#f97316'];

            for (let i = 0; i < 25; i++) {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: absolute;
                    width: ${8 + Math.random() * 8}px;
                    height: ${8 + Math.random() * 8}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}%;
                    top: -10px;
                    animation: confettiFall ${4 + Math.random() * 4}s linear infinite;
                    animation-delay: ${Math.random() * 4}s;
                    opacity: ${0.6 + Math.random() * 0.4};
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                    transform: rotate(${Math.random() * 360}deg);
                `;
                container.appendChild(confetti);
            }

            document.body.appendChild(container);
        },

        destroy: function () {
            const banner = document.getElementById('april-fools-banner');
            if (banner) banner.remove();

            const clown = document.getElementById('april-fools-clown');
            if (clown) clown.remove();

            const bubbles = document.getElementById('april-fools-bubbles');
            if (bubbles) bubbles.remove();

            document.querySelectorAll('.april-fools-rotating').forEach(el => el.remove());

            const confetti = document.getElementById('april-fools-confetti');
            if (confetti) confetti.remove();
        }

    };

    if (window.SeasonalManager) {
        window.SeasonalManager.registerTheme(AprilFoolsTheme);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.SeasonalManager) window.SeasonalManager.registerTheme(AprilFoolsTheme);
        });
    }
})();
