/**
 * GLOBAL STATE
 */
let allTournaments = []; 

/**
 * INITIALIZATION
 */
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("leaderboard.json");
        const data = await response.json();
        
        allTournaments = data.tournaments;

        const tFilter = document.getElementById('tournamentFilter');
        if (tFilter && allTournaments.length > 0) {
            // Populate dropdown with tournament names
            tFilter.innerHTML = allTournaments.map(t => 
                `<option value="${t.tournament_name}">${t.tournament_name}</option>`
            ).join('');
            
            // Listen for changes to update the cards AND the URL
            tFilter.addEventListener('change', applyFilters);
        }

        // Check if there is already a tournament in the URL (e.g., coming back from a profile)
        const urlParams = new URLSearchParams(window.location.search);
        const urlTournament = urlParams.get('tournament');
        
        if (urlTournament && tFilter) {
            tFilter.value = urlTournament;
        }

        // Initial render
        applyFilters();
    } catch (e) {
        console.error("Error loading leaderboard data:", e);
    }
});

/**
 * CORE LOGIC
 */
function applyFilters() {
    const tFilter = document.getElementById('tournamentFilter');
    const selectedTournamentName = tFilter.value;

    if (!selectedTournamentName) return;

    // --- NEW LOGIC: Update the Browser URL when a tournament is selected ---
    const newUrl = `${window.location.pathname}?tournament=${encodeURIComponent(selectedTournamentName)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    // -----------------------------------------------------------------------

    // Find the tournament object matching the dropdown selection
    const selectedData = allTournaments.find(t => t.tournament_name === selectedTournamentName);

    if (selectedData) {
        const boards = selectedData.leaderboards;
        
        // Render the three categories
        // We pass the tournament name so the links can be built correctly
        renderCard(boards.attackers, 'attacker', selectedTournamentName);
        renderCard(boards.defenders, 'defender', selectedTournamentName);
        renderCard(boards.mvp, 'allrounder', selectedTournamentName); 
    }
}

/**
 * UI RENDERING
 */
function renderCard(data, id, tournamentName) {
    const podium = document.getElementById(`${id}-podium`);
    const list = document.getElementById(`${id}-list`);

    if (!podium || !list) return;

    // Clear previous content
    podium.innerHTML = "";
    list.innerHTML = "";

    if (!data || data.length === 0) {
        podium.innerHTML = `<div class="p-3 text-center text-muted">No records found</div>`;
        return;
    }

    // TOP PERFORMER (#1 Rank)
    const top = data[0];
    // Create the deep link URL (Using name as ID for now based on your JSON)
    const topLink = `player_profile.html?playerId=${encodeURIComponent(top.name)}&tournament=${encodeURIComponent(tournamentName)}`;

    podium.innerHTML = `
        <div class="top-hero shadow-sm" onclick="window.location.href='${topLink}'" style="cursor: pointer;">
            <span class="rank-crown"><i class="bi bi-trophy-fill"></i> #1</span>
            <img src="${top.image}" alt="${top.name}" onerror="this.src='https://placehold.co/200'">
            <h4>${top.name}</h4>
            <p>${top.team}</p>
            <div class="top-stat">${top.value} ${top.label}</div>
        </div>
    `;

    // RUNNERS UP (#2 - #5 Rank)
    if (data.length > 1) {
        list.innerHTML = data.slice(1, 5).map((p) => {
            const runnerLink = `player_profile.html?playerId=${encodeURIComponent(p.name)}&tournament=${encodeURIComponent(tournamentName)}`;
            return `
                <div class="mini-row" onclick="window.location.href='${runnerLink}'" style="cursor: pointer;">
                    <div class="mini-rank">#${p.rank}</div>
                    <div class="mini-info">
                        <b>${p.name}</b>
                        <span>${p.team}</span>
                    </div>
                    <div class="mini-score">${p.value} ${p.label}</div>
                </div>
            `;
        }).join('');
    }
}