// FAQ with Section Switcher - Split View + Full-Text Search
let faqConfig = null;
let sectionLabels = {};
let searchSynonyms = {};

document.addEventListener('DOMContentLoaded', async () => {
    await loadFaqConfig();
    initFaqSwitcher();
    initFaqQuestions();
    initFaqSearch();
    initScrollableQuestions();
    addSectionLabels();
});

/**
 * Load FAQ configuration from JSON
 */
async function loadFaqConfig() {
    try {
        const basePath = window.location.pathname.includes('/skywireneo.github.io')
            ? '/skywireneo.github.io'
            : '';
        const response = await fetch(`${basePath}/_data/faq.json`);
        if (response.ok) {
            faqConfig = await response.json();

            // Build sectionLabels from config
            faqConfig.sections.forEach(section => {
                sectionLabels[section.id] = {
                    icon: section.icon,
                    text: section.title,
                    short: section.shortTitle
                };
            });

            // Get searchSynonyms from config
            searchSynonyms = faqConfig.searchSynonyms || {};
        } else {
            console.error('FAQ: failed to load config');
        }
    } catch (error) {
        console.error('FAQ: failed to load config', error);
    }
}

// Add section labels to questions
function addSectionLabels() {
    if (!faqConfig) return;

    faqConfig.sections.forEach(section => {
        const tabContent = document.getElementById(`faq-${section.id}`);
        if (!tabContent) return;

        const questions = tabContent.querySelectorAll('.faq-question');
        const sectionInfo = sectionLabels[section.id];

        questions.forEach(question => {
            // Add section data attribute
            question.setAttribute('data-section', section.id);
            question.setAttribute('data-section-name', sectionInfo ? sectionInfo.short : '');
        });
    });
}


// Initialize section switcher buttons
function initFaqSwitcher() {
    const switchButtons = document.querySelectorAll('.faq-switch-btn');
    const contents = document.querySelectorAll('.faq-tab-content');
    const currentSectionLabel = document.getElementById('faqCurrentSection');

    switchButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Hide all contents
            contents.forEach(content => {
                content.classList.remove('active');
            });

            // Show target content
            const targetContent = document.getElementById(`faq-${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // Update current section label
            if (currentSectionLabel && sectionLabels[targetTab]) {
                const label = sectionLabels[targetTab];
                currentSectionLabel.innerHTML = `<i class="fas ${label.icon}"></i> ${label.text}`;
            }

            // Reset search when switching tabs
            resetFaqSearch();

            // Re-initialize scroll detection for new tab
            setTimeout(initScrollableQuestions, 100);
        });
    });
}

// Initialize question/answer switching within each tab
function initFaqQuestions() {
    const tabContents = document.querySelectorAll('.faq-tab-content');

    tabContents.forEach(content => {
        const questions = content.querySelectorAll('.faq-question');
        const answers = content.querySelectorAll('.faq-answer-content');

        // Show first answer by default for each tab
        if (questions.length > 0 && answers.length > 0) {
            questions[0].classList.add('active');
            answers[0].classList.add('active');
        }

        questions.forEach(question => {
            question.addEventListener('click', () => {
                const answerId = question.getAttribute('data-answer');

                // Remove active from all questions in this tab
                questions.forEach(q => q.classList.remove('active'));

                // Add active to clicked question
                question.classList.add('active');

                // Hide all answers in this tab
                answers.forEach(answer => {
                    answer.classList.remove('active');
                });

                // Show corresponding answer
                const targetAnswer = content.querySelector(`#faq-answer-${answerId}`);
                if (targetAnswer) {
                    targetAnswer.classList.add('active');
                }
            });
        });
    });
}

// ============================================
// FAQ FULL-TEXT SEARCH ACROSS ALL SECTIONS
// ============================================

// Search synonyms loaded from JSON (faqConfig.searchSynonyms)


