let players = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('player_profile.json');
        const data = await response.json();
        players = data.players;
        initFilters();
        applyFilters();
    } catch (e) {
        console.error("Data fetch failed", e);
    }
});

function timeToSeconds(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return 0;
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
    const seasons = [...new Set(players.map(p => p.season))].filter(Boolean).sort().reverse();
    const tournaments = [...new Set(players.map(p => p.tournament))].filter(Boolean).sort();

    sFilter.innerHTML = `<option value="all">All Seasons</option>` +
        seasons.map(s => `<option value="${s}">${s}</option>`).join('');

    tFilter.innerHTML = `<option value="all">All Tournaments</option>` +
        tournaments.map(t => `<option value="${t}">${t}</option>`).join('');
}

function applyFilters() {
    const selectedSeason = document.getElementById('seasonFilter').value;
    const selectedTourney = document.getElementById('tournamentFilter').value;

    const filtered = players.filter(p => {
        const matchSeason = selectedSeason === 'all' || p.season === selectedSeason;
        const matchTourney = selectedTourney === 'all' || p.tournament === selectedTourney;
        return matchSeason && matchTourney;
    });

    const attackers = [...filtered].sort((a, b) => b.stats.total_pts - a.stats.total_pts);
    const defenders = [...filtered].sort((a, b) => {
        return timeToSeconds(b.stats.avg_def_time) - timeToSeconds(a.stats.avg_def_time);
    });
    const impactPlayers = [...filtered].sort((a, b) => {
        const impactA = (a.stats.win_rate_with || 0) - (a.stats.win_rate_without || 0);
        const impactB = (b.stats.win_rate_with || 0) - (b.stats.win_rate_without || 0);
        return impactB - impactA;
    });

    renderCard(attackers, 'attacker', 'total_pts', ' Pts');
    renderCard(defenders, 'defender', 'avg_def_time', '');
    renderCard(impactPlayers, 'allrounder', 'win_rate_with', '% WR');
}

function renderCard(data, id, key, unit) {
    const podium = document.getElementById(`${id}-podium`);
    const list = document.getElementById(`${id}-list`);

    if (!data || data.length === 0) {
        podium.innerHTML = `<div class="p-3 text-center text-muted">No records found</div>`;
        list.innerHTML = "";
        return;
    }

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