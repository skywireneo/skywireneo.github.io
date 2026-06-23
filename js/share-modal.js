// Share - uses native navigator.share() where available
(function () {
    document.querySelectorAll('.site-share-btn, .project-share-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const projectCard = btn.closest('.project-card');
            const title = projectCard?.querySelector('h3')?.textContent || 'Backend / Fullstack Разработчик / Программный инженер / Менеджер по ИТ';
            const url = projectCard?.dataset.url || window.location.href;

            if (navigator.share) {
                try {
                    await navigator.share({ title, url });
                } catch (err) {
                    if (err.name !== 'AbortError') console.warn('Share failed:', err);
                }
            } else {
                // Fallback: copy to clipboard
                try {
                    await navigator.clipboard.writeText(url);
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-check';
                        setTimeout(() => { icon.className = 'fas fa-share-alt'; }, 1500);
                    }
                } catch (err) {
                    console.warn('Copy failed:', err);
                }
            }
        });
    });
})();
