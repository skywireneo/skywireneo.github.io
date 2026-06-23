// Knowledge Day Theme - 1 сентября
(function () {
    'use strict';

    const KnowledgeDayTheme = {
        id: 'knowledge-day',
        name: '1 сентября',
        icon: '📚',

        // Модальное окно
        modalTitle: 'С 1 сентября! 📚',
        modalContent: 'День знаний — начало нового учебного года, полного открытий и достижений. Желаем успехов в учёбе, интересных задач и блестящих результатов!',

        specificDate: '09-01',


        cssVars: {
            '--accent': '#f59e0b',
            '--accent-secondary': '#8b5cf6',
            '--text-highlight': '#fbbf24'
        },

        init: function () {
            this.createBanner();
            this.createApple();
            this.createBooks();
            this.createPencils();
            this.createFallingLeaves();
        },

        createBanner: function () {
            const banner = document.createElement('div');
            banner.className = 'seasonal-banner knowledge-day-banner';
            banner.id = 'knowledge-day-banner';
            banner.innerHTML = '📚 С 1 сентября! 🍎';
            banner.style.cssText = `
                background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(139,92,246,0.2)) !important;
                border: 1px solid rgba(245,158,11,0.4) !important;
                color: #fbbf24 !important;
            `;
            document.body.appendChild(banner);
        },

        createApple: function () {
            const apple = document.createElement('div');
            apple.id = 'knowledge-day-apple';
            apple.innerHTML = '🍎';
            apple.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                font-size: 2.5rem;
                z-index: 100;
                animation: appleBounce 2s ease-in-out infinite;
                pointer-events: none;
                filter: drop-shadow(0 0 10px rgba(245,158,11,0.3));
            `;
            document.body.appendChild(apple);
        },

        createBooks: function () {
            const container = document.createElement('div');
            container.id = 'knowledge-day-books';
            container.style.cssText = `
                position: fixed;
                top: 100px;
                right: 30px;
                z-index: 100;
                pointer-events: none;
            `;

            const books = ['📕', '📗', '📘', '📙'];
            books.forEach((book, index) => {
                const bookEl = document.createElement('div');
                bookEl.innerHTML = book;
                bookEl.style.cssText = `
                    position: absolute;
                    font-size: 2rem;
                    top: ${index * 25}px;
                    right: ${index * 10}px;
                    transform: rotate(${-10 + index * 5}deg);
                    animation: bookFloat 3s ease-in-out infinite;
                    animation-delay: ${index * 0.2}s;
                    filter: drop-shadow(0 2px 5px rgba(0,0,0,0.2));
                `;
                container.appendChild(bookEl);
            });

            document.body.appendChild(container);
        },

        createPencils: function () {
            const container = document.createElement('div');
            container.id = 'knowledge-day-pencils';
            container.style.cssText = `
                position: fixed;
                bottom: 150px;
                right: 20px;
                z-index: 100;
                pointer-events: none;
            `;

            const pencils = ['✏️', '✒️', '🖊️', '🖋️'];
            pencils.forEach((pencil, index) => {
                const pencilEl = document.createElement('div');
                pencilEl.innerHTML = pencil;
                pencilEl.style.cssText = `
                    position: absolute;
                    font-size: 1.8rem;
                    bottom: ${index * 20}px;
                    right: ${index * 15}px;
                    transform: rotate(${15 - index * 10}deg);
                    animation: pencilWiggle 2s ease-in-out infinite;
                    animation-delay: ${index * 0.3}s;
                `;
                container.appendChild(pencilEl);
            });

            document.body.appendChild(container);
        },

        createFallingLeaves: function () {
            const container = document.createElement('div');
            container.id = 'knowledge-day-leaves';
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

            const leaves = ['🍂', '🍁', '🍃'];
            const colors = ['#d97706', '#b45309', '#65a30d', '#f59e0b'];

            for (let i = 0; i < 15; i++) {
                const leaf = document.createElement('div');
                leaf.innerHTML = leaves[Math.floor(Math.random() * leaves.length)];
                leaf.style.cssText = `
                    position: absolute;
                    font-size: ${1 + Math.random()}rem;
                    left: ${Math.random() * 100}%;
                    top: -30px;
                    color: ${colors[Math.floor(Math.random() * colors.length)]};
                    animation: leafFall ${6 + Math.random() * 4}s linear infinite;
                    animation-delay: ${Math.random() * 5}s;
                    opacity: ${0.6 + Math.random() * 0.4};
                `;
                container.appendChild(leaf);
            }

            document.body.appendChild(container);
        },

        destroy: function () {
            const banner = document.getElementById('knowledge-day-banner');
            if (banner) banner.remove();
            const apple = document.getElementById('knowledge-day-apple');
            if (apple) apple.remove();
            const books = document.getElementById('knowledge-day-books');
            if (books) books.remove();
            const pencils = document.getElementById('knowledge-day-pencils');
            if (pencils) pencils.remove();
            const leaves = document.getElementById('knowledge-day-leaves');
            if (leaves) leaves.remove();
        }

    };

    if (window.SeasonalManager) {
        window.SeasonalManager.registerTheme(KnowledgeDayTheme);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.SeasonalManager) window.SeasonalManager.registerTheme(KnowledgeDayTheme);
        });
    }
})();
