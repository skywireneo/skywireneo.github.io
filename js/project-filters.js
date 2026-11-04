// Project filters functionality
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const filterModeToggle = document.getElementById('filterModeToggle');
const noProjectsMessage = document.querySelector('.no-projects-message');
let filterMode = 'any'; // 'any' or 'all'


filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        // Toggle active state
        if (filter === 'all') {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        } else {
            document.querySelector('[data-filter="all"]').classList.remove('active');
            btn.classList.toggle('active');

            // If no filters active, activate 'all'
            const activeFilters = document.querySelectorAll('.filter-btn.active:not([data-filter="all"])');
            if (activeFilters.length === 0) {
                document.querySelector('[data-filter="all"]').classList.add('active');
            }
        }

        applyFilters();
    });
});

filterModeToggle.addEventListener('click', () => {
    filterMode = filterMode === 'any' ? 'all' : 'any';
    filterModeToggle.textContent = filterMode === 'any' ? 'Хотя бы одна' : 'Все выбранные';
    applyFilters();
});

function applyFilters() {
    const activeFilters = Array.from(document.querySelectorAll('.filter-btn.active:not([data-filter="all"])'))
        .map(btn => btn.getAttribute('data-filter'));

    let visibleCount = 0;

    projectCards.forEach(card => {
        const cardTech = card.getAttribute('data-tech').split(' ');

        if (activeFilters.length === 0) {
            card.classList.remove('hidden');
            visibleCount++;
            return;
        }

        let shouldShow = false;

        if (filterMode === 'any') {
            // Show if card has at least one of the selected technologies
            shouldShow = activeFilters.some(filter => cardTech.includes(filter));
        } else {
            // Show if card has all of the selected technologies
            shouldShow = activeFilters.every(filter => cardTech.includes(filter));
        }

        if (shouldShow) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    // Show/hide "no projects found" message
    if (noProjectsMessage) {
        if (visibleCount === 0) {
            noProjectsMessage.style.display = 'block';
        } else {
            noProjectsMessage.style.display = 'none';
        }
    }
}
