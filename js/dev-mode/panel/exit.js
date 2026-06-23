// Dev Mode - Panel Exit Button
// Файл: js/dev-mode/panel/exit.js

(function () {
    'use strict';

    // ===== Кнопка выхода из режима разработчика =====
    function addDevPanelExitButton() {
        const devPanel = document.getElementById('devPanel');
        if (!devPanel) return;

        // Проверяем, что кнопки ещё нет
        if (document.getElementById('devPanelExitBtn')) return;

        const devPanelContent = devPanel.querySelector('.dev-panel-content');
        if (!devPanelContent) return;

        const exitBtn = document.createElement('button');
        exitBtn.id = 'devPanelExitBtn';
        exitBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Выйти из режима разработчика';
        exitBtn.className = 'dev-console-btn';
        exitBtn.style.cssText = `
            width: 100%;
            margin-top: 12px;
            padding: 12px 16px;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
            border: 1px solid rgba(239, 68, 68, 0.4);
            border-radius: 10px;
            color: var(--text);
            font-size: 0.95rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s ease;
        `;

        exitBtn.addEventListener('click', () => {
            // Отключаем все режимы
            if (window.DevModeModes) {
                // Проверяем и отключаем каждый режим
                const states = window.DevModeModes.states || {};

                if (states.discoInterval) window.DevModeModes.toggleDiscoMode();
                if (states.rainbowActive) window.DevModeModes.toggleRainbowMode();
                if (states.nightActive) window.DevModeModes.toggleNightMode();
                if (states.matrixActive) window.DevModeModes.toggleMatrixMode();
                if (states.glitchActive) window.DevModeModes.toggleGlitchMode();
                if (states.particlesActive) window.DevModeModes.toggleParticlesMode();
                if (states.crtActive) window.DevModeModes.toggleCrtMode();
                if (states.blurActive) window.DevModeModes.toggleBlurMode();
            }

            // Удаляем все эффекты
            document.body.style.filter = '';
            document.body.style.background = '';
            document.body.style.animation = '';

            // Удаляем canvas матрицы
            const matrixCanvas = document.getElementById('matrix-canvas');
            if (matrixCanvas) matrixCanvas.remove();

            // Удаляем CRT оверлей
            const crtOverlay = document.getElementById('crt-overlay');
            if (crtOverlay) crtOverlay.remove();

            // Удаляем glitch клоны
            const glitchClones = document.querySelectorAll('.glitch-clone');
            glitchClones.forEach(clone => clone.remove());

            // Удаляем обработчик частиц
            if (window.DevModeModes && window.DevModeModes.states && window.DevModeModes.states.particlesClickHandler) {
                document.removeEventListener('click', window.DevModeModes.states.particlesClickHandler);
            }

            // Очищаем localStorage
            localStorage.removeItem('devModeActive');

            // Скрываем панель
            devPanel.classList.remove('active');
            document.body.classList.remove('dev-mode-active');

            // Удаляем кнопку выхода
            exitBtn.remove();

            console.log('%c[dev-mode/panel/exit.js] ' + '%c🛑 Режим разработчика выключен', 'color: #64748b;', 'color: #ef4444; font-size: 14px; font-weight: bold;');
        });

        // Hover эффекты
        exitBtn.addEventListener('mouseenter', () => {
            exitBtn.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3))';
            exitBtn.style.borderColor = 'rgba(239, 68, 68, 0.6)';
            exitBtn.style.transform = 'translateY(-2px)';
        });

        exitBtn.addEventListener('mouseleave', () => {
            exitBtn.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))';
            exitBtn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            exitBtn.style.transform = '';
        });

        devPanelContent.appendChild(exitBtn);
    }

    // ===== Экспорт функций =====
    window.DevModePanelExit = {
        addDevPanelExitButton: addDevPanelExitButton
    };

})();
