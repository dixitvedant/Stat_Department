/** * SECTION 1: CONFIGURATION & GLOBAL STATE */
const CONFIG = {
    MODE: 'DEV', 
    LOCAL_PATH: 'match_wise.json',
    API_URL: 'https://api.khokhostats.com/v1/matches',
    PAGE_SIZE: 9 // Show 9 matches per page (3x3 grid)
};

let currentPage = 1;
let debounceTimer;
let isInitialLoad = true; 
let cachedMatches = []; 

/**
 * SECTION 2: DATA & FILTER LOGIC
 */
async function getMatchesFromServer(filters, page) {
    if (CONFIG.MODE === 'DEV') {
        if (cachedMatches.length === 0) {
            const response = await fetch(CONFIG.LOCAL_PATH);
            const data = await response.json();
            cachedMatches = data.matches;
            populateFilters(cachedMatches);
            applyUrlParams();
        }

        let filtered = cachedMatches.filter(m => {
            const matchSearch = !filters.query || m.name.toLowerCase().includes(filters.query.toLowerCase());
            const matchYear = !filters.year || filters.year === 'all' || m.date.includes(filters.year);
            const matchTourney = !filters.tournament || filters.tournament === 'all' || m.tournament === filters.tournament;
            
            return matchSearch && matchYear && matchTourney;
        });

        const start = (page - 1) * CONFIG.PAGE_SIZE;
        const end = start + CONFIG.PAGE_SIZE;
        const totalPages = Math.ceil(filtered.length / CONFIG.PAGE_SIZE);

        return {
            matches: filtered.slice(start, end),
            totalCount: filtered.length,
            totalPages: totalPages,
            currentPage: page
        };
    } else {
        const params = new URLSearchParams({ ...filters, page, limit: CONFIG.PAGE_SIZE });
        const response = await fetch(`${CONFIG.API_URL}?${params}`);
        return await response.json();
    }
}

/**
 * SECTION 3: UI RENDERING
 */
function populateFilters(matches) {
    const years = new Set();
    const tournaments = new Set();

    matches.forEach(m => {
        if (m.tournament) tournaments.add(m.tournament);
        const yearMatch = m.date.match(/\d{4}/);
        if (yearMatch) years.add(yearMatch[0]);
    });

    updateDropdown("filterYear", Array.from(years).sort((a, b) => b - a), "Year");
    updateDropdown("filterTournament", tournaments, "Tournament");
}

function updateDropdown(id, values, label) {
    const select = document.getElementById(id);
    if (!select) return;
    let html = `<option value="" selected disabled>Select ${label}</option>`;
    html += `<option value="all">All ${label}s</option>`;
    values.forEach(val => { html += `<option value="${val}">${val}</option>`; });
    select.innerHTML = html;
}

function renderMatchUI(data) {
    const container = document.getElementById("matchList");
    const initialPrompt = document.getElementById("initialPrompt");
    if (initialPrompt) initialPrompt.classList.add('d-none');
    
    container.innerHTML = ""; // Always clear container for new page
    
    document.getElementById("matchCount").innerText = `Matches Found: ${data.totalCount}`;
    document.getElementById("noResults").classList.toggle('d-none', data.matches.length > 0);

    const currentYear = document.getElementById("filterYear").value;
    const currentTourney = document.getElementById("filterTournament").value;

    data.matches.forEach(match => {
        const detailsUrl = `match_details.html?id=${match.id}&year=${encodeURIComponent(currentYear)}&tournament=${encodeURIComponent(currentTourney)}`;

        const col = document.createElement("div");
        col.className = "col";
        col.innerHTML = `
            <a href="${detailsUrl}" class="match-card h-100 text-decoration-none d-block p-4 bg-white rounded-4 shadow-sm border transition-all">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="text-muted small fw-bold" style="font-size: 0.75rem;">${match.tournament}</span>
                </div>
                <h3 class="h5 fw-bold text-dark mb-1">${match.name}</h3>
                <p class="small text-muted mb-3"><i class="bi bi-calendar3 me-2"></i>${match.date}</p>
                <div class="score-display p-2 rounded-3 mb-3 text-center border bg-light">
                    <span class="fw-bold text-primary">${match.score}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-auto pt-2">
                    <span class="badge ${match.winner === 'Draw' ? 'bg-warning text-dark' : 'bg-primary-subtle text-primary'}">
                        ${match.winner === 'Draw' ? 'Draw' : 'Winner: ' + match.winner}
                    </span>
                    <span class="text-primary fw-bold small">Details <i class="bi bi-arrow-right"></i></span>
                </div>
            </a>`;
        container.appendChild(col);
    });

    renderPagination(data.totalPages, data.currentPage);
}

