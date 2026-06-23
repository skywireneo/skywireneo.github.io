// Theme toggle functionality
const body = document.body;
const toggleBtn = document.getElementById('themeToggle');

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', savedTheme);
updateButton(savedTheme);

function updateButton(theme) {
    toggleBtn.innerHTML = theme === 'light'
        ? '<i class="fas fa-moon"></i> Тёмная тема'
        : '<i class="fas fa-sun"></i> Светлая тема';
}

toggleBtn.addEventListener('click', () => {
    const next = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateButton(next);
});
