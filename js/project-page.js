// Project Page Scripts
(function() {
    // Prevent double initialization
    if (window.projectPageInitialized) return;
    window.projectPageInitialized = true;

    // TOC Generation - only once
    const sections = document.querySelectorAll('.project-page-section');
    const tocList = document.getElementById('projectTocList');
    if (sections.length > 0 && tocList && tocList.children.length === 0) {
        sections.forEach((section, index) => {
            const title = section.querySelector('.project-page-section-title')?.textContent?.trim() || `Раздел ${index + 1}`;
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#section-${index + 1}`;
            link.textContent = title;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            li.appendChild(link);
            tocList.appendChild(li);
        });
    }

    // Share Button
    const shareBtn = document.querySelector('.project-page-btn.share');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const url = shareBtn.dataset.shareUrl || window.location.href;
            const title = shareBtn.dataset.shareTitle || 'Проект';
            
            if (navigator.share) {
                navigator.share({ title: title, url: url }).catch(() => {});
            } else {
                navigator.clipboard.writeText(url).then(() => {
                    const originalText = shareBtn.innerHTML;
                    shareBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
                    setTimeout(() => { shareBtn.innerHTML = originalText; }, 2000);
                });
            }
        });
    }

    // Gallery Lightbox
    const galleryItems = document.querySelectorAll('.project-gallery-item');
    if (galleryItems.length > 0 && window.openLightbox) {
        const images = Array.from(galleryItems).map(img => ({
            src: img.dataset.src,
            title: img.dataset.title,
            desc: img.dataset.desc
        }));
        
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                window.openLightbox(images, index, document.querySelector('.project-page-title')?.textContent || 'Проект');
            });
        });
    }
})();
