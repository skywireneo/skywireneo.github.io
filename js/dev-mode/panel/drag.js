// Dev Mode - Panel Drag
// Файл: js/dev-mode/panel/drag.js

(function () {
    'use strict';

    // ===== Drag функционал для панели =====
    function setupDevPanelDrag() {
        const devPanel = document.getElementById('devPanel');
        const header = devPanel?.querySelector('.dev-panel-header');

        if (!devPanel || !header) return;

        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('mousemove', drag);

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header || e.target.closest('.dev-panel-header')) {
                isDragging = true;
                devPanel.classList.add('dragging');
            }
        }

        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            devPanel.classList.remove('dragging');
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;

                devPanel.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) scale(1)`;
            }
        }
    }

    // ===== Экспорт функций =====
    window.DevModePanelDrag = {
        setupDevPanelDrag: setupDevPanelDrag
    };

})();
