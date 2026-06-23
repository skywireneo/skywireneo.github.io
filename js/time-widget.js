/**
 * Time Status Widget - Button and modal for availability status
 */

(function () {
    'use strict';

    // Configuration loaded from JSON
    let CONFIG = null;
    let timeStatusData = null;

    // Test mode - forced status (null = auto, 'online', 'offline')
    let forcedStatus = null;

    /**
     * Get base path for GitHub Pages compatibility
     */
    function getBasePath() {
        return window.location.pathname.includes('/skywireneo.github.io')
            ? '/skywireneo.github.io'
            : '';
    }

    /**
     * Load time status configuration from JSON
     */
    async function loadTimeStatusConfig() {
        try {
            const basePath = getBasePath();
            const url = `${basePath}/_data/time-status.json`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to load time-status.json');
            }
            timeStatusData = await response.json();

            // Set CONFIG from loaded data with fallbacks
            CONFIG = {
                workStart: timeStatusData.settings?.workStart ?? 10,
                workEnd: timeStatusData.settings?.workEnd ?? 19,
                timeZone: timeStatusData.settings?.timeZone ?? 'Europe/Moscow',
                updateInterval: timeStatusData.settings?.updateInterval ?? 60000
            };
        } catch (error) {
            console.error('TimeWidget: failed to load config, using defaults', error);
            // Fallback defaults
            CONFIG = {
                workStart: 10,
                workEnd: 19,
                timeZone: 'Europe/Moscow',
                updateInterval: 60000
            };
        }
    }

    // DOM Elements
    let statusToggle, statusIcon, statusText;
    let timeStatusModal, timeStatusModalClose, timeStatusModalCloseBtn;
    let modalCurrentTime, modalAvailabilityStatus, modalScheduleProgress;

    /**
     * Update static modal content from JSON
     */
    function updateModalStaticContent() {
        if (!timeStatusData || !timeStatusData.labels) return;

        const labels = timeStatusData.labels;

        // Button title (tooltip)
        if (statusToggle && labels.button && labels.button.title) {
            statusToggle.setAttribute('title', labels.button.title);
        }

        // Schedule title
        const scheduleTitle = document.getElementById('scheduleTitle');
        if (scheduleTitle && labels.modal && labels.modal.scheduleTitle) {
            scheduleTitle.textContent = labels.modal.scheduleTitle;
        }

        // Schedule note
        const scheduleNote = document.getElementById('scheduleNote');
        if (scheduleNote && labels.modal && labels.modal.scheduleNote) {
            let noteText = labels.modal.scheduleNote
                .replace('{workStart}', CONFIG.workStart)
                .replace('{workEnd}', CONFIG.workEnd);
            scheduleNote.textContent = noteText;
        }

        // Response time title
        const responseTimeTitle = document.getElementById('responseTimeTitle');
        if (responseTimeTitle && labels.modal && labels.modal.responseTimeTitle) {
            responseTimeTitle.textContent = labels.modal.responseTimeTitle;
        }

        // Response time text
        const responseTimeText = document.getElementById('responseTimeText');
        if (responseTimeText && labels.modal && labels.modal.responseTimeText) {
            responseTimeText.innerHTML = labels.modal.responseTimeText;
        }

        // Response hint
        const responseHint = document.getElementById('responseHint');
        if (responseHint && labels.modal && labels.modal.responseHint) {
            responseHint.textContent = labels.modal.responseHint;
        }

        // Response checklist
        const responseChecklist = document.getElementById('responseChecklist');
        if (responseChecklist && labels.modal && labels.modal.responseChecklist && Array.isArray(labels.modal.responseChecklist)) {
            responseChecklist.innerHTML = labels.modal.responseChecklist
                .map(item => `<li>${item}</li>`)
                .join('');
        }

        // Urgent note
        const urgentNote = document.getElementById('urgentNote');
        if (urgentNote && labels.modal && labels.modal.urgentNote) {
            urgentNote.textContent = labels.modal.urgentNote;
        }

        // Update schedule markers
        const markerStart = document.getElementById('markerStart');
        const markerMiddle = document.getElementById('markerMiddle');
        const markerEnd = document.getElementById('markerEnd');

        if (markerStart) {
            markerStart.textContent = `${CONFIG.workStart}:00`;
        }
        if (markerMiddle) {
            const middleTime = Math.floor((CONFIG.workStart + CONFIG.workEnd) / 2);
            markerMiddle.textContent = `${middleTime}:00`;
        }
        if (markerEnd) {
            markerEnd.textContent = `${CONFIG.workEnd}:00`;
        }
    }



    /**
     * Initialize the time status widget
     */
    async function init() {
        // Load configuration first
        await loadTimeStatusConfig();

        // Button elements
        statusToggle = document.getElementById('statusToggle');
        statusIcon = document.getElementById('statusIcon');
        statusText = document.getElementById('statusText');

        // Modal elements
        timeStatusModal = document.getElementById('timeStatusModal');
        timeStatusModalClose = document.getElementById('timeStatusModalClose');
        timeStatusModalCloseBtn = document.getElementById('timeStatusModalCloseBtn');
        modalCurrentTime = document.getElementById('modalCurrentTime');
        modalAvailabilityStatus = document.getElementById('modalAvailabilityStatus');
        modalScheduleProgress = document.getElementById('modalScheduleProgress');

        if (!statusToggle) {
            console.warn('Status toggle button not found');
            return;
        }

        // Update static modal content from JSON
        updateModalStaticContent();

        // Bind events
        bindEvents();

        // Initial update
        updateStatus();

        // Update every minute
        setInterval(updateStatus, CONFIG.updateInterval);
    }

    /**
     * Bind click events
     */
    function bindEvents() {
        // Open modal on button click
        statusToggle.addEventListener('click', openModal);

        // Close modal handlers
        if (timeStatusModalClose) {
            timeStatusModalClose.addEventListener('click', closeModal);
        }
        if (timeStatusModalCloseBtn) {
            timeStatusModalCloseBtn.addEventListener('click', closeModal);
        }

        // Close on backdrop click
        if (timeStatusModal) {
            timeStatusModal.addEventListener('click', function (e) {
                if (e.target === timeStatusModal) {
                    closeModal();
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && timeStatusModal && timeStatusModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    /**
     * Update button status display
     */
    function updateStatus() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;

        // Check if online (work hours and weekday) or use forced status
        let isOnline;
        if (forcedStatus === 'online') {
            isOnline = true;
        } else if (forcedStatus === 'offline') {
            isOnline = false;
        } else {
            isOnline = hours >= CONFIG.workStart && hours < CONFIG.workEnd && isWeekday;
        }

        // Update button icon
        if (statusIcon) {
            statusIcon.className = 'fas fa-circle status-icon ' + (isOnline ? 'online' : 'offline');
        }

        // Update button text
        if (statusText) {
            const buttonLabels = timeStatusData?.labels?.button;
            statusText.textContent = isOnline
                ? (buttonLabels?.online ?? 'Онлайн')
                : (buttonLabels?.offline ?? 'Офлайн');
        }

        // Update modal if it's open
        if (timeStatusModal && timeStatusModal.classList.contains('active')) {
            updateModalContent();
        }
    }

    /**
     * Update modal content
     */
    function updateModalContent() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;

        // Use forced status if set, otherwise calculate from time
        let isOnline;
        if (forcedStatus === 'online') {
            isOnline = true;
        } else if (forcedStatus === 'offline') {
            isOnline = false;
        } else {
            isOnline = hours >= CONFIG.workStart && hours < CONFIG.workEnd && isWeekday;
        }

        // Update time display
        if (modalCurrentTime) {
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            modalCurrentTime.textContent = timeString;
        }

        // Update availability status
        if (modalAvailabilityStatus) {
            const statusDot = modalAvailabilityStatus.querySelector('.status-dot');
            const statusText = modalAvailabilityStatus.querySelector('.status-text');

            if (statusDot) {
                statusDot.className = 'status-dot ' + (isOnline ? 'online' : 'offline');
            }
            if (statusText) {
                const modalLabels = timeStatusData?.labels?.modal;
                if (forcedStatus === 'online') {
                    statusText.textContent = modalLabels?.testOnline ?? 'Тест: принудительно онлайн';
                } else if (forcedStatus === 'offline') {
                    statusText.textContent = modalLabels?.testOffline ?? 'Тест: принудительно офлайн';
                } else if (isOnline) {
                    statusText.textContent = modalLabels?.online ?? 'Сейчас на связи';
                } else if (!isWeekday) {
                    statusText.textContent = modalLabels?.weekend ?? 'Выходной — отвечу в понедельник';
                } else if (hours < CONFIG.workStart) {
                    const beforeWorkText = modalLabels?.beforeWork ?? 'Ещё не работаю — начинаю в {time}';
                    statusText.textContent = beforeWorkText.replace('{time}', `${CONFIG.workStart}:00`);
                } else {
                    const afterWorkText = modalLabels?.afterWork ?? 'Уже закончил — до завтра {time}';
                    statusText.textContent = afterWorkText.replace('{time}', `${CONFIG.workStart}:00`);
                }
            }
        }

        // Update schedule progress
        updateScheduleProgress(hours, minutes);
    }

    /**
     * Update the visual schedule progress bar in modal
     */
    function updateScheduleProgress(currentHour, currentMinute) {
        if (!modalScheduleProgress) return;

        const totalMinutes = (CONFIG.workEnd - CONFIG.workStart) * 60;
        const currentMinutes = (currentHour - CONFIG.workStart) * 60 + currentMinute;

        let progressPercent = 0;

        if (currentHour < CONFIG.workStart) {
            progressPercent = 0;
        } else if (currentHour >= CONFIG.workEnd) {
            progressPercent = 100;
        } else {
            progressPercent = (currentMinutes / totalMinutes) * 100;
        }

        modalScheduleProgress.style.width = `${progressPercent}%`;
    }

    /**
     * Open the time status modal
     */
    function openModal() {
        if (!timeStatusModal) return;

        updateModalContent();
        timeStatusModal.classList.add('active');
        timeStatusModal.classList.remove('closing');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close the time status modal
     */
    function closeModal() {
        if (!timeStatusModal) return;

        timeStatusModal.classList.add('closing');
        timeStatusModal.classList.remove('active');

        setTimeout(() => {
            timeStatusModal.classList.remove('closing');
            document.body.style.overflow = '';
        }, 300);
    }

    // Test control functions
    function setForcedStatus(status) {
        forcedStatus = status;
        updateStatus();
    }

    function getForcedStatus() {
        return forcedStatus;
    }

    // Expose test API globally
    window.TimeStatusTest = {
        setOnline: function () { setForcedStatus('online'); },
        setOffline: function () { setForcedStatus('offline'); },
        setAuto: function () { setForcedStatus(null); },
        getStatus: getForcedStatus
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
