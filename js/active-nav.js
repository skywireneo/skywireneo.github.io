/* ============================================
   ACTIVE SECTION INDICATOR
   ============================================ */

class ActiveSectionIndicator {
    constructor() {
        this.nav = document.getElementById('stickyNav');
        this.links = this.nav ? this.nav.querySelectorAll('a[href^="#"]') : [];
        this.sections = [];
        this.currentActive = null;

        this.init();
    }

    init() {
        if (this.links.length === 0) return;

        // Get all sections that correspond to nav links
        this.links.forEach(link => {
            const targetId = link.getAttribute('href');
            const section = document.querySelector(targetId);
            if (section) {
                this.sections.push({
                    id: targetId,
                    element: section,
                    link: link
                });
            }
        });

        // Bind scroll event with throttling
        this.throttledUpdate = this.throttle(() => this.updateActiveSection(), 100);
        window.addEventListener('scroll', this.throttledUpdate);

        // Initial check
        this.updateActiveSection();
    }

    updateActiveSection() {
        const scrollPos = window.scrollY + 150; // Offset for sticky nav

        // Find current section
        let current = null;

        for (let i = this.sections.length - 1; i >= 0; i--) {
            const section = this.sections[i];
            const sectionTop = section.element.offsetTop;

            if (scrollPos >= sectionTop) {
                current = section;
                break;
            }
        }

        // Update active state
        if (current && current.id !== this.currentActive) {
            // Remove active from all
            this.links.forEach(link => {
                link.classList.remove('active');
            });

            // Add active to current
            current.link.classList.add('active');
            this.currentActive = current.id;
        }
    }

    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ActiveSectionIndicator();
});
