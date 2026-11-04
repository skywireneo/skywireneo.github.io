// Dev Mode - Avatar Easter Egg
// Файл: js/dev-mode/easter-eggs/avatar.js

(function () {
    'use strict';

    // Добавление CSS стилей для анимации
    function addAvatarAnimationStyles() {
        if (document.getElementById('avatar-easter-egg-styles')) return;

        const style = document.createElement('style');
        style.id = 'avatar-easter-egg-styles';
        style.textContent = `
            @keyframes avatarGlow {
                0%, 100% {
                    box-shadow: 0 0 20px 5px rgba(13, 148, 136, 0.6),
                                0 0 40px 10px rgba(59, 130, 246, 0.4),
                                0 0 60px 15px rgba(13, 148, 136, 0.2);
                    transform: scale(1);
                }
                25% {
                    box-shadow: 0 0 30px 8px rgba(59, 130, 246, 0.7),
                                0 0 50px 15px rgba(13, 148, 136, 0.5),
                                0 0 70px 20px rgba(59, 130, 246, 0.3);
                    transform: scale(1.02);
                }
                50% {
                    box-shadow: 0 0 40px 10px rgba(13, 148, 136, 0.8),
                                0 0 60px 20px rgba(59, 130, 246, 0.6),
                                0 0 80px 25px rgba(13, 148, 136, 0.4);
                    transform: scale(1.05);
                }
                75% {
                    box-shadow: 0 0 30px 8px rgba(59, 130, 246, 0.7),
                                0 0 50px 15px rgba(13, 148, 136, 0.5),
                                0 0 70px 20px rgba(59, 130, 246, 0.3);
                    transform: scale(1.02);
                }
            }
            
            @keyframes avatarRing {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                100% {
                    transform: scale(2.5);
                    opacity: 0;
                }
            }
            
            .avatar-easter-egg-active {
                animation: avatarGlow 2s ease-in-out infinite !important;
                position: relative;
                z-index: 10;
            }
            
            .avatar-easter-egg-active::before {
                content: '';
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px;
                border-radius: 50%;
                border: 3px solid rgba(13, 148, 136, 0.6);
                animation: avatarRing 1.5s ease-out infinite;
                pointer-events: none;
            }
            
            .avatar-easter-egg-active::after {
                content: '';
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px;
                border-radius: 50%;
                border: 3px solid rgba(59, 130, 246, 0.6);
                animation: avatarRing 1.5s ease-out infinite 0.75s;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    // Активация анимации аватара
    function activateAvatarAnimation(avatar) {
        addAvatarAnimationStyles();

        // Добавляем класс анимации
        avatar.classList.add('avatar-easter-egg-active');

        // Убираем анимацию через 5 секунд
        setTimeout(() => {
            avatar.classList.remove('avatar-easter-egg-active');
        }, 5000);

        // Создаем частицы вокруг аватара
        createAvatarParticles(avatar);
    }

    // Создание частиц вокруг аватара
    function createAvatarParticles(avatar) {
        const rect = avatar.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                const angle = (i / 12) * Math.PI * 2;
                const distance = 80;

                particle.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: ${i % 2 === 0 ? '#0d9488' : '#3b82f6'};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    left: ${centerX}px;
                    top: ${centerY}px;
                    box-shadow: 0 0 10px ${i % 2 === 0 ? '#0d9488' : '#3b82f6'};
                `;

                document.body.appendChild(particle);

                // Анимация частицы
                const destX = centerX + Math.cos(angle) * distance;
                const destY = centerY + Math.sin(angle) * distance;

                particle.animate([
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                    { transform: `translate(${destX - centerX}px, ${destY - centerY}px) scale(0)`, opacity: 0 }
                ], {
                    duration: 1000,
                    easing: 'ease-out'
                }).onfinish = () => particle.remove();

            }, i * 100);
        }
    }

    function setupAvatarEasterEgg() {
        const avatar = document.querySelector('.avatar');
        if (avatar) {
            let clickCount = 0;
            let lastClickTime = 0;

            avatar.addEventListener('click', () => {
                const now = Date.now();

                // Сброс счетчика если прошло больше 2 секунд между кликами
                if (now - lastClickTime > 2000) {
                    clickCount = 0;
                }
                lastClickTime = now;

                clickCount++;

                if (clickCount === 5) {
                    // Активируем анимацию
                    activateAvatarAnimation(avatar);

                    console.log('%c[dev-mode/easter-eggs/avatar.js] ' + '%c🎉 Пасхалка найдена!', 'color: #64748b;', 'color: #22c55e; font-size: 16px; font-weight: bold;');
                    console.log('%c[dev-mode/easter-eggs/avatar.js] ' + '%cТы кликнул на аватар 5 раз!', 'color: #64748b;', 'color: #64748b;');
                    console.log('%c[dev-mode/easter-eggs/avatar.js] ' + '%c👋 Привет! Я Андрей, backend-разработчик из Москвы.', 'color: #64748b;', 'color: #e2e8f0;');
                    console.log('%c[dev-mode/easter-eggs/avatar.js] ' + '%c💡 Факт: Я начал программировать ещё в университете на C++', 'color: #64748b;', 'color: #0d9488;');

                    clickCount = 0;
                }
            });
        }
    }


    window.DevModeEasterEggsAvatar = {
        setupAvatarEasterEgg: setupAvatarEasterEgg
    };
})();
