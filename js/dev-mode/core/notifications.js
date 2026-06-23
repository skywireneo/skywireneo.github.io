// Dev Mode - Notifications
// Файл: js/dev-mode/core/notifications.js

(function () {
    'use strict';

    // ===== Показать уведомление с подсказкой F12 =====
    function showF12Notification() {
        // Удаляем старое уведомление если есть
        const oldNotification = document.getElementById('f12Notification');
        if (oldNotification) oldNotification.remove();

        const notification = document.createElement('div');
        notification.id = 'f12Notification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(13, 148, 136, 0.95);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 16px;
            padding: 24px 32px;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            animation: f12FadeIn 0.3s ease;
            font-family: 'Segoe UI', system-ui, sans-serif;
        `;
        notification.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 12px;">⌨️</div>
            <div style="color: #fff; font-size: 1.2rem; font-weight: 600; margin-bottom: 8px;">
                Нажмите F12
            </div>
            <div style="color: rgba(255,255,255,0.9); font-size: 0.95rem; margin-bottom: 12px;">
                Чтобы открыть консоль разработчика<br>и попробовать команды
            </div>
            <div style="padding: 8px 16px; background: rgba(255,255,255,0.15); border-radius: 8px; font-family: monospace; color: #fff; font-size: 0.9rem;">
                skills() &nbsp; quote() &nbsp; contact()
            </div>
        `;

        // Add animation keyframes
        const style = document.createElement('style');
        style.id = 'f12NotificationStyle';
        style.textContent = `
            @keyframes f12FadeIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes f12FadeOut {
                from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'f12FadeOut 0.3s ease forwards';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);
    }

    // ===== Экспорт функций =====
    window.DevModeNotifications = {
        showF12Notification: showF12Notification
    };

})();
