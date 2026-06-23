/* ============================================
   ABOUT SECTION - Dynamic data loading from JSON
   ============================================ */

let aboutData = null;
let technologiesData = null;
let aboutProjectsData = null;



/**
 * Get base path for GitHub Pages compatibility
 */
function getBasePath() {
    return window.location.pathname.includes('/skywireneo.github.io')
        ? '/skywireneo.github.io'
        : '';
}

/**
 * Load all required data
 */
async function loadAboutData() {
    try {
        const basePath = getBasePath();

        // Load about.json
        const aboutUrl = `${basePath}/_data/about.json`;
        const aboutResponse = await fetch(aboutUrl);
        if (!aboutResponse.ok) {
            throw new Error('Failed to load about.json');
        }
        aboutData = await aboutResponse.json();

        // Load technologies.json
        const techUrl = `${basePath}/_data/technologies.json`;
        const techResponse = await fetch(techUrl);
        if (!techResponse.ok) {
            throw new Error('Failed to load technologies.json');
        }
        const techJson = await techResponse.json();
        technologiesData = {};
        techJson.technologies.forEach(tech => {
            technologiesData[tech.id] = tech;
        });

        // Load projects.json
        const projUrl = `${basePath}/_data/projects.json`;
        const projResponse = await fetch(projUrl);
        if (!projResponse.ok) {
            throw new Error('Failed to load projects.json');
        }
        aboutProjectsData = await projResponse.json();


        // Render all sections
        renderFacts();
        renderMainStackTags();
        renderMainStackSkills();
        renderCounterLabels();
        renderTechCounter();
        renderLanguagesCounter();
        renderExperienceCounter();
        renderProjectsCounter();


    } catch (error) {
        console.error('About: failed to load data', error);
    }
}


/**
 * Render facts list
 */