function renderPagination(totalPages, activePage) {
    const nav = document.getElementById("paginationControls");
    nav.innerHTML = "";

    if (totalPages <= 1) return;

    // Previous Button
    const prevClass = activePage === 1 ? 'disabled' : '';
    nav.innerHTML += `
        <li class="page-item ${prevClass}">
            <a class="page-link" href="#" onclick="goToPage(${activePage - 1})">Previous</a>
        </li>`;

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === activePage ? 'active' : '';
        nav.innerHTML += `
            <li class="page-item ${activeClass}">
                <a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>
            </li>`;
    }

    // Next Button
    const nextClass = activePage === totalPages ? 'disabled' : '';
    nav.innerHTML += `
        <li class="page-item ${nextClass}">
            <a class="page-link" href="#" onclick="goToPage(${activePage + 1})">Next</a>
        </li>`;
}

/**
 * SECTION 4: CONTROLLERS
 */
function goToPage(page) {
    event.preventDefault();
    currentPage = page;
    updateView(false); // false means don't reset to page 1
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateUrlParams(filters) {
    const url = new URL(window.location);
    if (filters.year && filters.year !== 'all') url.searchParams.set('year', filters.year);
    else url.searchParams.delete('year');

    if (filters.tournament && filters.tournament !== 'all') url.searchParams.set('tournament', filters.tournament);
    else url.searchParams.delete('tournament');

    if (filters.query) url.searchParams.set('search', filters.query);
    else url.searchParams.delete('search');

    url.searchParams.set('page', currentPage);
    window.history.pushState({}, '', url);
}

async function updateView(isNewSearch = true) {
    const query = document.getElementById("searchInput").value;
    const year = document.getElementById("filterYear").value;
    const tournament = document.getElementById("filterTournament").value;

    const hasInteracted = query.length > 0 || (year !== "" && year !== "all") || (tournament !== "" && tournament !== "all");

    if (isInitialLoad && !hasInteracted) {
        document.getElementById("initialPrompt").classList.remove('d-none');
        document.getElementById("matchCount").innerText = "Ready to search";
        if(cachedMatches.length === 0) await getMatchesFromServer({query: ''}, 1);
        return;
    }

    isInitialLoad = false; 
    if (isNewSearch) {
        currentPage = 1;
        updateUrlParams({ query, year, tournament });
    }

    document.getElementById("loadingSpinner").classList.remove('d-none');
    try {
        const data = await getMatchesFromServer({ query, year, tournament }, currentPage);
        renderMatchUI(data);
    } catch (e) {
        console.error("Data load failed", e);
    }
    document.getElementById("loadingSpinner").classList.add('d-none');
}

function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const year = params.get('year');
    const tournament = params.get('tournament');
    const search = params.get('search');
    const page = params.get('page');

    if (year) document.getElementById("filterYear").value = year;
    if (tournament) document.getElementById("filterTournament").value = tournament;
    if (search) document.getElementById("searchInput").value = search;
    if (page) currentPage = parseInt(page);
    
    if (year || tournament || search || page) {
        updateView(false);
    }
}

// LISTENERS
document.getElementById("searchInput").addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => updateView(true), 500);
});

["filterYear", "filterTournament"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", () => updateView(true));
});

document.getElementById("resetFilters").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("filterYear").selectedIndex = 0;
    document.getElementById("filterTournament").selectedIndex = 0;
    const url = new URL(window.location);
    url.search = "";
    window.history.pushState({}, '', url);
    isInitialLoad = true;
    currentPage = 1;
    document.getElementById("matchList").innerHTML = "";
    document.getElementById("paginationControls").innerHTML = "";
    document.getElementById("initialPrompt").classList.remove('d-none');
    updateView(true);
});

window.onload = () => updateView(true);