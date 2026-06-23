/**
 * Stats Modal - Модальные окна для счётчиков статистики
 */

(function () {
    'use strict';

    // Loaded data from JSON
    let aboutData = null;
    let technologiesData = null;
    let skillLevelsSettings = null;
    let experienceData = null;
    let exactExperienceString = '';
    let projectsData = null;





    /**
     * Get base path for GitHub Pages compatibility
     */
    function getBasePath() {
        return window.location.pathname.includes('/skywireneo.github.io')
            ? '/skywireneo.github.io'
            : '';
    }

    /**
     * Load about.json and technologies.json data
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
            technologiesData = techJson.technologies || [];
            skillLevelsSettings = techJson.settings?.skillLevels || null;

            // Load experience.json
            const expUrl = `${basePath}/_data/experience.json`;
            const expResponse = await fetch(expUrl);
            if (!expResponse.ok) {
                throw new Error('Failed to load experience.json');
            }
            experienceData = await expResponse.json();

            // Pre-calculate exact experience for modal
            exactExperienceString = calculateExactExperienceSync();

            // Load projects.json
            const projUrl = `${basePath}/_data/projects.json`;
            const projResponse = await fetch(projUrl);
            if (!projResponse.ok) {
                throw new Error('Failed to load projects.json');
            }
            projectsData = await projResponse.json();

        } catch (error) {
            console.error('StatsModal: failed to load data', error);
        }

    }



    /**
     * Generate timeline HTML from stackEvolution data
     */
    function generateTimelineHTML() {
        if (!aboutData || !aboutData.stackEvolution) {
            return '<div class="stats-timeline"><div class="timeline-item"><div class="timeline-desc">Данные загружаются...</div></div></div>';
        }

        const items = aboutData.stackEvolution.map(item => `
            <div class="timeline-item">
                <div class="timeline-year">${item.year}</div>
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-desc">${item.description}</div>
            </div>
        `).join('');

        return `<div class="stats-timeline">${items}</div>`;
    }

    /**
     * Get tech stat data from about.json
     */
    function getTechStatData() {
        if (!aboutData || !aboutData.stats || !aboutData.stats.tech) {
            return {
                title: 'Эволюция стека',
                icon: 'fa-layer-group',
                description: 'Загрузка данных...',
                content: '<div class="stats-timeline"><div class="timeline-item"><div class="timeline-desc">Загрузка...</div></div></div>'
            };
        }

        const techStats = aboutData.stats.tech;
        return {
            title: techStats.modalTitle,
            icon: techStats.modalIcon,
            description: techStats.modalDescription,
            content: generateTimelineHTML()
        };
    }

    /**
     * Get skill level label based on level value
     */
    function getSkillLevelLabel(level) {
        if (!skillLevelsSettings) {
            // Fallback if settings not loaded
            if (level >= 80) return 'Эксперт';
            if (level >= 60) return 'Продвинутый';
            if (level >= 40) return 'Средний';
            return 'Начальный';
        }
        if (level >= skillLevelsSettings.expert.min) return skillLevelsSettings.expert.label;
        if (level >= skillLevelsSettings.advanced.min) return skillLevelsSettings.advanced.label;
        if (level >= skillLevelsSettings.intermediate.min) return skillLevelsSettings.intermediate.label;
        return skillLevelsSettings.beginner.label;
    }


    /**
     * Generate languages modal content from technologies.json
     */
    function generateLanguagesContent() {
        if (!technologiesData || technologiesData.length === 0) {
            return '<div class="languages-section"><p>Загрузка данных...</p></div>';
        }

        // Filter programming languages
        const languages = technologiesData.filter(tech => {
            const flags = tech.flags || {};
            return flags.isProgrammingLanguage === true && !flags.isHidden;
        });

        // Section 1: Currently using (!hasExperience - includes both active and learning)
        const currentLangs = languages.filter(tech => {
            const flags = tech.flags || {};
            return !flags.hasExperience;
        });

        // Section 2: Learning (!hasExperience && isLearning)
        const learningLangs = languages.filter(tech => {
            const flags = tech.flags || {};
            return !flags.hasExperience && flags.isLearning;
        });

        // Section 3: Past experience (hasExperience)
        const pastLangs = languages.filter(tech => {
            const flags = tech.flags || {};
            return flags.hasExperience;
        });


        let html = '';

        // Section 1: Currently using (includes both active and learning)
        if (currentLangs.length > 0) {
            html += `<h4><i class="fas fa-check-circle"></i> Использую сейчас</h4>
            <div class="languages-section current">`;
            currentLangs.forEach(lang => {
                const level = lang.details?.level || 0;
                const levelLabel = getSkillLevelLabel(level);
                const badgeClass = level >= 80 ? 'expert' : level >= 60 ? 'advanced' : level >= 40 ? 'intermediate' : 'beginner';

                html += `
                <div class="language-card">
                    <div class="language-header">
                        <span class="language-name">${lang.name}</span>
                        <span class="language-level ${badgeClass}">${levelLabel}</span>
                    </div>
                    <p class="language-desc">${lang.details?.description || ''}</p>
                    <div class="language-progress">Уровень владения: ${level}%</div>
                </div>`;

            });
            html += '</div>';
        }


        // Section 2: Learning
        if (learningLangs.length > 0) {
            html += `<h4><i class="fas fa-graduation-cap"></i> В процессе изучения</h4>
            <div class="languages-section learning">`;
            learningLangs.forEach(lang => {
                const level = lang.details?.level || 0;
                html += `
                <div class="language-card">
                    <div class="language-header">
                        <span class="language-name">${lang.name}</span>
                        <span class="language-level learning-badge">Изучаю</span>
                    </div>
                    <p class="language-desc">${lang.details?.description || ''}</p>
                    <div class="language-progress">Уровень владения: ${level}%</div>
                </div>`;
            });
            html += '</div>';
        }

        // Section 3: Past experience
        if (pastLangs.length > 0) {
            html += `<h4><i class="fas fa-history"></i> Был опыт в прошлом</h4>
            <div class="languages-section past">`;
            pastLangs.forEach(lang => {
                const years = lang.details?.years || '';
                html += `
                <div class="language-card past-card">
                    <div class="language-header">
                        <span class="language-name">${lang.name}</span>
                        <span class="language-level past-badge">${years}</span>
                    </div>
                    <p class="language-desc">${lang.details?.description || ''}</p>
                </div>`;
            });
            html += '</div>';
        }

        return html;
    }



    /**
     * Get languages stat data
     */
    function getLanguagesStatData() {
        if (!aboutData || !aboutData.stats || !aboutData.stats.languages) {
            return {
                title: 'Языки программирования',
                icon: 'fa-code',
                description: 'Загрузка данных...',
                content: '<div class="languages-section"><p>Загрузка...</p></div>'
            };
        }

        const langStats = aboutData.stats.languages;
        return {
            title: langStats.modalTitle,
            icon: langStats.modalIcon,
            description: langStats.modalDescription,
            content: generateLanguagesContent()
        };
    }

    /**
     * Generate experience modal content from experience.json
     */
    function generateExperienceContent() {
        if (!experienceData || !experienceData.statsModal || !experienceData.statsModal.timeline) {
            return '<div class="growth-list"><div class="growth-item"><div class="growth-content"><p>Загрузка данных...</p></div></div></div>';
        }

        // Create highlighted experience badge
        let experienceBadge = '';
        if (exactExperienceString) {
            experienceBadge = `
                <div class="experience-badge" style="
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 12px;
                    padding: 16px 24px;
                    margin-bottom: 24px;
                    text-align: center;
                ">
                    <div style="
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: var(--accent);
                        margin-bottom: 4px;
                    ">
                        <i class="fas fa-clock" style="margin-right: 8px;"></i>${exactExperienceString}
                    </div>
                    <div style="
                        font-size: 0.85rem;
                        color: var(--text-muted);
                    ">общий коммерческий опыт</div>
                </div>
            `;
        }

        const items = experienceData.statsModal.timeline.map(item => `
            <div class="growth-item">
                <div class="growth-period">${item.period}</div>
                <div class="growth-content">
                    <h5>${item.title}</h5>
                    <p>${item.description}</p>
                </div>
            </div>
        `).join('');

        return `${experienceBadge}<div class="growth-list">${items}</div>`;
    }

    /**
     * Calculate exact experience (years and months) from loaded experienceData
     * Synchronous version - uses already loaded data
     */
    function calculateExactExperienceSync() {
        try {
            if (!experienceData) return '';

            const useManualTotal = experienceData.useManualTotal || false;
            const manualTotal = experienceData.manualTotal || '';

            if (useManualTotal && manualTotal) {
                return manualTotal;
            }

            // Merge intervals algorithm (no overlap counting) - синхронизировано с experience.html
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;

            // Convert to intervals [start, end]
            let intervals = experienceData.experience.map(exp => {
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
            const months = totalMonths % 12;

            // Format the result (точно как в experience.html)
            let result = '';
            if (years > 0) {
                if (years === 1 || (years > 20 && years % 10 === 1)) {
                    result = years + ' год';
                } else if ((years >= 2 && years <= 4) || (years > 20 && years % 10 >= 2 && years % 10 <= 4)) {
                    result = years + ' года';
                } else {
                    result = years + ' лет';
                }

                if (months > 0) {
                    if (months === 1 || (months > 20 && months % 10 === 1)) {
                        result += ' ' + months + ' месяц';
                    } else if ((months >= 2 && months <= 4) || (months > 20 && months % 10 >= 2 && months % 10 <= 4)) {
                        result += ' ' + months + ' месяца';
                    } else {
                        result += ' ' + months + ' месяцев';
                    }
                }
            } else {
                if (months === 1 || (months > 20 && months % 10 === 1)) {
                    result = months + ' месяц';
                } else if ((months >= 2 && months <= 4) || (months > 20 && months % 10 >= 2 && months % 10 <= 4)) {
                    result = months + ' месяца';
                } else {
                    result = months + ' месяцев';
                }
            }

            return result;

        } catch (error) {
            console.error('StatsModal: failed to calculate exact experience', error);
            return '';
        }
    }

    /**
     * Get experience stat data
     */
    function getExperienceStatData() {
        if (!aboutData || !aboutData.stats || !aboutData.stats.experience) {
            return {
                title: 'Путь развития',
                icon: 'fa-chart-line',
                description: 'Загрузка данных...',
                content: '<div class="growth-list"><div class="growth-item"><div class="growth-content"><p>Загрузка...</p></div></div></div>'
            };
        }

        const expStats = aboutData.stats.experience;

        return {
            title: expStats.modalTitle,
            icon: expStats.modalIcon,
            description: expStats.modalDescription,
            content: generateExperienceContent()
        };
    }

    /**
     * Generate projects modal content from projects.json
     */
    function generateProjectsContent() {
        if (!projectsData || !projectsData.projects || projectsData.projects.length === 0) {
            return '<div class="challenges-list"><div class="challenge-item"><div class="challenge-solution"><p>Загрузка данных...</p></div></div></div>';
        }

        const items = projectsData.projects.map(project => `
            <div class="challenge-item">
                <div class="challenge-project">${project.title}</div>
                <div class="challenge-solution">${project.description}</div>
            </div>
        `).join('');

        return `<div class="challenges-list">${items}</div>`;
    }

    /**
     * Get projects stat data
     */
    function getProjectsStatData() {
        if (!aboutData || !aboutData.stats || !aboutData.stats.projects) {
            return {
                title: 'Технические вызовы',
                icon: 'fa-mountain',
                description: 'Загрузка данных...',
                content: '<div class="challenges-list"><div class="challenge-item"><div class="challenge-solution"><p>Загрузка...</p></div></div></div>'
            };
        }

        const projStats = aboutData.stats.projects;

        return {
            title: projStats.modalTitle,
            icon: projStats.modalIcon,
            description: projStats.modalDescription,
            content: generateProjectsContent()
        };
    }






    // Data for each stat modal
    const statsData = {
        get tech() {
            return getTechStatData();
        },

        get languages() {
            return getLanguagesStatData();
        },

        get experience() {
            return getExperienceStatData();
        },

        get projects() {
            return getProjectsStatData();
        }

    };

    // DOM Elements
    let modal = null;
    let modalTitle = null;
    let modalDescription = null;
    let modalContent = null;
    let modalClose = null;
    let modalCloseBtn = null;

    // Initialize
    async function init() {
        await loadAboutData();
        createModal();
        bindEvents();
        animateCounters();
    }


    // Create modal HTML structure
    function createModal() {
        modal = document.createElement('div');
        modal.id = 'statsModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="statsModalTitle"><i class="fas" style="color: var(--accent); margin-right: 0.5rem;"></i><span></span></h3>
                    <button class="modal-close" id="statsModalClose">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="stats-modal-description" id="statsModalDescription"></div>
                    <div class="stats-modal-content" id="statsModalContent"></div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-secondary" id="statsModalCloseBtn">Закрыть</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Cache elements
        modalTitle = modal.querySelector('#statsModalTitle');
        modalDescription = modal.querySelector('#statsModalDescription');
        modalContent = modal.querySelector('#statsModalContent');
        modalClose = modal.querySelector('#statsModalClose');
        modalCloseBtn = modal.querySelector('#statsModalCloseBtn');
    }

    // Bind events
    function bindEvents() {
        // Stat item clicks
        document.querySelectorAll('.stat-item').forEach(item => {
            item.addEventListener('click', () => {
                const statType = item.dataset.stat;
                openModal(statType);
            });
        });

        // Close buttons
        modalClose.addEventListener('click', closeModal);
        modalCloseBtn.addEventListener('click', closeModal);

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // Open modal with specific stat data
    function openModal(statType) {
        const data = statsData[statType];
        if (!data) return;

        // Set content
        modalTitle.querySelector('i').className = `fas ${data.icon}`;
        modalTitle.querySelector('span').textContent = data.title;
        modalDescription.textContent = data.description;
        modalContent.innerHTML = data.content;

        // Show modal
        modal.classList.remove('closing');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    function closeModal() {
        modal.classList.add('closing');
        modal.classList.remove('active');
        document.body.style.overflow = '';

        setTimeout(() => {
            modal.classList.remove('closing');
        }, 300);
    }

    // Animate counters on scroll
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.dataset.target);
                    animateCount(counter, target);
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);

        counters.forEach(counter => observer.observe(counter));
    }

    // Count up animation
    function animateCount(element, target) {
        const duration = 1500;
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target;
            }
        }

        requestAnimationFrame(update);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
