// Seasonal Manager - основной менеджер сезонных тем
// Управляет автоматическим применением праздничных оформлений

(function () {
    'use strict';

    class SeasonalManager {
        constructor() {
            this.currentTheme = null;
            this.themes = new Map();
            this.previewMode = false;
            this.enabled = this.isEnabled();
            this.previewPanel = null;
            this.footerElement = null;
            this.modalElement = null;
            this.scrollHandler = null;
            this.bannerClickHandler = null;

            // Привязываем методы
            this.openPreviewPanel = this.openPreviewPanel.bind(this);
            this.closePreviewPanel = this.closePreviewPanel.bind(this);
            this.applyTheme = this.applyTheme.bind(this);
            this.removeTheme = this.removeTheme.bind(this);
            this.handleScroll = this.handleScroll.bind(this);
            this.openModal = this.openModal.bind(this);
            this.closeModal = this.closeModal.bind(this);
            this.toggleTheme = this.toggleTheme.bind(this);
        }


        /**
         * Регистрирует тему
         * @param {Object} theme - объект темы
         */
        registerTheme(theme) {
            if (!theme || !theme.id) {
                console.error('[SeasonalManager] Invalid theme:', theme);
                return;
            }

            this.themes.set(theme.id, theme);

            // Автоматически проверяем и применяем тему после регистрации
            // Это нужно потому что темы регистрируются после инициализации менеджера
            if (!this.currentTheme && this.enabled) {
                // Проверяем сохранённый выбор пользователя
                const preference = this.getUserPreference();

                // Если пользователь отключил тему - не применяем автоматически
                if (preference.disabled && preference.themeId === theme.id) {
                    // Создаём футер с информацией о празднике
                    this.createFooter();
                    return;
                }

                const today = window.SeasonalDateUtils ? window.SeasonalDateUtils.getToday() : new Date();
                const todayStr = window.SeasonalDateUtils ? window.SeasonalDateUtils.formatDate(today) : `${today.getMonth() + 1}-${today.getDate()}`;


                // Проверяем конкретную дату
                if (theme.specificDate) {
                    const matches = window.SeasonalDateUtils &&
                        window.SeasonalDateUtils.isSpecificDate(today, theme.specificDate);
                    if (matches) {
                        this.applyTheme(theme.id, false);
                    }
                }
                // Проверяем диапазон
                else if (theme.dateRange) {
                    const matches = window.SeasonalDateUtils &&
                        window.SeasonalDateUtils.isDateInRange(today, theme.dateRange.start, theme.dateRange.end);
                    if (matches) {
                        this.applyTheme(theme.id, false);
                    }
                }
                // Проверяем плавающую дату
                else if (theme.checkDate) {
                    const year = today.getFullYear();
                    const matches = theme.checkDate(today, year);
                    if (matches) {
                        this.applyTheme(theme.id, false);
                    }
                }
            }
        }




        /**
         * Проверяет, включено ли сезонное оформление в настройках
         * @returns {boolean}
         */
        isEnabled() {
            const setting = localStorage.getItem('seasonalEnabled');
            return setting !== 'false'; // По умолчанию включено
        }

        /**
         * Сохраняет выбор пользователя в localStorage
         * @param {string|null} themeId - ID темы или null если отключено
         */
        saveUserPreference(themeId) {
            if (themeId) {
                localStorage.setItem('seasonalUserChoice', themeId);
                localStorage.setItem('seasonalUserDisabled', 'false');
            } else {
                localStorage.setItem('seasonalUserDisabled', 'true');
                // Не удаляем seasonalUserChoice, чтобы знать какую тему включить при повторном включении
            }
        }

        /**
         * Получает сохранённый выбор пользователя
         * @returns {Object|null} - { themeId: string, disabled: boolean } или null
         */
        getUserPreference() {
            const disabled = localStorage.getItem('seasonalUserDisabled') === 'true';
            const themeId = localStorage.getItem('seasonalUserChoice');
            return { themeId, disabled };
        }

        /**
         * Очищает сохранённый выбор (вызывается вне праздников)
         */
        clearUserPreference() {
            localStorage.removeItem('seasonalUserChoice');
            localStorage.removeItem('seasonalUserDisabled');
        }


        /**
         * Включает/выключает сезонное оформление
         * @param {boolean} enabled 
         */
        setEnabled(enabled) {
            localStorage.setItem('seasonalEnabled', enabled);
            this.enabled = enabled;

            if (enabled) {
                this.detectAndApply();
            } else {
                this.removeTheme();
            }
        }

        /**
         * Определяет текущий праздник по дате
         * @returns {Object|null} - объект темы или null
         */
        detectCurrentHoliday() {
            const today = window.SeasonalDateUtils ? window.SeasonalDateUtils.getToday() : new Date();
            const year = today.getFullYear();

            for (const [id, theme] of this.themes) {
                if (theme.checkDate) {
                    // Для тем с плавающими датами (Пасха, Чёрная пятница, День программиста)
                    if (theme.checkDate(today, year)) {
                        return theme;
                    }
                } else if (theme.dateRange) {
                    // Для тем с фиксированным диапазоном
                    if (window.SeasonalDateUtils &&
                        window.SeasonalDateUtils.isDateInRange(today, theme.dateRange.start, theme.dateRange.end)) {
                        return theme;
                    }
                } else if (theme.specificDate) {
                    // Для тем с конкретной датой
                    if (window.SeasonalDateUtils &&
                        window.SeasonalDateUtils.isSpecificDate(today, theme.specificDate)) {
                        return theme;
                    }
                }
            }

            return null;
        }

        /**
         * Получает название текущего праздника
         * @returns {string}
         */
        getCurrentHolidayName() {
            const holiday = this.detectCurrentHoliday();
            return holiday ? holiday.name : 'Нет праздника';
        }

        /**
         * Обработчик скролла для баннера
         */
        handleScroll() {
            const banner = document.querySelector('.seasonal-banner');
            if (!banner) return;

            const scrollY = window.scrollY || window.pageYOffset;
            const headerHeight = 70; // Высота хедера

            if (scrollY > headerHeight) {
                banner.classList.add('scrolled');
            } else {
                banner.classList.remove('scrolled');
            }
        }

        /**
         * Открывает модальное окно темы
         */
        openModal() {
            if (!this.currentTheme) return;

            // Удаляем старое модальное окно если есть
            this.closeModal();

            const overlay = document.createElement('div');
            overlay.className = 'seasonal-modal-overlay';
            overlay.id = 'seasonalModal';

            const theme = this.currentTheme;
            const accentColor = theme.cssVars?.['--accent'] || '#fbbf24';

            overlay.innerHTML = `
                <div class="seasonal-modal" style="
                    --seasonal-accent: ${accentColor}33;
                    --seasonal-accent-glow: ${accentColor}33;
                    --seasonal-accent-color: ${accentColor};
                    --seasonal-accent-hover: ${accentColor}4d;
                ">
                    <button class="seasonal-modal-close" onclick="window.SeasonalManager.closeModal()">×</button>
                    <span class="seasonal-modal-icon">${theme.icon}</span>
                    <h2 class="seasonal-modal-title" style="text-align: center !important; margin: 0 auto 20px auto !important; width: 100% !important; display: block !important;">${theme.modalTitle || theme.name}</h2>
                    <p class="seasonal-modal-text">${theme.modalContent || 'Праздничное настроение!'}</p>
                    <button class="seasonal-modal-btn" onclick="window.SeasonalManager.closeModal()">Закрыть</button>
                </div>
            `;


            // Закрытие по клику на оверлей
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                }
            });

            // Закрытие по Escape
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);

            document.body.appendChild(overlay);
            this.modalElement = overlay;

            // Анимация появления
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });
        }

        /**
         * Закрывает модальное окно
         */
        closeModal() {
            if (this.modalElement) {
                this.modalElement.classList.remove('active');
                setTimeout(() => {
                    if (this.modalElement && this.modalElement.parentNode) {
                        this.modalElement.parentNode.removeChild(this.modalElement);
                    }
                    this.modalElement = null;
                }, 300);
            }
        }

        /**
         * Переключает тему (вкл/выкл)
         */
        toggleTheme() {
            if (this.currentTheme) {
                this.removeTheme();
                // Сохраняем, что пользователь отключил тему
                this.saveUserPreference(null);
                // После удаления темы создаём футер с обычным стилем
                this.createFooter();
            } else {
                // Пользователь явно включает тему - сохраняем выбор
                const holiday = this.detectCurrentHoliday();
                if (holiday) {
                    this.saveUserPreference(holiday.id);
                }
                this.detectAndApply();
            }
        }


        /**
         * Создаёт футер с праздничным сообщением
         */
        createFooter() {
            // Удаляем старый футер если есть
            this.removeFooter();

            // Определяем текущий праздник
            const holiday = this.detectCurrentHoliday();

            // Если нет праздника и нет активной темы - не показываем футер
            if (!this.currentTheme && !holiday) return;

            const footer = document.createElement('div');
            footer.className = 'seasonal-footer';
            footer.id = 'seasonalFooter';

            if (this.currentTheme) {
                // Активен праздничный стиль
                footer.innerHTML = `
                    <div class="seasonal-footer-content">
                        <div class="seasonal-footer-message">
                            <span>${this.currentTheme.icon}</span>
                            <span>Сейчас на сайте: ${this.currentTheme.name}</span>
                        </div>
                        <button class="seasonal-footer-toggle" onclick="window.SeasonalManager.toggleTheme()">
                            Вернуть обычный стиль
                        </button>
                    </div>
                `;
            } else if (holiday) {
                // Обычный стиль, но есть праздник - показываем название праздника и кнопку включения
                footer.innerHTML = `
                    <div class="seasonal-footer-content">
                        <div class="seasonal-footer-message">
                            <span>${holiday.icon}</span>
                            <span>Сейчас на сайте: ${holiday.name}</span>
                        </div>
                        <button class="seasonal-footer-toggle" onclick="window.SeasonalManager.toggleTheme()">
                            Включить праздничный стиль
                        </button>
                    </div>
                `;
            }

            // Вставляем в конец body
            document.body.appendChild(footer);
            this.footerElement = footer;
        }


        /**
         * Удаляет футер
         */
        removeFooter() {
            if (this.footerElement && this.footerElement.parentNode) {
                this.footerElement.parentNode.removeChild(this.footerElement);
                this.footerElement = null;
            }
        }


        /**
         * Включает CSS для конкретной темы
         * @param {string} themeId - ID темы
         */
        enableSeasonalCSS(themeId) {
            const cssLink = document.getElementById(`seasonal-${themeId}`);
            if (cssLink) {
                cssLink.disabled = false;
            }
        }

        /**
         * Отключает все seasonal CSS
         */
        disableAllSeasonalCSS() {
            document.querySelectorAll('[id^="seasonal-"]').forEach(link => {
                link.disabled = true;
            });
        }

        /**
         * Динамически загружает JS файл темы
         * @param {string} themeId - ID темы
         * @returns {Promise}
         */
        async loadThemeScript(themeId) {
            // Проверяем, уже ли загружен
            if (this.loadedScripts && this.loadedScripts.has(themeId)) return;

            const basePath = window.location.pathname.includes('/skywireneo.github.io') ? '/skywireneo.github.io' : '';
            const scriptUrl = `${basePath}/js/seasonal/themes/${themeId}.js`;

            try {
                const response = await fetch(scriptUrl);
                if (!response.ok) {
                    console.warn(`[SeasonalManager] Theme script not found: ${scriptUrl}`);
                    return;
                }
                const scriptText = await response.text();
                const script = document.createElement('script');
                script.textContent = scriptText;
                document.head.appendChild(script);
                if (!this.loadedScripts) this.loadedScripts = new Set();
                this.loadedScripts.add(themeId);
            } catch (e) {
                console.warn(`[SeasonalManager] Failed to load theme script: ${scriptUrl}`, e);
            }
        }

        /**
         * Применяет тему
         * @param {string} themeId - ID темы
         * @param {boolean} isPreview - режим предпросмотра
         */
        async applyTheme(themeId, isPreview = false) {
            const theme = this.themes.get(themeId);
            if (!theme) {
                console.error(`[SeasonalManager] Theme not found: ${themeId}`);
                return;
            }

            // Динамически загружаем JS темы
            await this.loadThemeScript(themeId);

            // Удаляем текущую тему
            this.removeTheme();

            this.currentTheme = theme;
            this.previewMode = isPreview;

            // Включаем соответствующий seasonal CSS
            this.enableSeasonalCSS(themeId);

            // Применяем CSS переменные
            if (theme.cssVars) {
                const root = document.documentElement;
                Object.entries(theme.cssVars).forEach(([key, value]) => {
                    root.style.setProperty(key, value);
                });
            }

            // Добавляем класс к body
            document.body.classList.add(`seasonal-${theme.id}`);
            document.body.classList.add('seasonal-active');

            // Инициализируем тему
            if (theme.init && typeof theme.init === 'function') {
                theme.init();
            }

            // Применяем соответствующий пресет частиц
            if (window.setParticlesPreset && theme.id) {
                // Map theme ID to particle preset ID
                const particlePresetMap = {
                    'newyear': 'newyear',
                    'halloween': 'halloween',
                    'valentine': 'valentine',
                    'women-day': 'women-day',
                    'victory-day': 'victory-day',
                    'russia-day': 'russia-day',
                    'programmer': 'programmer',
                    'site-birthday': 'site-birthday',
                    'defender-day': 'defenders-day',  // theme ID vs preset ID
                    'defenders-day': 'defenders-day',
                    'may-day': 'labor-day',  // theme ID vs preset ID
                    'labor-day': 'labor-day',
                    'knowledge-day': 'knowledge-day',
                    'april-fools': 'april-fools'
                };

                const particlePreset = particlePresetMap[theme.id];
                if (particlePreset) {
                    setTimeout(() => {
                        window.setParticlesPreset(particlePreset);
                    }, 150);
                }
            }



            // Добавляем обработчики после инициализации темы
            setTimeout(() => {
                this.setupBannerHandlers();
                this.createFooter();
            }, 100);


            // Показываем уведомление
            if (!isPreview && window.DevModeNotifications) {
                window.DevModeNotifications.show(
                    `🎉 ${theme.name}`,
                    'Сезонное оформление активировано автоматически',
                    3000
                );
            }
        }

        /**
         * Настраивает обработчики для баннера
         */
        setupBannerHandlers() {
            const banner = document.querySelector('.seasonal-banner');
            if (!banner) return;

            // Удаляем старые обработчики
            if (this.scrollHandler) {
                window.removeEventListener('scroll', this.scrollHandler);
            }
            if (this.bannerClickHandler) {
                banner.removeEventListener('click', this.bannerClickHandler);
            }

            // Добавляем обработчик скролла
            this.scrollHandler = this.handleScroll;
            window.addEventListener('scroll', this.scrollHandler, { passive: true });

            // Добавляем обработчик клика
            this.bannerClickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openModal();
            };
            banner.addEventListener('click', this.bannerClickHandler);

            // Проверяем начальное состояние скролла
            this.handleScroll();
        }


        /**
         * Удаляет текущую тему
         */
        removeTheme() {
            if (!this.currentTheme) return;

            const theme = this.currentTheme;

            // Отключаем seasonal CSS
            this.disableAllSeasonalCSS();

            // Удаляем CSS переменные
            if (theme.cssVars) {
                const root = document.documentElement;
                Object.keys(theme.cssVars).forEach(key => {
                    root.style.removeProperty(key);
                });
            }

            // Удаляем классы
            document.body.classList.remove(`seasonal-${theme.id}`);
            document.body.classList.remove('seasonal-active');

            // Уничтожаем тему
            if (theme.destroy && typeof theme.destroy === 'function') {
                theme.destroy();
            }

            // Возвращаем пресет частиц к времени суток
            if (window.setParticlesPreset) {
                setTimeout(() => {
                    // Auto-detect time preset instead of reloading
                    const hour = new Date().getHours();
                    let timePreset = 'day';
                    if (hour >= 6 && hour < 12) timePreset = 'morning';
                    else if (hour >= 12 && hour < 18) timePreset = 'day';
                    else if (hour >= 18 && hour < 22) timePreset = 'evening';
                    else timePreset = 'night';
                    window.setParticlesPreset(timePreset);
                }, 100);
            }



            // Удаляем обработчики
            if (this.scrollHandler) {
                window.removeEventListener('scroll', this.scrollHandler);
                this.scrollHandler = null;
            }

            // Удаляем футер
            this.removeFooter();

            // Закрываем модальное окно
            this.closeModal();

            this.currentTheme = null;
            this.previewMode = false;

            // Создаём футер с обычным стилем
            this.createFooter();
        }




        /**
         * Автоматически определяет и применяет тему
         * Учитывает сохранённый выбор пользователя
         */
        detectAndApply() {
            if (!this.enabled) return;

            const holiday = this.detectCurrentHoliday();

            // Если сейчас нет праздника - очищаем сохранение и не применяем тему
            if (!holiday) {
                this.clearUserPreference();
                return;
            }

            // Проверяем сохранённый выбор пользователя
            const preference = this.getUserPreference();

            // Если пользователь явно отключил тему - не применяем автоматически
            if (preference.disabled && preference.themeId === holiday.id) {
                // Создаём футер с информацией о празднике
                this.createFooter();
                return;
            }

            // Если пользователь ранее включал эту тему - применяем её
            if (preference.themeId === holiday.id && !preference.disabled) {
                this.applyTheme(holiday.id, false);
                return;
            }

            // По умолчанию применяем тему праздника
            if (holiday.id !== this.currentTheme?.id) {
                this.applyTheme(holiday.id, false);
            }
        }


        /**
         * Получает список всех тем
         * @returns {Array}
         */
        getAllThemes() {
            return Array.from(this.themes.values()).map(theme => ({
                id: theme.id,
                name: theme.name,
                icon: theme.icon || '🎨',
                isActive: this.currentTheme?.id === theme.id
            }));
        }

        /**
         * Создаёт и открывает панель предпросмотра
         */
        openPreviewPanel() {
            if (this.previewPanel) {
                this.previewPanel.style.display = 'block';
                return;
            }

            // Создаём панель
            const panel = document.createElement('div');
            panel.id = 'seasonalPreviewPanel';
            panel.className = 'seasonal-preview-panel';

            const today = window.SeasonalDateUtils ? window.SeasonalDateUtils.getToday() : new Date();
            const currentHoliday = this.getCurrentHolidayName();

            panel.innerHTML = `
                <div class="seasonal-preview-header">
                    <h3>🎨 Сезонные стили</h3>
                    <button class="seasonal-preview-close" onclick="window.SeasonalManager.closePreviewPanel()">×</button>
                </div>
                <div class="seasonal-preview-info">
                    <div class="seasonal-current-date">
                        <i class="far fa-calendar"></i>
                        <span>${today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div class="seasonal-current-holiday">
                        <i class="fas fa-gift"></i>
                        <span>Сейчас: ${currentHoliday}</span>
                    </div>
                </div>
                <div class="seasonal-preview-grid">
                    ${this.getAllThemes().map(theme => `
                        <button class="seasonal-theme-btn ${theme.isActive ? 'active' : ''}" 
                                onclick="window.SeasonalManager.applyTheme('${theme.id}', true)"
                                data-theme="${theme.id}">
                            <span class="seasonal-theme-icon">${theme.icon}</span>
                            <span class="seasonal-theme-name">${theme.name}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="seasonal-preview-footer">
                    <button class="seasonal-btn-reset" onclick="window.SeasonalManager.resetToCurrentDate()">
                        <i class="fas fa-undo"></i> Сбросить к текущей дате
                    </button>
                    <button class="seasonal-btn-disable" onclick="window.SeasonalManager.removeTheme()">
                        <i class="fas fa-power-off"></i> Отключить
                    </button>
                </div>
            `;

            document.body.appendChild(panel);
            this.previewPanel = panel;

            // Добавляем обработчик Escape
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.closePreviewPanel();
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
        }

        /**
         * Закрывает панель предпросмотра
         */
        closePreviewPanel() {
            if (this.previewPanel) {
                this.previewPanel.style.display = 'none';
            }
        }

        /**
         * Сбрасывает к текущей дате
         */
        resetToCurrentDate() {
            this.removeTheme();
            // Очищаем пользовательский выбор при сбросе
            this.clearUserPreference();
            this.detectAndApply();

            // Обновляем панель
            if (this.previewPanel) {
                const holidayName = this.getCurrentHolidayName();
                const holidayEl = this.previewPanel.querySelector('.seasonal-current-holiday span');
                if (holidayEl) {
                    holidayEl.textContent = `Сейчас: ${holidayName}`;
                }

                // Обновляем активные кнопки
                const buttons = this.previewPanel.querySelectorAll('.seasonal-theme-btn');
                buttons.forEach(btn => {
                    btn.classList.remove('active');
                    if (this.currentTheme && btn.dataset.theme === this.currentTheme.id) {
                        btn.classList.add('active');
                    }
                });
            }
        }


        /**
         * Инициализация при загрузке страницы
         */
        init() {
            // Ждём загрузки DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.detectAndApply();
                    // Дополнительная проверка через 500мс на случай если темы ещё регистрируются
                    setTimeout(() => {
                        if (!this.currentTheme && this.enabled) {
                            this.detectAndApply();
                        }
                    }, 500);
                });
            } else {
                this.detectAndApply();
                // Дополнительная проверка через 500мс
                setTimeout(() => {
                    if (!this.currentTheme && this.enabled) {
                        this.detectAndApply();
                    }
                }, 500);
            }
        }

    }

    // Создаём глобальный экземпляр
    window.SeasonalManager = new SeasonalManager();
})();
