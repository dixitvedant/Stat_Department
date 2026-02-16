/**
 * GLOBAL STATE
 * Storage for player data once fetched, accessible to all functions.
 */
let players = [];

/**
 * INITIALIZATION
 * Triggered when the page loads. Fetches the JSON data and sets up the UI.
 */
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetching player data from the profile JSON file
        const response = await fetch('leaderboard.json');
        const data = await response.json();

        players = data.players;

        // Initialize dropdown filters based on available data (Seasons/Tournaments)
        initFilters();

        // Run initial filter to display data immediately on load
        applyFilters();
    } catch (e) {
        console.error("Data fetch failed - check if player_profile.json exists", e);
    }
});

/**
 * UTILITY: TIME CONVERTER
 * Kho Kho defense time is usually "3m 40s". 
 * This function converts that string into total seconds so we can compare/sort them.
 */
function timeToSeconds(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(' ');
    let seconds = 0;
    parts.forEach(p => {
        if (p.includes('m')) seconds += parseInt(p) * 60; // Convert minutes to seconds
        if (p.includes('s')) seconds += parseInt(p);      // Add remaining seconds
    });
    return seconds;
}

/**
 * UI LOGIC: FILTER INITIALIZATION
 * Scans the players list to find all unique Seasons and Tournaments 
 * and populates the <select> dropdowns automatically.
 */
function initFilters() {
    const sFilter = document.getElementById('seasonFilter');
    const tFilter = document.getElementById('tournamentFilter');

    // Create a unique, sorted list of Seasons (removes duplicates)
    const seasons = [...new Set(players.map(p => p.season))].filter(Boolean).sort().reverse();

    // Create a unique, sorted list of Tournaments
    const tournaments = [...new Set(players.map(p => p.tournament))].filter(Boolean).sort();

    // Inject options into the Season dropdown
    sFilter.innerHTML = `<option value="all">All Seasons</option>` +
        seasons.map(s => `<option value="${s}">${s}</option>`).join('');

    // Inject options into the Tournament dropdown
    tFilter.innerHTML = `<option value="all">All Tournaments</option>` +
        tournaments.map(t => `<option value="${t}">${t}</option>`).join('');
}

/**
 * CORE LOGIC: DATA FILTERING & SORTING
 * Filters players by selected dropdown values, then sorts them into 
 * three categories: Best Attackers, Best Defenders, and Impact Players.
 */
function applyFilters() {
    const selectedSeason = document.getElementById('seasonFilter').value;
    const selectedTourney = document.getElementById('tournamentFilter').value;

    // 1. Filter raw data based on dropdown selection
    const filtered = players.filter(p => {
        const matchSeason = selectedSeason === 'all' || p.season === selectedSeason;
        const matchTourney = selectedTourney === 'all' || p.tournament === selectedTourney;
        return matchSeason && matchTourney;
    });

    // 2. Sort for Attackers: Based on total points (Highest to Lowest)
    const attackers = [...filtered].sort((a, b) => b.stats.total_pts - a.stats.total_pts);

    // 3. Sort for Defenders: Based on defense time (Longest to Shortest)
    const defenders = [...filtered].sort((a, b) => {
        return timeToSeconds(b.stats.avg_def_time) - timeToSeconds(a.stats.avg_def_time);
    });

    // 4. Sort for Impact: Calculated by Win Rate difference (Player's influence on game outcome)
    const impactPlayers = [...filtered].sort((a, b) => {
        const impactA = (a.stats.win_rate_with || 0) - (a.stats.win_rate_without || 0);
        const impactB = (b.stats.win_rate_with || 0) - (b.stats.win_rate_without || 0);
        return impactB - impactA;
    });

    // 5. Render the data to the UI using the shared render function
    renderCard(attackers, 'attacker', 'total_pts', ' Pts');
    renderCard(defenders, 'defender', 'avg_def_time', '');
    renderCard(impactPlayers, 'allrounder', 'win_rate_with', '% WR');
}

/**
 * UI LOGIC: RENDERING
 * Generates the HTML for the "Podium" (#1 spot) and the "Mini Rows" (#2 to #5 spots).
 */
function renderCard(data, id, key, unit) {
    const podium = document.getElementById(`${id}-podium`);
    const list = document.getElementById(`${id}-list`);

    // Handle empty data cases
    if (!data || data.length === 0) {
        podium.innerHTML = `<div class="p-3 text-center text-muted">No records found</div>`;
        list.innerHTML = "";
        return;
    }

    // TOP PERFORMER (#1 Rank): High-visibility hero card
    const top = data[0];
    podium.innerHTML = `
        <a href="player_profile.html?id=${top.id}" class="player-link">
            <div class="top-hero shadow-sm">
                <span class="rank-crown"><i class="bi bi-trophy-fill"></i> #1</span>
                <img src="${top.image}" alt="${top.name}" onerror="this.src='https://placehold.co/200'">
                <h4>${top.name}</h4>
                <p>${top.team}</p>
                <div class="top-stat">${top.stats[key]}${unit}</div>
            </div>
        </a>
    `;

    // RUNNERS UP (#2 - #5 Rank): Compact horizontal rows
    list.innerHTML = data.slice(1, 5).map((p, i) => `
        <a href="player_profile.html?id=${p.id}" class="player-link">
            <div class="mini-row">
                <div class="mini-rank">#${i + 2}</div>
                <div class="mini-info">
                    <b>${p.name}</b>
                    <span>${p.team}</span>
                </div>
                <div class="mini-score">${p.stats[key]}${unit}</div>
            </div>
        </a>
    `).join('');
}
