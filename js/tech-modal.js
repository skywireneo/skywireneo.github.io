// Tech Modal functionality - global version

let techData = null;
let projectsData = null;
let experienceData = null;

/**
 * Load all data from JSON files
 */
async function loadAllData() {
    try {
        // Get base path for GitHub Pages compatibility
        const basePath = window.location.pathname.includes('/skywireneo.github.io')
            ? '/skywireneo.github.io'
            : '';

        // Load technologies
        const techUrl = `${basePath}/_data/technologies.json`;
        const techResponse = await fetch(techUrl);
        if (techResponse.ok) {
            const techJson = await techResponse.json();
            techData = {};
            techJson.technologies.forEach(tech => {
                techData[tech.id] = tech;
            });
            // Export for other scripts
            window.techData = techData;
        }

        // Load projects
        const projectsUrl = `${basePath}/_data/projects.json`;
        const projectsResponse = await fetch(projectsUrl);
        if (projectsResponse.ok) {
            projectsData = await projectsResponse.json();
        }

        // Load experience
        const experienceUrl = `${basePath}/_data/experience.json`;
        const experienceResponse = await fetch(experienceUrl);
        if (experienceResponse.ok) {
            experienceData = await experienceResponse.json();
        }
    } catch (error) {
        console.error('Tech Modal: failed to load data', error);
    }
}

/**
 * Get project title by ID
 */
function getProjectTitle(projectId) {
    if (!projectsData) return null;

    // Check visible projects
    if (projectsData.projects) {
        const project = projectsData.projects.find(p => p.id === projectId);
        if (project) return project.title;
    }

    // Check hidden project
    if (projectsData.hiddenProject && projectsData.hiddenProject.id === projectId) {
        return projectsData.hiddenProject.title;
    }

    return null;
}

/**
 * Get experience company by ID
 */
function getExperienceCompany(expId) {
    if (!experienceData || !experienceData.experience) return null;

    const exp = experienceData.experience.find(e => e.id === expId);
    if (exp) return exp.company;

    return null;
}

