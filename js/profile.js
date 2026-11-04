/* ============================================
   PROFILE SECTION - Dynamic data loading from JSON
   ============================================ */

let profileData = null;
let aboutModalData = null;
let contactsData = null;
let resumeData = null;

/**
 * Get base path for GitHub Pages compatibility
 */
function getBasePath() {
    return window.location.pathname.includes('/skywireneo.github.io')
        ? '/skywireneo.github.io'
        : '';
}

/**
 * Load profile data from JSON
 */
async function loadProfileData() {
    try {
        const basePath = getBasePath();

        // Load contacts.json (profile + resume + contacts)
        const contactsUrl = `${basePath}/_data/contacts.json`;
        const contactsResponse = await fetch(contactsUrl);
        if (!contactsResponse.ok) {
            throw new Error('Failed to load contacts.json');
        }
        const contactsJson = await contactsResponse.json();
        profileData = contactsJson.profile || null;
        resumeData = contactsJson.resume || null;
        contactsData = contactsJson.contacts || [];

        // Load about.json (resumeModal)
        const aboutUrl = `${basePath}/_data/about.json`;
        const aboutResponse = await fetch(aboutUrl);
        if (!aboutResponse.ok) {
            throw new Error('Failed to load about.json');
        }
        const aboutJson = await aboutResponse.json();
        aboutModalData = aboutJson.resumeModal || null;

        // Render all sections
        renderHeader();
        renderContacts();
        renderResumeModal();
        initResumeButton();
        initCopyEmailButton();

    } catch (error) {
        console.error('Profile: failed to load data', error);
    }
}

/**
 * Get status CSS class based on status text
 */
function getStatusClass(status) {
    const statusClasses = {
        'Открыт к предложениям': 'status-open',
        'В поиске работы': 'status-searching',
        'Рассматриваю предложения': 'status-considering',
        'Занят на проекте': 'status-busy',
        'Не ищу работу': 'status-not-looking',
        'В отпуске': 'status-vacation'
    };

    return statusClasses[status] || '';
}

/**
 * Render header section
 */
function renderHeader() {
    if (!profileData) return;

    // Avatar
    const avatarImg = document.querySelector('[data-avatar]');
    if (avatarImg && profileData.avatar) {
        avatarImg.src = profileData.avatar;
        avatarImg.alt = `${profileData.name} ${profileData.nickname}`;
    }

    // Name
    const nameEl = document.getElementById('profileName');
    if (nameEl && profileData.name && profileData.nickname) {
        nameEl.textContent = `${profileData.name} ${profileData.nickname}`;
    }

    // Title
    const titleEl = document.getElementById('profileTitle');
    if (titleEl && profileData.title) {
        titleEl.textContent = profileData.title;
    }

    // Location
    const locationEl = document.getElementById('profileLocation');
    if (locationEl && profileData.location) {
        locationEl.textContent = profileData.location;
    }

    // Status with dynamic CSS class
    const statusEl = document.getElementById('profileStatus');
    if (statusEl && profileData.status) {
        statusEl.textContent = profileData.status;
        // Remove old status classes
        statusEl.classList.remove('status-open', 'status-searching', 'status-considering', 'status-busy', 'status-not-looking', 'status-vacation');
        // Add new status class
        const statusClass = getStatusClass(profileData.status);
        if (statusClass) {
            statusEl.classList.add(statusClass);
        }
    }

    // Resume button text
    const resumeBtnText = document.getElementById('resumeBtnText');
    if (resumeBtnText && aboutModalData && aboutModalData.resumeButtonText) {
        resumeBtnText.textContent = aboutModalData.resumeButtonText;
    }
}

/**
 * Render contacts from JSON
 */