function renderFacts() {
    const container = document.getElementById('aboutFacts');
    if (!container || !aboutData || !aboutData.facts) return;

    const ul = document.createElement('ul');
    ul.className = 'about-list';

    aboutData.facts.forEach(fact => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="${fact.icon}"></i>${fact.text}`;
        ul.appendChild(li);
    });

    container.appendChild(ul);
}

/**
 * Get main stack technologies from technologies.json (filter by isMainStack flag)
 */
function getMainStackTechnologies() {
    if (!technologiesData) return [];

    return Object.values(technologiesData).filter(tech =>
        tech.flags && tech.flags.isMainStack === true
    );
}

/**
 * Render main stack tech tags (clickable)
 */
function renderMainStackTags() {
    const container = document.getElementById('mainStackTags');
    if (!container || !technologiesData) return;

    const mainStack = getMainStackTechnologies();
    if (mainStack.length === 0) return;

    const div = document.createElement('div');
    div.className = 'tech-tags';

    mainStack.forEach(tech => {
        const span = document.createElement('span');
        span.className = 'tech-tag';
        span.setAttribute('data-tech', tech.id);
        span.setAttribute('data-tooltip', tech.tooltip || '');
        span.textContent = tech.name;

        // Apply dynamic color from technology
        if (tech.color) {
            span.style.setProperty('--tech-color', tech.color, 'important');
        }

        div.appendChild(span);
    });

    container.appendChild(div);

    // Re-initialize click handlers for tech tags
    initTechTagHandlers();
}

/**
 * Wait for tech-modal.js to load data
 */
async function waitForTechData(maxAttempts = 50) {
    for (let i = 0; i < maxAttempts; i++) {
        if (window.techData && Object.keys(window.techData).length > 0) {
            return window.techData;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return null;
}

/**
 * Initialize click handlers for tech tags (similar to tech-modal.js)
 */
async function initTechTagHandlers() {
    const techTags = document.querySelectorAll('#mainStackTags .tech-tag');

    // Wait for tech-modal.js to load data first
    await waitForTechData();

    techTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const techId = tag.getAttribute('data-tech');
            if (techId && typeof window.openTechModal === 'function') {
                window.openTechModal(techId);
            } else {
                console.warn('openTechModal not available yet');
            }
        });

        tag.style.cursor = 'pointer';
    });
}

/**
 * Render main stack skill bars
 */
function renderMainStackSkills() {
    const container = document.getElementById('mainStackSkills');
    if (!container || !technologiesData) return;

    const mainStack = getMainStackTechnologies();
    if (mainStack.length === 0) return;

    const div = document.createElement('div');
    div.className = 'skill-bar-container';

    mainStack.forEach((tech, index) => {
        if (!tech.details) return;

        const level = tech.details.level || 0;
        const levelText = tech.details.levelText || '';
        const color = tech.color || 'var(--accent)';
        const icon = tech.icon || 'fas fa-code';

        // Determine skill level class for color
        let levelClass = 'intermediate';
        if (level >= 80) levelClass = 'expert';
        else if (level >= 60) levelClass = 'advanced';

        const item = document.createElement('div');
        item.className = 'skill-bar-item';
        item.innerHTML = `
            <div class="skill-bar-header">
                <span class="skill-bar-name"><i class="${icon}"></i> ${tech.name}</span>
                <span class="skill-bar-percent">${level}%</span>
            </div>
            <div class="skill-bar-track">
                <div class="skill-bar-fill" data-level="${levelClass}" data-level-percent="${level}" style="width: 0%; background: ${color};"></div>
            </div>
        `;

        div.appendChild(item);
    });

    container.appendChild(div);

    // Trigger skill bar animation
    setTimeout(() => {
        animateSkillBars(container);
    }, 100);
}

/**
 * Animate skill bars within a container
 */
function animateSkillBars(container) {
    const bars = container.querySelectorAll('.skill-bar-fill');

    // Use Intersection Observer for scroll-triggered animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                bars.forEach((bar, index) => {
                    setTimeout(() => {
                        const level = bar.getAttribute('data-level-percent') || '0';
                        bar.style.width = level + '%';
                        bar.classList.add('animate');
                    }, index * 100);
                });
                observer.disconnect();
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    observer.observe(container);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    loadAboutData();
});

/**
 * Calculate tech count with rounding logic
 * Count: showInStats=true && !isHidden && !hasExperience
 * Rounding: 42→40, 39→30, 8→8 (if <=11), 20→20 (if divisible by 10)
 */
function calculateTechCount() {
    if (!technologiesData) return { count: 0, displayValue: 0 };

    // Count technologies matching criteria
    const matchingTechs = Object.values(technologiesData).filter(tech => {
        const flags = tech.flags || {};
        return flags.showInStats === true &&
            !flags.isHidden &&
            !flags.hasExperience;
    });

    const count = matchingTechs.length;

    // Apply rounding logic
    let displayValue;
    if (count <= 11) {
        // Small numbers: keep as is
        displayValue = count;
    } else if (count % 10 === 0) {
        // Divisible by 10: keep as is
        displayValue = count;
    } else {
        // Round down to nearest 10
        displayValue = Math.floor(count / 10) * 10;
    }

    return { count, displayValue };
}

/**
 * Render tech counter with calculated value
 */
function renderTechCounter() {
    const counter = document.getElementById('techCounter');
    if (!counter) return;

    const { displayValue } = calculateTechCount();
    const numberEl = counter.querySelector('.stat-number');

    if (numberEl) {
        numberEl.setAttribute('data-target', displayValue);
        numberEl.textContent = '0';
    }

    // Trigger counter animation
    setTimeout(() => {
        animateCounter(numberEl, displayValue);
    }, 500);
}

/**
 * Calculate languages count
 * Count: isProgrammingLanguage=true && !isHidden && !hasExperience
 * Includes learning languages (isLearning=true but hasExperience=false)
 * Returns exact count (no rounding)
 */
function calculateLanguagesCount() {
    if (!technologiesData) return 0;

    return Object.values(technologiesData).filter(tech => {
        const flags = tech.flags || {};
        return flags.isProgrammingLanguage === true &&
            !flags.isHidden &&
            !flags.hasExperience;
    }).length;
}


/**
 * Get skill level label based on level value
 * Uses settings.skillLevels from technologies.json
 */
function getSkillLevelLabel(level) {
    if (!technologiesData || !technologiesData.settings || !technologiesData.settings.skillLevels) {
        return '';
    }

    const levels = technologiesData.settings.skillLevels;

    if (level >= levels.expert.min) return levels.expert.label;
    if (level >= levels.advanced.min) return levels.advanced.label;
    if (level >= levels.intermediate.min) return levels.intermediate.label;
    return levels.beginner.label;
}

/**
 * Calculate total experience years from experience.json
 * Rounds to nearest year: >=6 months rounds up, <6 months rounds down
 * Returns {years, suffix} where suffix is '+' or '-' based on rounding direction
 */
async function calculateExperienceYears() {
    try {
        const basePath = getBasePath();
        const expUrl = `${basePath}/_data/experience.json`;
        const response = await fetch(expUrl);
        if (!response.ok) {
            throw new Error('Failed to load experience.json');
        }
        const expData = await response.json();

        const useManualTotal = expData.useManualTotal || false;
        const manualTotal = expData.manualTotal || '';

        if (useManualTotal && manualTotal) {
            // Extract number from manual total (e.g., "2 года" -> 2)
            const match = manualTotal.match(/(\d+)/);
            const years = match ? parseInt(match[1]) : 2;
            return { years, suffix: '' };
        }

        // Merge intervals algorithm (no overlap counting) - синхронизировано с experience.html
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // Convert to intervals [start, end]
        let intervals = expData.experience.map(exp => {
            const start = exp.period.start.split('-').map(Number);
            const end = exp.period.isCurrent
                ? [currentYear, currentMonth]
                : exp.period.end.split('-').map(Number);
            return { start, end };
        });

        // Sort by start date
        intervals.sort((a, b) => (a.start[0] - b.start[0]) * 12 + (a.start[1] - b.start[1]));

        // Merge overlapping intervals
        let merged = [];
        for (let interval of intervals) {
            if (merged.length === 0 || merged[merged.length - 1].end[0] * 12 + merged[merged.length - 1].end[1] < interval.start[0] * 12 + interval.start[1]) {
                merged.push(interval);
            } else {
                // Extend end date to max of both intervals
                const currentEndMonths = merged[merged.length - 1].end[0] * 12 + merged[merged.length - 1].end[1];
                const newEndMonths = interval.end[0] * 12 + interval.end[1];
                if (newEndMonths > currentEndMonths) {
                    const newEndTotalMonths = newEndMonths;
                    merged[merged.length - 1].end[0] = Math.floor(newEndTotalMonths / 12);
                    merged[merged.length - 1].end[1] = (newEndTotalMonths % 12) || 12;
                }
            }
        }

        // Calculate total months from merged intervals
        let totalMonths = 0;
        merged.forEach(({ start, end }) => {
            totalMonths += (end[0] - start[0]) * 12 + (end[1] - start[1]);
        });

        const years = Math.floor(totalMonths / 12);
        const remainingMonths = totalMonths % 12;

        // Округление для счётчика (как было)
        let displayYears;
        let suffix;
        if (remainingMonths >= 6) {
            displayYears = years + 1;
            suffix = '~-';
        } else {
            displayYears = years;
            suffix = '~+';
        }

        return { years: displayYears, suffix };

    } catch (error) {
        console.error('About: failed to calculate experience', error);
        return { years: 2, suffix: '+' }; // fallback
    }
}

/**
 * Render experience counter with calculated value
 */
async function renderExperienceCounter() {
    const counter = document.getElementById('experienceCounter');
    if (!counter) return;

    const { years, suffix } = await calculateExperienceYears();
    const numberEl = counter.querySelector('.stat-number');
    const suffixEl = counter.querySelector('.stat-suffix');

    if (numberEl) {
        numberEl.setAttribute('data-target', years);
        numberEl.textContent = '0';
    }

    // Update suffix based on rounding direction
    if (suffixEl) {
        suffixEl.textContent = suffix;
    }

    // Trigger counter animation
    setTimeout(() => {
        animateCounter(numberEl, years);
    }, 700);
}

/**
 * Render languages counter with exact value
 */
function renderLanguagesCounter() {
    const counter = document.getElementById('languagesCounter');
    if (!counter) return;

    const count = calculateLanguagesCount();
    const numberEl = counter.querySelector('.stat-number');

    if (numberEl) {
        numberEl.setAttribute('data-target', count);
        numberEl.textContent = '0';
    }

    // Trigger counter animation
    setTimeout(() => {
        animateCounter(numberEl, count);
    }, 600);
}


/**
 * Render counter labels from about.json
 */
function renderCounterLabels() {
    if (!aboutData || !aboutData.stats) return;

    const stats = aboutData.stats;

    // Tech label
    const techLabel = document.getElementById('techLabel');
    if (techLabel && stats.tech && stats.tech.label) {
        techLabel.textContent = stats.tech.label;
    }

    // Languages label
    const languagesLabel = document.getElementById('languagesLabel');
    if (languagesLabel && stats.languages && stats.languages.label) {
        languagesLabel.textContent = stats.languages.label;
    }

    // Experience label
    const experienceLabel = document.getElementById('experienceLabel');
    if (experienceLabel && stats.experience && stats.experience.label) {
        experienceLabel.textContent = stats.experience.label;
    }

    // Projects label
    const projectsLabel = document.getElementById('projectsLabel');
    if (projectsLabel && stats.projects && stats.projects.label) {
        projectsLabel.textContent = stats.projects.label;
    }
}

/**
 * Render projects counter with calculated value from projects.json
 */
function renderProjectsCounter() {

    const counter = document.querySelector('.stat-item[data-stat="projects"]');
    if (!counter) return;

    // Count projects from projects.json (excluding hiddenProject)
    const count = aboutProjectsData?.projects?.length || 0;

    const numberEl = counter.querySelector('.stat-number');

    if (numberEl) {
        numberEl.setAttribute('data-target', count);
        numberEl.textContent = '0';
    }

    // Trigger counter animation
    setTimeout(() => {
        animateCounter(numberEl, count);
    }, 800);
}

/**
 * Animate counter from 0 to target
 */
function animateCounter(element, target) {

    if (!element) return;

    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(target * easeOut);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

// Export for potential use
window.loadAboutData = loadAboutData;
