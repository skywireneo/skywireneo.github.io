/* ============================================
   SKILL BARS ANIMATION
   ============================================ */

class SkillBarsAnimation {
    constructor() {
        this.skillBars = document.querySelectorAll('.skill-bar-fill');
        this.animated = false;
        this.init();
    }

    init() {
        if (this.skillBars.length === 0) return;

        // Use Intersection Observer for scroll-triggered animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animate();
                    this.animated = true;
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe the first skill bar container
        const container = this.skillBars[0].closest('.skill-bar-container');
        if (container) {
            observer.observe(container);
        }
    }

    animate() {
        this.skillBars.forEach((bar, index) => {
            // Staggered animation
            setTimeout(() => {
                const level = bar.getAttribute('data-level-percent') || '0';
                bar.style.width = level + '%';
                bar.classList.add('animate');
            }, index * 100); // 100ms delay between each
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SkillBarsAnimation();
});