function renderContacts() {
    if (!contactsData || contactsData.length === 0) return;

    // Filter primary contacts and sort by order
    const primaryContacts = contactsData
        .filter(contact => contact.isPrimary)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const container = document.getElementById('profileContacts');
    if (!container) return;

    // Clear container
    container.innerHTML = '';

    // Render each contact
    primaryContacts.forEach(contact => {
        // Email has special design with copy button
        if (contact.id === 'email') {
            const emailEl = document.createElement('div');
            emailEl.className = 'contact-link email-with-copy';
            emailEl.innerHTML = `
                <a href="${contact.url}" class="email-highlight">
                    <i class="${contact.icon}"></i> <span>${resumeData?.email || 'skywireneo@yandex.ru'}</span>
                </a>
                <button class="copy-email-btn" onclick="copyEmail()" title="Копировать почту">
                    <i class="fas fa-copy"></i>
                </button>
            `;
            container.appendChild(emailEl);
        } else {
            // Regular contact link
            const linkEl = document.createElement('a');
            linkEl.href = contact.url;
            linkEl.target = '_blank';
            linkEl.className = 'contact-link';
            linkEl.innerHTML = `<i class="${contact.icon}"></i> <span>${contact.name}</span>`;
            container.appendChild(linkEl);
        }
    });

    // Add resume button at the end
    // const resumeBtn = document.createElement('a');
    // resumeBtn.href = '#';
    // resumeBtn.id = 'resumeDownloadBtn';
    // resumeBtn.className = 'contact-link resume-btn';
    // const btnText = (aboutModalData && aboutModalData.resumeButtonText) ? aboutModalData.resumeButtonText : 'Резюме';
    // resumeBtn.innerHTML = `<i class="fas fa-download"></i> <span>${btnText}</span>`;
    // container.appendChild(resumeBtn);

}


/**
 * Render resume modal
 */
function renderResumeModal() {
    if (!aboutModalData || !resumeData) return;

    // Modal title
    const modalTitle = document.getElementById('resumeModalTitle');
    if (modalTitle && aboutModalData.title) {
        modalTitle.innerHTML = `<i class="fas fa-shield-alt" style="color: var(--accent); margin-right: 0.5rem;"></i>${aboutModalData.title}`;
    }

    // Modal description paragraphs
    const modalDesc1 = document.getElementById('resumeModalDesc1');
    if (modalDesc1 && aboutModalData.description) {
        modalDesc1.textContent = aboutModalData.description;
    }

    const modalDesc2 = document.getElementById('resumeModalDesc2');
    if (modalDesc2 && aboutModalData.note) {
        modalDesc2.textContent = aboutModalData.note;
    }

    // Hint text
    const modalHint = document.getElementById('resumeModalHint');
    if (modalHint && aboutModalData.hint) {
        modalHint.innerHTML = `<i class="fas fa-info-circle" style="margin-right: 0.3rem;"></i>${aboutModalData.hint}`;
    }

    // Email text
    const emailText = document.getElementById('resumeModalEmail');
    if (emailText && resumeData.email) {
        emailText.textContent = resumeData.email;
    }

    // Download link
    const downloadLink = document.getElementById('resumeDownloadLink');
    if (downloadLink && resumeData.path) {
        downloadLink.href = resumeData.path;
        if (aboutModalData.downloadButtonText) {
            downloadLink.innerHTML = `<i class="fas fa-download"></i> ${aboutModalData.downloadButtonText}`;
        }
    }
}

/**
 * Initialize resume button click handler
 */
function initResumeButton() {
    const resumeBtn = document.getElementById('resumeDownloadBtn');
    const resumeModal = document.getElementById('resumeModal');

    if (resumeBtn && resumeModal) {
        resumeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resumeModal.style.display = 'flex';
            setTimeout(() => {
                resumeModal.classList.add('active');
            }, 10);
        });
    }

    // Close buttons
    const closeBtn = document.getElementById('modalClose');
    const closeBtn2 = document.getElementById('modalCloseBtn');
    const modalOverlay = document.getElementById('resumeModal');

    const closeModal = () => {
        if (resumeModal) {
            resumeModal.classList.remove('active');
            setTimeout(() => {
                resumeModal.style.display = 'none';
            }, 300);
        }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }
}

/**
 * Initialize copy email button in modal
 */
function initCopyEmailButton() {
    const copyBtn = document.getElementById('copyEmail');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyEmail);
    }
}

/**
 * Copy email to clipboard
 */
function copyEmail() {
    const emailText = document.getElementById('resumeModalEmail');
    const email = emailText ? emailText.textContent : 'skywireneo@yandex.ru';

    navigator.clipboard.writeText(email).then(() => {
        // Update all copy buttons
        const buttons = document.querySelectorAll('.copy-email-btn, .copy-btn-large, #copyEmail');
        buttons.forEach(btn => {
            const originalIcon = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.style.background = 'var(--accent)';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.innerHTML = originalIcon;
                btn.style.background = '';
                btn.style.color = '';
            }, 1500);
        });
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
});

// Export for potential use
window.loadProfileData = loadProfileData;
window.copyEmail = copyEmail;
