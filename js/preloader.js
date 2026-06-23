/**
 * Preloader - SkyWireNEO
 * Плавный экран загрузки с анимацией текста
 * Настройки загружаются из _data/preloader.json

 */

(function () {
    'use strict';

    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    let config = null;

    let startTime = Date.now();
    let isLoaded = false;

    /**
     * Load configuration from JSON - ONLY source of settings
     */
    async function loadConfig() {
        try {
            // Get base path for GitHub Pages compatibility
            const basePath = window.location.pathname.includes('/skywireneo.github.io')
                ? '/skywireneo.github.io'
                : '';
            const response = await fetch(`${basePath}/_data/preloader.json`);

            if (response.ok) {
                config = await response.json();
            } else {
                console.error('Preloader: failed to load config, response not OK');
            }
        } catch (error) {
            console.error('Preloader: failed to load config', error);
        }
    }



    /**
     * Скрыть preloader с анимацией
     */
    function hidePreloader() {
        // Use config from JSON only - no hardcoded defaults
        const timing = config?.timing || {};
        const minDisplayTime = timing.minDisplayTime || 1000;
        const exitDelay = timing.exitDelay || 500;
        const exitDuration = timing.exitDuration || 600;

        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);
        const totalDelay = remainingTime + exitDelay;

        setTimeout(() => {
            preloader.classList.add('exiting');

            setTimeout(() => {
                preloader.classList.add('hidden');

                setTimeout(() => {
                    if (preloader.parentNode) {
                        preloader.parentNode.removeChild(preloader);
                    }
                    document.dispatchEvent(new CustomEvent('preloaderComplete'));
                }, 100);

            }, exitDuration);

        }, totalDelay);
    }


    /**
     * Обработчик полной загрузки страницы
     */
    function onPageLoad() {
        if (isLoaded) return;
        isLoaded = true;
        hidePreloader();
    }

    // Apply settings from data-* attributes + JSON config
    function applyPreloaderConfig() {
        const preloaderEl = document.getElementById('preloader');
        if (!preloaderEl) return;

        // CSS Custom Properties from data-*
        const root = document.documentElement;
        root.style.setProperty('--preloader-gradient-start', preloaderEl.dataset.gradientStart);
        root.style.setProperty('--preloader-gradient-end', preloaderEl.dataset.gradientEnd);

        // Toggle visibility based on data-show-*
        const showProgress = preloaderEl.dataset.showProgressBar !== 'false';
        const showPageName = preloaderEl.dataset.showPageName !== 'false';
        const showLoadingText = preloaderEl.dataset.showLoadingText !== 'false';

        const progressLine = preloaderEl.querySelector('.preloader-line');
        const pageName = preloaderEl.querySelector('.preloader-page-name');
        const loadingText = preloaderEl.querySelector('.preloader-loading-text');

        if (progressLine) progressLine.style.display = showProgress ? 'block' : 'none';
        if (pageName) pageName.style.display = showPageName ? 'block' : 'none';
        if (loadingText) loadingText.style.display = showLoadingText ? 'flex' : 'none';
    }

    // Initialize
    loadConfig().then(() => {
        applyPreloaderConfig(); // Apply data-* settings immediately

        // Config loaded, now wait for page load
        if (document.readyState === 'complete') {
            onPageLoad();
        } else {
            window.addEventListener('load', onPageLoad);
            const reserveTimeout = config?.timing?.reserveTimeout || 5000;
            setTimeout(onPageLoad, reserveTimeout);
        }
    });

    // Public API
    window.SkyWirePreloader = {
        hide: hidePreloader,
        isActive: () => !preloader.classList.contains('hidden'),
        getConfig: () => config
    };

})();
