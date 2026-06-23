// Console Core - Global Commands
// Файл: js/dev-mode/core/commands.js

(function () {
    'use strict';

    // Таблица навыков
    function showSkillsTable() {
        const skills = [
            { Навык: 'Node.js', Уровень: '90%', Статус: '🔥 Эксперт' },
            { Навык: 'Python', Уровень: '85%', Статус: '⭐ Продвинутый' },
            { Навык: 'PostgreSQL', Уровень: '80%', Статус: '⭐ Продвинутый' },
            { Навык: 'React', Уровень: '70%', Статус: '📈 Расту' },
            { Навык: 'Docker', Уровень: '75%', Статус: '⭐ Продвинутый' },
            { Навык: 'Git', Уровень: '85%', Статус: '🔥 Эксперт' }
        ];

        console.log('%c[dev-mode/core/commands.js] ' + '%c📊 Мой стек технологий:', 'color: #64748b;', 'color: #0d9488; font-size: 14px; font-weight: bold;');
        console.table(skills);
    }

    // Глобальная функция skills
    window.skills = function () {
        showSkillsTable();
        return '👆 Вот мои основные навыки!';
    };

    // Глобальная функция quote
    window.quote = function () {
        const quotes = [
            { text: 'Программирование - это искусство объяснять другому человеку, чего ты хочешь от компьютера.', author: 'Дональд Кнут' },
            { text: 'Простота - это предпосылка надежности.', author: 'Эдсгер Дейкстра' },
            { text: 'Преждевременная оптимизация - корень всех зол.', author: 'Дональд Кнут' },
            { text: 'Лучший код - это тот, которого нет.', author: 'Рич Хики' },
            { text: 'Отладка вдвое сложнее написания кода. Если вы пишете код настолько умно, насколько можете, вы недостаточно умны, чтобы отладить его.', author: 'Брайан Керниган' }
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        console.log('%c[dev-mode/core/commands.js] ' + '%c📜 Случайная цитата:', 'color: #64748b;', 'color: #8b5cf6; font-size: 14px; font-weight: bold;');
        console.log('%c[dev-mode/core/commands.js] ' + '%c"' + randomQuote.text + '"', 'color: #64748b;', 'color: #e2e8f0; font-style: italic;');
        console.log('%c[dev-mode/core/commands.js] ' + '%c— ' + randomQuote.author, 'color: #64748b;', 'color: #64748b;');

        return '🎯 Мудрость дня!';
    };

    // Глобальная функция contact
    window.contact = function () {
        console.log('%c[dev-mode/core/commands.js] ' + '%c📧 Контакты:', 'color: #64748b;', 'color: #0d9488; font-size: 14px; font-weight: bold;');
        console.log('  Email: skywireneo@yandex.ru');
        console.log('  GitHub: https://github.com/skywireneo');
        console.log('');
        console.log('%c[dev-mode/core/commands.js] ' + '%c🚀 Открыт к предложениям!', 'color: #64748b;', 'color: #22c55e;');

        return 'Жду ваших сообщений! 📬';
    };

    // Подсказка для консоли
    window.openConsoleHint = function () {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(31, 41, 55, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(13, 148, 136, 0.5);
            border-radius: 16px;
            padding: 24px 32px;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            animation: fadeInScale 0.3s ease;
        `;
        notification.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 12px;">⌨️</div>
            <div style="color: var(--text); font-size: 1.2rem; font-weight: 600; margin-bottom: 8px;">
                Нажмите F12
            </div>
            <div style="color: var(--text-muted); font-size: 0.95rem;">
                Чтобы открыть консоль разработчика<br>и попробовать команды
            </div>
            <div style="margin-top: 16px; padding: 8px 16px; background: rgba(13, 148, 136, 0.15); border-radius: 8px; font-family: monospace; color: var(--accent); font-size: 0.9rem;">
                skills() &nbsp; quote() &nbsp; contact()
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInScale {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeInScale 0.3s ease reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);

        console.log('%c[dev-mode/core/commands.js] ' + '%c💡 Попробуйте команды:', 'color: #64748b;', 'color: #0d9488; font-size: 14px; font-weight: bold;');
        console.log('%c[dev-mode/core/commands.js] ' + '%c   skills()  - показать таблицу навыков', 'color: #64748b;', 'color: #64748b;');
        console.log('%c[dev-mode/core/commands.js] ' + '%c   quote()   - случайная цитата', 'color: #64748b;', 'color: #64748b;');
        console.log('%c[dev-mode/core/commands.js] ' + '%c   contact() - контактная информация', 'color: #64748b;', 'color: #64748b;');
    };

    // Экспорт для обратной совместимости
    window.ConsoleCore = {
        showWelcomeMessage: window.DevModeCore ? window.DevModeCore.showWelcomeMessage : function () { },
        showSkillsTable: showSkillsTable
    };
})();
