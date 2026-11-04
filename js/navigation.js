// Sticky navigation + Mobile hamburger menu
(function () {
    'use strict';

    // Debounce helper
    function debounce(fn, ms) {
        let timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, arguments), ms);
        };
    }

    const stickyNav = document.getElementById('stickyNav');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const progressBar = document.getElementById('progressBar');
    const scrollToTopBtn = document.getElementById('scrollToTop');

    let lastScrollY = window.scrollY;

    // Mobile menu toggle
    function toggleMobileMenu() {
        if (!stickyNav || !mobileMenu || !mobileMenuOverlay) return;
        stickyNav.classList.toggle('mobile-menu-open');
        mobileMenu.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
        if (mobileMenuToggle) mobileMenuToggle.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }

    // Event listeners
    if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    if (mobileMenuClose) mobileMenuClose.addEventListener('click', toggleMobileMenu);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', toggleMobileMenu);

    // Mobile nav links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => { toggleMobileMenu(); });
    });

    // Close mobile menu on resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            if (stickyNav) stickyNav.classList.remove('mobile-menu-open');
            if (mobileMenu) mobileMenu.classList.remove('active');
            if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
            if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });

    // Scroll handler (debounced)
    function handleScroll() {
        const currentScrollY = window.scrollY;
        if (stickyNav) {
            if (currentScrollY > 300) stickyNav.classList.add('visible');
            else stickyNav.classList.remove('visible');
        }
        if (progressBar) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) progressBar.style.width = ((currentScrollY / docHeight) * 100) + '%';
        }
        if (scrollToTopBtn) {
            if (currentScrollY > 500) scrollToTopBtn.classList.add('visible');
            else scrollToTopBtn.classList.remove('visible');
        }
        lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', debounce(handleScroll, 16), { passive: true });

    // Smooth scroll for navigation links
    document.querySelectorAll('.sticky-nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Scroll to top
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    // Extra experience accordion
    (function () {
        const accordionHeader = document.querySelector('.accordion-item');
        const accordionContent = document.getElementById('extra-content');
        const accordionIcon = document.querySelector('.accordion-icon');
        if (accordionHeader && accordionContent && accordionIcon) {
            accordionHeader.addEventListener('click', function () {
                const isOpen = accordionContent.classList.contains('active');
                accordionContent.classList.toggle('active');
                accordionIcon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            });
        }
    })();
})();
