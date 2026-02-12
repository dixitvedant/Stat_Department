let players = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('player_profile.json');
        const data = await response.json();
        players = data.players;

        initFilters();
        applyFilters();
    } catch (e) { console.error("Data fetch failed", e); }
});

// Helper to convert "1m 15s" to total seconds for sorting
function timeToSeconds(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(' ');
    let seconds = 0;
    parts.forEach(p => {
        if (p.includes('m')) seconds += parseInt(p) * 60;
        if (p.includes('s')) seconds += parseInt(p);
    });
    return seconds;
}

function initFilters() {
    const sFilter = document.getElementById('seasonFilter');
    const tFilter = document.getElementById('tournamentFilter');

    // Defaulting to "All" if seasons/tournaments aren't in your current JSON
    sFilter.innerHTML = `<option value="all">All Seasons</option>`;
    tFilter.innerHTML = `<option value="all">All Tournaments</option>`;
}

function applyFilters() {
    // 1. BEST ATTACKERS (Sorted by total_pts)
    const attackers = [...players].sort((a, b) => b.stats.total_pts - a.stats.total_pts);

    // 2. BEST DEFENDERS (Sorted by converting avg_def_time string to seconds)
    const defenders = [...players].sort((a, b) => {
        return timeToSeconds(b.stats.avg_def_time) - timeToSeconds(a.stats.avg_def_time);
    });

    // 3. ALL-ROUNDERS (Sorted by a mix of points and defensive success)
    const allRounders = [...players].sort((a, b) => {
        const scoreA = a.stats.total_pts + (a.stats.dream_runs * 10); // Weighting dream runs heavily
        const scoreB = b.stats.total_pts + (b.stats.dream_runs * 10);
        return scoreB - scoreA;
    });

    renderCard(attackers, 'attacker', 'total_pts', ' Pts');
    renderCard(defenders, 'defender', 'avg_def_time', ''); // Time already has 's'
    renderCard(allRounders, 'allrounder', 'success_rate', '% Success');
}

function renderCard(data, id, key, unit) {
    const podium = document.getElementById(`${id}-podium`);
    const list = document.getElementById(`${id}-list`);

    if (!data.length) {
        podium.innerHTML = "No Data";
        list.innerHTML = "";
        return;
    }

    const top = data[0];
    podium.innerHTML = `
        <div class="top-hero shadow-sm">
            <span class="rank-crown">RANK 1</span>
            <img src="${top.image}" alt="${top.name}" onerror="this.src='https://placehold.co/200'">
            <h4>${top.name}</h4>
            <p>${top.team} | ${top.role}</p>
            <div class="top-stat">${top.stats[key]}${unit}</div>
        </div>
    `;

    list.innerHTML = data.slice(1, 5).map((p, i) => `
        <div class="mini-row">
            <div class="mini-rank">#${i + 2}</div>
            <div class="mini-info">
                <b>${p.name}</b>
                <span>${p.team}</span>
            </div>
            <div class="mini-score">${p.stats[key]}${unit}</div>
        </div>
    `).join('');
}