function openTechModal(techId) {
    const techModal = document.getElementById('techModal');

    if (!techData || !techData[techId]) {
        console.warn('Tech Modal: no data for techId', techId);
        return;
    }

    const tech = techData[techId];
    const details = tech.details || {};
    const flags = tech.flags || {};

    // Update modal title
    const titleEl = document.getElementById('techModalTitle');
    if (titleEl) {
        // Clear existing content
        titleEl.innerHTML = '';

        // Create title wrapper
        const titleWrapper = document.createElement('div');
        titleWrapper.className = 'tech-title-wrapper';

        // Add icon if exists
        if (tech.icon) {
            const iconEl = document.createElement('i');
            iconEl.className = tech.icon;
            iconEl.style.marginRight = '0.5rem';
            iconEl.style.color = tech.color || 'var(--accent)';
            titleWrapper.appendChild(iconEl);
        }

        // Create title text
        const titleText = document.createElement('span');
        titleText.textContent = tech.name;
        titleWrapper.appendChild(titleText);

        // Add status badge
        if (flags.hasExperience) {
            const statusBadge = document.createElement('div');
            statusBadge.className = 'tech-status-badge status-past';
            statusBadge.innerHTML = '<i class="fas fa-history"></i> Сейчас активно не использую';
            titleWrapper.appendChild(statusBadge);
        } else if (flags.isLearning) {
            const statusBadge = document.createElement('div');
            statusBadge.className = 'tech-status-badge status-learning';
            statusBadge.innerHTML = '<i class="fas fa-graduation-cap"></i> В процессе изучения';
            titleWrapper.appendChild(statusBadge);
        }

        titleEl.appendChild(titleWrapper);

        // Add years BELOW title wrapper
        if (details.years) {
            const yearsDiv = document.createElement('div');
            yearsDiv.className = 'tech-years-info';
            const hasRange = details.years.includes('-');
            const yearsText = hasRange ? 'Период использования' : 'Использую с';
            const yearsAfterText = hasRange ? 'год' : 'года';
            yearsDiv.innerHTML = `<i class="fas fa-calendar-alt"></i> ${yearsText}: <strong>${details.years} ${yearsAfterText}</strong>`;
            titleEl.appendChild(yearsDiv);
        }
    }

    // Update level if exists (skip if showLevel: false)
    const percentEl = document.getElementById('techModalPercent');
    const progressEl = document.getElementById('techModalProgress');
    const levelSection = document.querySelector('.tech-modal-progress');
    const showLevel = flags.showLevel !== false;

    if (showLevel && percentEl && details.level !== undefined && details.level !== null) {
        percentEl.textContent = details.level + '%';
    }
    if (showLevel && progressEl && details.level !== undefined && details.level !== null) {
        progressEl.style.width = details.level + '%';
    }
    // Hide level section if showLevel is false
    if (levelSection) {
        levelSection.style.display = showLevel ? 'block' : 'none';
    }

    // Update description - use from JSON
    const descEl = document.getElementById('techModalDescription');
    if (descEl) {
        // Clear any previous category descriptions
        const existingCategoryDescs = descEl.parentNode.querySelectorAll('.tech-category-description');
        existingCategoryDescs.forEach(el => el.remove());

        descEl.textContent = details.description || 'Описание технологии...';

        // Add learning description below main description for learning techs
        if (flags.isLearning && flags.learningDescription) {
            const learningDescEl = document.createElement('div');
            learningDescEl.className = 'tech-learning-description';
            learningDescEl.innerHTML = `
                <div class="learning-desc-label"><i class="fas fa-book-reader"></i> В процессе изучения:</div>
                <div class="learning-desc-text">${flags.learningDescription}</div>
            `;
            descEl.parentNode.insertBefore(learningDescEl, descEl.nextSibling);
        }

        // Add category descriptions if they exist
        if (tech.categoryDescriptions) {
            const categories = tech.categories || [];
            categories.forEach(category => {
                if (tech.categoryDescriptions[category]) {
                    const categoryDescEl = document.createElement('div');
                    categoryDescEl.className = 'tech-category-description';
                    categoryDescEl.innerHTML = `
                        <div class="category-desc-label"><i class="fas fa-folder"></i> Я применяю в "${category}" с целью:</div>
                        <div class="category-desc-text">${tech.categoryDescriptions[category]}</div>
                    `;
                    descEl.parentNode.insertBefore(categoryDescEl, descEl.nextSibling);
                }
            });
        }
    }

    // Update projects list - ALWAYS show if there are projects, regardless of showLevel
    const projectList = document.getElementById('techModalProjectList');
    const projectsSection = document.getElementById('techModalProjects');

    if (projectList) {
        projectList.innerHTML = '';

        const appliedProjects = [];

        // Get projects from usedInProjects
        if (tech.usedInProjects && tech.usedInProjects.length > 0) {
            tech.usedInProjects.forEach(projectId => {
                const title = getProjectTitle(projectId);
                if (title) {
                    appliedProjects.push({ type: 'project', title: title });
                }
            });
        }

        // Get experience from usedInExperience
        if (tech.usedInExperience && tech.usedInExperience.length > 0) {
            tech.usedInExperience.forEach(expId => {
                const company = getExperienceCompany(expId);
                if (company) {
                    appliedProjects.push({ type: 'experience', title: company });
                }
            });
        }

        if (appliedProjects.length > 0) {
            appliedProjects.forEach(item => {
                const li = document.createElement('li');
                if (item.type === 'project') {
                    li.innerHTML = `<i class="fas fa-rocket"></i> ${item.title}`;
                } else {
                    li.innerHTML = `<i class="fas fa-briefcase"></i> ${item.title}`;
                }
                projectList.appendChild(li);
            });
            // Show projects section
            if (projectsSection) {
                projectsSection.style.display = 'block';
            }
        } else {
            // Hide projects section if no projects
            if (projectsSection) {
                projectsSection.style.display = 'none';
            }
        }
    }

    // Show modal with animation
    document.body.classList.add('modal-open');
    techModal.classList.remove('closing');
    techModal.classList.add('active');
}

function closeTechModal() {
    const techModal = document.getElementById('techModal');
    if (!techModal) return;

    techModal.classList.add('closing');

    // Wait for animation to finish before hiding
    setTimeout(() => {
        techModal.classList.remove('active', 'closing');
        document.body.classList.remove('modal-open');

        // Remove any learning description that was added
        const learningDesc = techModal.querySelector('.tech-learning-description');
        if (learningDesc) {
            learningDesc.remove();
        }

        // Remove any category descriptions that were added
        const categoryDescs = techModal.querySelectorAll('.tech-category-description');
        categoryDescs.forEach(el => el.remove());
    }, 300);
}

// Global function to handle tech click
window.openTechModal = openTechModal;
window.closeTechModal = closeTechModal;

// Close handlers
document.addEventListener('DOMContentLoaded', () => {
    const techModal = document.getElementById('techModal');
    const techModalClose = document.getElementById('techModalClose');
    const techModalCloseBtn = document.getElementById('techModalCloseBtn');
    const techTags = document.querySelectorAll('.tech-tag');

    // Close handlers
    if (techModalClose) {
        techModalClose.addEventListener('click', closeTechModal);
    }
    if (techModalCloseBtn) {
        techModalCloseBtn.addEventListener('click', closeTechModal);
    }

    // Close on backdrop click
    if (techModal) {
        techModal.addEventListener('click', (e) => {
            if (e.target === techModal) {
                closeTechModal();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && techModal && techModal.classList.contains('active')) {
            closeTechModal();
        }
    });

    // Add click handlers to tech tags
    techTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const techId = tag.getAttribute('data-tech');
            if (techId && techData) {
                openTechModal(techId);
            }
        });

        // Add cursor pointer to indicate clickability
        tag.style.cursor = 'pointer';
    });

    // Load all data
    loadAllData();
});
