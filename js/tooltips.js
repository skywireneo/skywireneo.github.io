// Tooltips - система тултипов с задержкой
// Файл: js/tooltips.js

(function () {
    'use strict';

    class TooltipManager {
        constructor() {
            this.tooltip = null;
            this.currentElement = null;
            this.showTimeout = null;
            this.hideTimeout = null;
            this.delay = 500; // Задержка 500ms
            this.hideDelay = 100; // Задержка перед скрытием

            // Привязываем методы
            this.init = this.init.bind(this);
            this.handleMouseEnter = this.handleMouseEnter.bind(this);
            this.handleMouseLeave = this.handleMouseLeave.bind(this);
            this.handleFocus = this.handleFocus.bind(this);
            this.handleBlur = this.handleBlur.bind(this);
            this.showTooltip = this.showTooltip.bind(this);
            this.hideTooltip = this.hideTooltip.bind(this);
            this.createTooltip = this.createTooltip.bind(this);
            this.positionTooltip = this.positionTooltip.bind(this);
            this.getTooltipText = this.getTooltipText.bind(this);
        }

        /**
         * Инициализация
         */
        init() {
            // Создаём элемент тултипа
            this.createTooltip();

            // Навешиваем обработчики на элементы с data-tooltip или title
            this.attachEventListeners();
        }

        /**
         * Создаёт DOM элемент тултипа
         */
        createTooltip() {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'tooltip';
            this.tooltip.setAttribute('role', 'tooltip');
            this.tooltip.innerHTML = `
                <div class="tooltip-content"></div>
                <div class="tooltip-arrow"></div>
            `;
            document.body.appendChild(this.tooltip);
        }

        /**
         * Навешивает обработчики событий
         */
        attachEventListeners() {
            // Обработчики для элементов с data-tooltip
            const elementsWithTooltip = document.querySelectorAll('[data-tooltip], [title]');

            elementsWithTooltip.forEach(el => {
                // Убираем стандартный title чтобы не было двойных тултипов
                if (el.hasAttribute('title')) {
                    el.dataset.originalTitle = el.getAttribute('title');
                    el.removeAttribute('title');
                }

                // Навешиваем наши обработчики
                el.addEventListener('mouseenter', this.handleMouseEnter);
                el.addEventListener('mouseleave', this.handleMouseLeave);
                el.addEventListener('focus', this.handleFocus);
                el.addEventListener('blur', this.handleBlur);
            });

            // Обновляем обработчики при динамическом добавлении элементов
            this.setupMutationObserver();
        }

        /**
         * Наблюдатель за изменениями DOM для новых элементов
         */
        setupMutationObserver() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Проверяем добавленный элемент и его детей
                            const newElements = node.matches?.('[data-tooltip], [title]')
                                ? [node]
                                : [];
                            const children = node.querySelectorAll?.('[data-tooltip], [title]') || [];

                            [...newElements, ...children].forEach(el => {
                                if (el.hasAttribute('title')) {
                                    el.dataset.originalTitle = el.getAttribute('title');
                                    el.removeAttribute('title');
                                }

                                el.addEventListener('mouseenter', this.handleMouseEnter);
                                el.addEventListener('mouseleave', this.handleMouseLeave);
                                el.addEventListener('focus', this.handleFocus);
                                el.addEventListener('blur', this.handleBlur);
                            });
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        /**
         * Обработчик наведения мыши
         */
        handleMouseEnter(e) {
            const element = e.target;
            const text = this.getTooltipText(element);

            if (!text) return;

            // Очищаем предыдущий таймаут скрытия
            clearTimeout(this.hideTimeout);

            // Устанавливаем таймаут показа
            this.showTimeout = setTimeout(() => {
                this.showTooltip(element, text);
            }, this.delay);
        }

        /**
         * Обработчик ухода мыши
         */
        handleMouseLeave(e) {
            // Очищаем таймаут показа
            clearTimeout(this.showTimeout);

            // Устанавливаем таймаут скрытия
            this.hideTimeout = setTimeout(() => {
                this.hideTooltip();
            }, this.hideDelay);
        }

        /**
         * Обработчик фокуса (для accessibility)
         */
        handleFocus(e) {
            const element = e.target;
            const text = this.getTooltipText(element);

            if (!text) return;

            // Для фокуса показываем сразу без задержки
            this.showTooltip(element, text);
        }

        /**
         * Обработчик потери фокуса
         */
        handleBlur(e) {
            this.hideTooltip();
        }

        /**
         * Получает текст тултипа
         */
        getTooltipText(element) {
            // Приоритет: data-tooltip > data-original-title (бывший title)
            return element.getAttribute('data-tooltip') ||
                element.dataset.originalTitle ||
                '';
        }

        /**
         * Показывает тултип
         */
        showTooltip(element, text) {
            if (!this.tooltip) return;

            this.currentElement = element;

            // Устанавливаем текст
            const content = this.tooltip.querySelector('.tooltip-content');
            content.textContent = text;

            // Позиционируем
            this.positionTooltip(element);

            // Показываем
            this.tooltip.classList.add('visible');
        }

        /**
         * Скрывает тултип
         */
        hideTooltip() {
            if (!this.tooltip) return;

            this.tooltip.classList.remove('visible');
            this.currentElement = null;
        }

        /**
         * Позиционирует тултип относительно элемента
         */
        positionTooltip(element) {
            const rect = element.getBoundingClientRect();
            const tooltipRect = this.tooltip.getBoundingClientRect();

            // Определяем лучшую позицию
            let position = 'top';
            let top, left;

            // Проверяем место сверху
            const spaceTop = rect.top;
            // Проверяем место снизу
            const spaceBottom = window.innerHeight - rect.bottom;
            // Проверяем место слева
            const spaceLeft = rect.left;
            // Проверяем место справа
            const spaceRight = window.innerWidth - rect.right;

            // Выбираем позицию с наибольшим пространством
            if (spaceTop >= tooltipRect.height + 10) {
                position = 'top';
                top = rect.top - tooltipRect.height - 8;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            } else if (spaceBottom >= tooltipRect.height + 10) {
                position = 'bottom';
                top = rect.bottom + 8;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            } else if (spaceRight >= tooltipRect.width + 10) {
                position = 'right';
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + 8;
            } else if (spaceLeft >= tooltipRect.width + 10) {
                position = 'left';
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - 8;
            } else {
                // По умолчанию сверху, даже если не влезает
                position = 'top';
                top = rect.top - tooltipRect.height - 8;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            }

            // Проверяем границы экрана
            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }
            if (top < 10) top = 10;

            // Применяем позицию
            this.tooltip.style.top = `${top + window.scrollY}px`;
            this.tooltip.style.left = `${left + window.scrollX}px`;
            this.tooltip.setAttribute('data-position', position);
        }
    }

    // Инициализация при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.TooltipManager = new TooltipManager();
            window.TooltipManager.init();
        });
    } else {
        window.TooltipManager = new TooltipManager();
        window.TooltipManager.init();
    }
})();
