// Dev Mode - Panel Index (Aggregator)
// Файл: js/dev-mode/panel/index.js

(function () {
    'use strict';

    // Агрегируем все функции панели
    window.DevModePanel = {
        // Buttons
        setupDevPanelButton: function () {
            if (window.DevModePanelButtons) window.DevModePanelButtons.setupDevPanelButton();
        },
        addTempDevModeButton: function () {
            if (window.DevModePanelButtons) window.DevModePanelButtons.addTempDevModeButton();
        },

        // Drag
        setupDevPanelDrag: function () {
            if (window.DevModePanelDrag) window.DevModePanelDrag.setupDevPanelDrag();
        },

        // Exit - используем функцию из exit.js если она есть
        addDevPanelExitButton: function () {
            if (window.DevModePanelExit) window.DevModePanelExit.addDevPanelExitButton();
        }
    };

    // Обратная совместимость со старым ConsoleDevPanel
    window.ConsoleDevPanel = window.DevModePanel;
})();
