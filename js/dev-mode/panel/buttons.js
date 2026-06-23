// Dev Mode - Panel Buttons
// Файл: js/dev-mode/panel/buttons.js

(function () {
    'use strict';

    function setupDevPanelButton() {
        const devPanelBtn = document.getElementById('devPanelBtn');
        const devPanel = document.getElementById('devPanel');

        if (devPanelBtn && devPanel) {
            devPanelBtn.addEventListener('click', () => {
                if (devPanel.classList.contains('active')) {
                    devPanel.classList.remove('active');
                } else {
                    devPanel.style.transform = '';
                    devPanel.classList.add('active');
                    document.body.classList.add('dev-mode-active');

                    if (window.DevModePanel && window.DevModePanel.addDevPanelExitButton) {
                        window.DevModePanel.addDevPanelExitButton();
                    }
                    if (window.DevModeNotifications && window.DevModeNotifications.showDevModeNotification) {
                        window.DevModeNotifications.showDevModeNotification();
                    }
                    console.log('%c[dev-mode/panel/buttons.js] ' + '%c🎮 Режим разработчика активирован через кнопку', 'color: #64748b;', 'color: #22c55e;');
                }
            });
        }

        addTempDevModeButton();
    }

    function addTempDevModeButton() {
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.get('dev_mode')) return;
        if (document.getElementById('tempDevModeBtn')) return;

        const tempBtn = document.createElement('button');
        tempBtn.id = 'tempDevModeBtn';
        tempBtn.innerHTML = '<i class="fas fa-code"></i> DEV MODE';
        tempBtn.title = 'Временная кнопка: включить режим разработчика (требуется ?dev_mode=1)';
        tempBtn.style.cssText = `
            position: fixed; bottom: 80px; left: 20px; z-index: 9999;
            padding: 10px 16px; background: linear-gradient(135deg, #0d9488, #3b82f6);
            border: none; border-radius: 8px; color: white; font-size: 0.85rem;
            font-weight: 600; cursor: pointer; display: flex; align-items: center;
            gap: 8px; box-shadow: 0 4px 15px rgba(13, 148, 136, 0.4);
            transition: all 0.3s ease; font-family: monospace;
        `;
        tempBtn.addEventListener('click', () => {
            document.body.classList.add('dev-mode-active');
            if (devPanel) devPanel.classList.add('active');
            if (window.DevModeNotifications && window.DevModeNotifications.showDevModeNotification) {
                window.DevModeNotifications.showDevModeNotification();
            }
        });
        document.body.appendChild(tempBtn);
    }

    function setupDevModeCommands() {
        const commands = document.querySelectorAll('.dev-command');
        commands.forEach(command => {
            command.addEventListener('click', () => {
                const mode = command.dataset.mode;
                if (!mode) return;

                switch (mode) {
                    case 'easter-egg-map':
                        if (window.DevModeEasterEggsMap) {
                            window.DevModeEasterEggsMap.toggleEasterEggMap();
                        }
                        break;
                    case 'offline-sim':
                        if (window.OfflineIndicator) window.OfflineIndicator.toggleSimulation();
                        break;
                    case 'seasonal-preview':
                        if (window.SeasonalManager) window.SeasonalManager.openPreviewPanel();
                        break;
                    case 'browser-warning':
                        if (window.BrowserWarning) window.BrowserWarning.forceShow();
                        break;
                    case 'particles-themes':
                        if (window.openParticlesThemesModal) window.openParticlesThemesModal();
                        break;
                }

                setTimeout(updateDevCommandsVisualState, 50);
            });
        });
    }

    function updateDevCommandsVisualState() {
        const easterEggMapActive = window.DevModeEasterEggsMap ? window.DevModeEasterEggsMap.isActive() : false;
        const commandMap = {
            'easter-egg-map': easterEggMapActive
        };

        Object.entries(commandMap).forEach(([mode, isActive]) => {
            const command = document.querySelector(`.dev-command[data-mode="${mode}"]`);
            if (command) {
                command.classList.toggle('active', !!isActive);
            }
        });
    }

    window.updateDevPanelVisualState = updateDevCommandsVisualState;

    // Вкладки удалены — осталась одна, но функция не помешает
    function setupDevTabs() {
        // Ничего не делаем, вкладки удалены
    }

    window.DevModePanelButtons = {
        setupDevPanelButton: setupDevPanelButton,
        addTempDevModeButton: addTempDevModeButton,
        setupDevModeCommands: setupDevModeCommands,
        updateDevCommandsVisualState: updateDevCommandsVisualState,
        setupDevTabs: setupDevTabs
    };

})();
