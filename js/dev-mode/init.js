// Dev Mode - Initialization
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {

        // Приветствие
        setTimeout(() => {
            if (window.DevModeCore && window.DevModeCore.showWelcomeMessage) {
                window.DevModeCore.showWelcomeMessage();
            }
        }, 1000);

        // Пасхалка аватар
        if (window.DevModeEasterEggsAvatar) {
            window.DevModeEasterEggsAvatar.setupAvatarEasterEgg();
        }

        // Панель разработчика
        if (window.DevModePanel) {
            if (window.DevModePanel.setupDevPanelButton) window.DevModePanel.setupDevPanelButton();
            if (window.DevModePanel.setupDevPanelDrag) window.DevModePanel.setupDevPanelDrag();
        }

        // Команды панели
        if (window.DevModePanelButtons && window.DevModePanelButtons.setupDevModeCommands) {
            window.DevModePanelButtons.setupDevModeCommands();
        }
    });
})();
