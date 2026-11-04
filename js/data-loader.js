// Shared Data Loader - caches all JSON fetches
(function() {
    'use strict';
    const cache = {};
    const basePath = window.location.pathname.includes('/skywireneo.github.io') ? '/skywireneo.github.io' : '';

    async function loadJSON(filename) {
        if (cache[filename]) return cache[filename];
        try {
            const res = await fetch(`${basePath}/_data/${filename}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            cache[filename] = await res.json();
            return cache[filename];
        } catch (e) {
            console.error(`[DataLoader] Failed to load ${filename}:`, e);
            return null;
        }
    }

    // Convenience methods
    window.DataLoader = {
        getAbout: () => loadJSON('about.json'),
        getContacts: () => loadJSON('contacts.json'),
        getTechnologies: () => loadJSON('technologies.json'),
        getProjects: () => loadJSON('projects.json'),
        getExperience: () => loadJSON('experience.json'),
        getFaq: () => loadJSON('faq.json'),
        getTimeStatus: () => loadJSON('time-status.json'),
        load: loadJSON,
        getCache: () => ({ ...cache })
    };
})();
