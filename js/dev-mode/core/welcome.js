// Console Core - Welcome Message
// Файл: js/dev-mode/core/welcome.js

(function () {
    'use strict';

    // Главное приветствие при загрузке
    function showWelcomeMessage() {
        const styles = {
            ascii: 'color: #0d9488; font-family: monospace; font-size: 12px; line-height: 1.2;',
            title: 'color: #3b82f6; font-size: 20px; font-weight: bold;',
            subtitle: 'color: #64748b; font-size: 14px;',
            highlight: 'color: #0d9488; font-weight: bold;',
            link: 'color: #3b82f6; text-decoration: underline;',
            code: 'background: #1e293b; color: #e2e8f0; padding: 2px 6px; border-radius: 4px;'
        };

        // ASCII-art логотип
        const asciiArt = `
    ███████╗██╗  ██╗██╗   ██╗██╗    ██╗██╗██████╗ ███████╗███╗   ██╗███████╗ ██████╗ 
    ██╔════╝██║ ██╔╝╚██╗ ██╔╝██║    ██║██║██╔══██╗██╔════╝████╗  ██║██╔════╝██╔═══██╗
    ███████╗█████╔╝  ╚████╔╝ ██║ █╗ ██║██║██████╔╝█████╗  ██╔██╗ ██║█████╗  ██║   ██║
    ╚════██║██╔═██╗   ╚██╔╝  ██║███╗██║██║██╔══██╗██╔══╝  ██║╚██╗██║██╔══╝  ██║   ██║
    ███████║██║  ██╗   ██║   ╚███╔███╔╝██║██║  ██║███████╗██║ ╚████║███████╗╚██████╔╝
    ╚══════╝╚═╝  ╚═╝   ╚═╝    ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚══════╝ ╚═════╝ 
        `;

        console.log('%c[dev-mode/core/welcome.js] ' + '%c' + asciiArt, 'color: #64748b;', styles.ascii);
        console.log('%c[dev-mode/core/welcome.js] ' + '%c👋 Привет, любопытный человек!', 'color: #64748b;', styles.title);
        // console.log('%c[dev-mode/core/welcome.js] ' + '%cДобро пожаловать в консоль моего портфолио', 'color: #64748b;', styles.subtitle);
        console.log('');
        console.log('%c[dev-mode/core/welcome.js] ' + '%c🔗 GitHub: https://github.com/skywireneo/skywireneo.github.io', 'color: #64748b;', styles.link);
        // console.log('');
        // console.log('%c[dev-mode/core/welcome.js] ' + '%c💡 Попробуй найти все пасхалки на сайте!', 'color: #64748b;', styles.code);
        // console.log('%c[dev-mode/core/welcome.js] ' + '%c💡 Режим разработчика: добавите ?dev_mode=1 к URL', 'color: #64748b;', styles.code);
    }

    // Экспорт
    window.DevModeCore = window.DevModeCore || {};
    window.DevModeCore.showWelcomeMessage = showWelcomeMessage;
})();