function initFaqSearch() {
    const searchInput = document.getElementById('faqSearchInput');
    const searchClear = document.getElementById('faqSearchClear');
    const searchResults = document.getElementById('faqSearchResults');

    if (!searchInput) return;

    // Search on input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        // Show/hide clear button
        if (searchClear) {
            searchClear.style.display = query.length > 0 ? 'flex' : 'none';
        }

        if (query.length > 0) {
            performFaqSearch(query);
        } else {
            resetFaqSearch();
        }
    });

    // Clear search
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.style.display = 'none';
            resetFaqSearch();
            searchInput.focus();
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            const faqSection = document.getElementById('faq');
            if (faqSection && isElementInViewport(faqSection)) {
                e.preventDefault();
                searchInput.focus();
            }
        }

        // Escape to clear search
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            resetFaqSearch();
            searchInput.blur();
        }
    });
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
}

function performFaqSearch(query) {
    const allQuestions = document.querySelectorAll('.faq-question');
    const searchResults = document.getElementById('faqSearchResults');
    const activeTab = document.querySelector('.faq-tab-content.active');

    if (!query) {
        resetFaqSearch();
        return;
    }

    // Expand search query with synonyms
    const expandedQuery = expandSearchQuery(query);
    const searchTerms = expandedQuery.split(/\s+/).filter(term => term.length > 0);

    let matches = [];
    let bestMatch = null;
    let bestScore = 0;

    allQuestions.forEach(question => {
        const questionText = question.textContent.toLowerCase();
        const searchKeywords = (question.getAttribute('data-search') || '').toLowerCase();
        const answerId = question.getAttribute('data-answer');
        const answerContent = document.querySelector(`#faq-answer-${answerId}`);
        const answerText = answerContent ? answerContent.textContent.toLowerCase() : '';
        const sectionName = (question.getAttribute('data-section-name') || '').toLowerCase();

        // Calculate relevance score
        let score = 0;
        let matchedTerms = [];

        searchTerms.forEach(term => {
            // Exact match in question text (highest priority)
            if (questionText.includes(term)) {
                score += 10;
                if (questionText.indexOf(term) < 20) score += 5; // Bonus for match at start
                matchedTerms.push(term);
            }
            // Match in keywords
            else if (searchKeywords.includes(term)) {
                score += 8;
                matchedTerms.push(term);
            }
            // Match in answer text
            else if (answerText.includes(term)) {
                score += 5;
                matchedTerms.push(term);
            }
            // Match in section name
            else if (sectionName.includes(term)) {
                score += 2;
                matchedTerms.push(term);
            }
        });

        if (score > 0) {
            matches.push({
                question: question,
                score: score,
                matchedTerms: [...new Set(matchedTerms)]
            });

            if (score > bestScore) {
                bestScore = score;
                bestMatch = question;
            }
        }
    });

    // Sort matches by score
    matches.sort((a, b) => b.score - a.score);

    // Update UI
    updateSearchResults(matches, bestMatch, searchResults, query);
}

function expandSearchQuery(query) {
    let expanded = query;
    const words = query.split(/\s+/);

    words.forEach(word => {
        // Check if word has synonyms
        for (const [key, synonyms] of Object.entries(searchSynonyms)) {
            if (word.includes(key) || synonyms.some(s => word.includes(s))) {
                // Add all synonyms to search
                expanded += ' ' + synonyms.join(' ');
            }
        }
    });

    return expanded;
}

