// Global variable to store all samples
let allSamples = [];
let currentFrameworkFilter = 'all';
let currentVersionFilter = 'all';

// Load and display sample data
async function loadSamples() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allSamples = data.samples;
        displaySamples(allSamples);
        setupSearch();
        setupFilters();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('samples-container').innerHTML =
            '<p style="text-align: center; color: #e27d60;">Unable to load sample data. Please check data.json file.</p>';
    }
}

// Display sample cards
function displaySamples(samples) {
    const container = document.getElementById('samples-container');
    container.innerHTML = '';

    if (samples.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #a8a8a8; margin-top: 40px;">No samples found matching your search.</p>';
        return;
    }

    samples.forEach((sample, index) => {
        const card = createSampleCard(sample, index);
        container.appendChild(card);
    });
}

// Setup filter functionality
function setupFilters() {
    // Framework filter buttons
    const frameworkButtons = document.querySelectorAll('[data-filter]');
    frameworkButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            frameworkButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update current filter
            currentFrameworkFilter = button.dataset.filter;
            applyFilters();
        });
    });

    // Version filter buttons
    const versionButtons = document.querySelectorAll('[data-version]');
    versionButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            versionButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update current filter
            currentVersionFilter = button.dataset.version;
            applyFilters();
        });
    });
}

// Apply all filters
function applyFilters() {
    const searchInput = document.getElementById('search-input');
    const searchQuery = searchInput.value.toLowerCase().trim();

    let filteredSamples = allSamples;

    // Apply framework filter
    if (currentFrameworkFilter !== 'all') {
        filteredSamples = filteredSamples.filter(sample =>
            sample.technologies.includes(currentFrameworkFilter)
        );
    }

    // Apply version filter
    if (currentVersionFilter !== 'all') {
        filteredSamples = filteredSamples.filter(sample =>
            sample.platform === currentVersionFilter
        );
    }

    // Apply search filter
    if (searchQuery !== '') {
        filteredSamples = filteredSamples.filter(sample => {
            const titleMatch = sample.title.toLowerCase().includes(searchQuery);
            const techMatch = sample.technologies.some(tech =>
                tech.toLowerCase().includes(searchQuery)
            );
            return titleMatch || techMatch;
        });
    }

    displaySamples(filteredSamples);
    updateSearchResults(filteredSamples.length, searchQuery);
}

// Update search results display
function updateSearchResults(count, query) {
    const searchResults = document.getElementById('search-results');

    if (query === '' && currentFrameworkFilter === 'all' && currentVersionFilter === 'all') {
        searchResults.textContent = '';
    } else if (count > 0) {
        searchResults.textContent = `Found ${count} sample${count > 1 ? 's' : ''}`;
    } else {
        searchResults.textContent = 'No samples found';
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');

    searchInput.addEventListener('input', () => {
        applyFilters();
    });
}

// Create sample card
function createSampleCard(sample, index) {
    const card = document.createElement('div');
    card.className = 'sample-card';
    card.style.animationDelay = `${index * 0.1}s`;

    // Platform badge in top-right corner
    const platformBadge = document.createElement('img');
    platformBadge.src = `assets/${sample.platform}.png`;
    platformBadge.alt = sample.platform;
    platformBadge.className = 'platform-badge';
    card.appendChild(platformBadge);

    // Title
    const title = document.createElement('h2');
    title.textContent = sample.title;
    card.appendChild(title);

    // Technology tags
    const techContainer = document.createElement('div');
    techContainer.className = 'technologies';
    sample.technologies.forEach(tech => {
        const tag = document.createElement('span');
        tag.className = 'tech-tag';
        tag.textContent = tech;
        techContainer.appendChild(tag);
    });
    card.appendChild(techContainer);

    // Links container
    const linksContainer = document.createElement('div');
    linksContainer.className = 'links';

    // Specials section (if available)
    if (sample.specials && sample.specials.length > 0) {
        const specialsContainer = document.createElement('div');
        specialsContainer.className = 'specials-container';

        const specialsTitle = document.createElement('h3');
        specialsTitle.className = 'specials-title';
        specialsTitle.textContent = '✨ Specials';
        specialsContainer.appendChild(specialsTitle);

        const specialsList = document.createElement('div');
        specialsList.className = 'specials-list';

        sample.specials.forEach(special => {
            const specialItem = document.createElement('div');
            specialItem.className = 'special-item';

            if (special.link) {
                const specialLink = document.createElement('a');
                specialLink.href = special.link;
                specialLink.className = 'special-link';
                specialLink.textContent = special.title;
                specialLink.target = '_blank';
                specialLink.rel = 'noopener noreferrer';
                specialItem.appendChild(specialLink);
            } else {
                const specialText = document.createElement('span');
                specialText.className = 'special-text';
                specialText.textContent = special.title;
                specialItem.appendChild(specialText);
            }

            specialsList.appendChild(specialItem);
        });

        specialsContainer.appendChild(specialsList);
        card.appendChild(specialsContainer);
    }

    // Screenshot gallery (if available)
    if (sample.scrreenshots && sample.scrreenshots.length > 0) {
        const gallery = document.createElement('div');
        gallery.className = 'screenshot-gallery';

        sample.scrreenshots.forEach((screenshot, idx) => {
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'screenshot-item';

            const img = document.createElement('img');
            img.src = `assets/${screenshot}`;
            img.alt = `${sample.title} screenshot ${idx + 1}`;
            img.loading = 'lazy';

            // Click to enlarge
            img.addEventListener('click', () => openLightbox(`assets/${screenshot}`, sample.title));

            imgWrapper.appendChild(img);
            gallery.appendChild(imgWrapper);
        });

        card.appendChild(gallery);
    }

    // Link type mapping (new format)
    const linkTypes = {
        code: { text: 'Code', class: 'code' },
        documentation: { text: 'Documentation', class: 'documentation' },
        video: { text: 'Video', class: 'video' }
    };

    // Create link buttons
    Object.entries(sample.links).forEach(([key, url]) => {
        if (url && linkTypes[key]) {
            const link = document.createElement('a');
            link.href = url;
            link.className = `link-btn ${linkTypes[key].class}`;
            link.textContent = linkTypes[key].text;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            linksContainer.appendChild(link);
        }
    });

    card.appendChild(linksContainer);
    return card;
}

// Image lightbox functionality
function openLightbox(imageSrc, title) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img src="${imageSrc}" alt="${title}">
            <div class="lightbox-title">${title}</div>
        </div>
    `;

    document.body.appendChild(lightbox);

    // Close functionality
    const closeBtn = lightbox.querySelector('.lightbox-close');
    closeBtn.addEventListener('click', () => lightbox.remove());
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.remove();
    });

    // ESC key to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            lightbox.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// Execute after page load
document.addEventListener('DOMContentLoaded', loadSamples);

// Add animation effects
const style = document.createElement('style');
style.textContent = `
    .sample-card {
        animation: fadeInUp 0.6s ease-out forwards;
        opacity: 0;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
