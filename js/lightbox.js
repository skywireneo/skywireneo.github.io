// Lightbox carousel functionality
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxProjectName = document.getElementById('lightboxProjectName');
const lightboxImageTitle = document.getElementById('lightboxImageTitle');
const lightboxThumbnails = document.getElementById('lightboxThumbnails');
const lightboxClose = document.getElementById('lightboxClose');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let images = [];
let currentIndex = 0;
let currentProjectName = '';

// Initialize lightbox for all project images
document.querySelectorAll('.project-card').forEach(card => {
    const projectTitle = card.querySelector('h3').textContent;
    const imgs = Array.from(card.querySelectorAll('.project-images img'));

    imgs.forEach((img, idx) => {
        img.addEventListener('click', () => {
            images = imgs;
            currentIndex = idx;
            currentProjectName = projectTitle;
            showLightbox();
        });
    });
});

function showLightbox() {
    updateLightbox();
    lightbox.style.display = 'flex';

    // Trigger reflow to ensure animation plays
    void lightbox.offsetWidth;

    // Add opening class for animation
    lightbox.classList.add('opening');
    document.body.classList.add('modal-open');
    document.body.classList.add('lightbox-open');
}



function updateLightbox() {
    const currentImg = images[currentIndex];
    lightboxImg.src = currentImg.src;
    lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
    lightboxProjectName.textContent = currentProjectName;

    const title = currentImg.getAttribute('data-title') || currentImg.alt;
    const desc = currentImg.getAttribute('data-desc') || '';
    lightboxImageTitle.textContent = desc ? `${title} — ${desc}` : title;

    updateThumbnails();
}

function updateThumbnails() {
    lightboxThumbnails.innerHTML = '';
    images.forEach((img, idx) => {
        const thumb = document.createElement('img');
        thumb.src = img.src;
        thumb.className = 'lightbox-thumb';
        thumb.title = img.getAttribute('data-title') || img.alt;
        if (idx === currentIndex) {
            thumb.classList.add('active');
        }
        thumb.addEventListener('click', () => {
            currentIndex = idx;
            updateLightbox();
        });
        lightboxThumbnails.appendChild(thumb);
    });

    // Scroll to active thumbnail
    const activeThumb = lightboxThumbnails.querySelector('.active');
    if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
}

function changeImage(step) {
    currentIndex = (currentIndex + step + images.length) % images.length;
    updateLightbox();
}



function closeLightbox() {
    // Add closing class for animation
    lightbox.classList.remove('opening');
    lightbox.classList.add('closing');

    // Wait for animation to finish before hiding
    setTimeout(() => {
        lightbox.style.display = 'none';
        lightbox.classList.remove('closing');
        document.body.classList.remove('modal-open');
        document.body.classList.remove('lightbox-open');
    }, 400);
}



// Event listeners
prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    changeImage(-1);
});

nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    changeImage(1);
});

lightboxClose.addEventListener('click', closeLightbox);

// Close on background click
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-main')) {
        closeLightbox();
    }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.display === 'flex') {
        closeLightbox();
    }
});

// Global function for project page
window.openLightbox = function(projectImages, startIndex, projectName) {
    images = projectImages.map(img => ({
        src: img.src,
        getAttribute: (attr) => {
            if (attr === 'data-title') return img.title;
            if (attr === 'data-desc') return img.desc;
            return img.alt || img.title;
        },
        alt: img.title || ''
    }));
    currentIndex = startIndex;
    currentProjectName = projectName;
    showLightbox();
};