function updateSearchResults(matches, bestMatch, searchResultsElement, query) {
    const allQuestions = document.querySelectorAll('.faq-question');
    const activeTab = document.querySelector('.faq-tab-content.active');

    // Hide all questions first
    allQuestions.forEach(q => {
        q.classList.add('hidden');
        // Remove section label if exists
        const existingLabel = q.querySelector('.faq-section-badge');
        if (existingLabel) {
            existingLabel.remove();
        }
        // Reset text
        q.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = node.textContent.replace(/\s*\([^)]+\)\s*$/, '');
            }
        });
    });

    if (matches.length === 0) {
        // No results
        if (searchResultsElement) {
            searchResultsElement.textContent = 'Ничего не найдено';
            searchResultsElement.style.color = 'var(--error, #ef4444)';
        }
        return;
    }

    // Show matched questions with section labels
    const visibleMatches = matches.slice(0, 15); // Limit to top 15 results

    visibleMatches.forEach(match => {
        const question = match.question;
        const sectionName = question.getAttribute('data-section-name');

        // Remove hidden class
        question.classList.remove('hidden');

        // Add section badge
        const badge = document.createElement('span');
        badge.className = 'faq-section-badge';
        badge.textContent = ` (${sectionName})`;
        badge.style.cssText = `
            color: var(--accent);
            font-size: 0.8em;
            opacity: 0.8;
            margin-left: 0.5rem;
            font-weight: 500;
        `;
        question.appendChild(badge);

        // Highlight matching text
        highlightMatches(question, match.matchedTerms);
    });

    // Update results counter
    if (searchResultsElement) {
        searchResultsElement.textContent = `Найдено: ${matches.length}`;
        searchResultsElement.style.color = 'var(--accent)';
    }

    // Auto-select best match
    if (bestMatch && activeTab) {
        // Check if best match is in active tab
        const bestMatchTab = bestMatch.closest('.faq-tab-content');
        if (bestMatchTab && bestMatchTab !== activeTab) {
            // Switch to the tab containing best match
            const tabId = bestMatchTab.id.replace('faq-', '');
            const switchBtn = document.querySelector(`.faq-switch-btn[data-tab="${tabId}"]`);
            if (switchBtn) {
                switchBtn.click();
            }
        }

        // Click the best match after a short delay
        setTimeout(() => {
            bestMatch.click();
            bestMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    // Update scroll indicators
    setTimeout(updateScrollIndicators, 50);
}

function highlightMatches(element, terms) {
    if (!terms || terms.length === 0) return;

    // Get text content excluding the badge
    const badge = element.querySelector('.faq-section-badge');
    const badgeText = badge ? badge.textContent : '';
    const originalText = element.textContent.replace(badgeText, '').trim();

    // Create regex for all terms
    const regex = new RegExp(`(${terms.map(escapeRegex).join('|')})`, 'gi');

    // Replace text with highlighted version
    const highlightedText = originalText.replace(regex, '<mark class="faq-search-highlight">$1</mark>');

    // Update element HTML
    element.innerHTML = highlightedText;
    if (badge) {
        element.appendChild(badge);
    }
}

function resetFaqSearch() {
    const allQuestions = document.querySelectorAll('.faq-question');
    const searchResults = document.getElementById('faqSearchResults');
    const activeTab = document.querySelector('.faq-tab-content.active');

    allQuestions.forEach(question => {
        question.classList.remove('hidden');

        // Remove section badge
        const badge = question.querySelector('.faq-section-badge');
        if (badge) {
            badge.remove();
        }

        // Reset to original text
        const originalText = question.textContent.replace(/\s*\([^)]+\)\s*$/, '');
        question.textContent = originalText;
    });

    if (searchResults) {
        searchResults.textContent = '';
    }

    // Reset to first question in active tab
    if (activeTab) {
        const firstQuestion = activeTab.querySelector('.faq-question');
        if (firstQuestion) {
            firstQuestion.click();
        }
    }

    // Update scroll indicators
    setTimeout(updateScrollIndicators, 50);
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// SCROLLABLE QUESTIONS WITH FADE EFFECTS
// ============================================

function initScrollableQuestions() {
    const scrollableContainers = document.querySelectorAll('.faq-questions-scrollable');

    scrollableContainers.forEach(container => {
        // Initial check
        updateScrollIndicators();

        // Listen for scroll
        container.addEventListener('scroll', () => {
            updateScrollIndicators();
        });
    });

    // Listen for resize
    window.addEventListener('resize', () => {
        updateScrollIndicators();
    });
}

function updateScrollIndicators() {
    const scrollableContainers = document.querySelectorAll('.faq-questions-scrollable');

    scrollableContainers.forEach(container => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        // Check if can scroll up
        if (scrollTop > 10) {
            container.classList.add('can-scroll-up');
        } else {
            container.classList.remove('can-scroll-up');
        }

        // Check if can scroll down
        if (scrollTop + clientHeight < scrollHeight - 10) {
            container.classList.add('can-scroll-down');
        } else {
            container.classList.remove('can-scroll-down');
        }
    });
}
