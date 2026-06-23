/**
 * Client page — "Для заказчика"
 * Checklist persistence, smooth FAQ, minor enhancements
 */
(function () {
    'use strict';

    const CHECKLIST_KEY = 'client-checklist-state';

    function saveChecklistState() {
        const checkboxes = document.querySelectorAll('.checklist-checkbox');
        const state = Array.from(checkboxes).map(cb => cb.checked);
        localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
    }

    function restoreChecklistState() {
        const saved = localStorage.getItem(CHECKLIST_KEY);
        if (!saved) return;
        try {
            const state = JSON.parse(saved);
            const checkboxes = document.querySelectorAll('.checklist-checkbox');
            checkboxes.forEach((cb, i) => {
                if (state[i]) {
                    cb.checked = true;
                    cb.closest('.client-checklist-item')?.classList.add('checked');
                }
            });
        } catch (e) { /* ignore */ }
    }

    function initFAQ() {
        const details = document.querySelectorAll('.client-faq-item');
        details.forEach(detail => {
            detail.addEventListener('toggle', () => {
                if (detail.open) {
                    details.forEach(other => {
                        if (other !== detail && other.open) other.open = false;
                    });
                }
            });
        });
    }

    function initChecklistFeedback() {
        const items = document.querySelectorAll('.client-checklist-item');
        items.forEach(item => {
            const cb = item.querySelector('.checklist-checkbox');
            if (!cb) return;
            cb.addEventListener('change', () => {
                item.classList.toggle('checked', cb.checked);
                saveChecklistState();
            });
        });
    }

    function initScrollAnimations() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        restoreChecklistState();
        initFAQ();
        initChecklistFeedback();
        initScrollAnimations();
    });
})();
