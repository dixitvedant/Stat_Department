let leagueData = {};

async function initialize() {
    // 1. Load Navbar
    try {
        const navRes = await fetch("cmn_navbar.html");
        if (navRes.ok) document.getElementById("navbar").innerHTML = await navRes.text();
    } catch (err) { console.error("Navbar error:", err); }

    // 2. Load Table Data
    try {
        const response = await fetch("pointstable.json");
        leagueData = await response.json();

        // 3. Check URL for existing tournament parameter
        const urlParams = new URLSearchParams(window.location.search);
        const urlTournament = urlParams.get('tournament');

        setupTournamentSelector(leagueData.tournaments, urlTournament);
        
        // Render either the URL tournament or the first one in the list
        const initialTournament = urlTournament || leagueData.tournaments[0];
        renderTable(initialTournament);
        
    } catch (err) {
        console.error("Error loading JSON data:", err);
    }
}

function setupTournamentSelector(tournaments, selectedValue) {
    const selector = document.getElementById("tournamentSelect");
    
    selector.innerHTML = tournaments.map(t => 
        `<option value="${t}" ${t === selectedValue ? 'selected' : ''}>${t}</option>`
    ).join('');

    selector.addEventListener('change', (event) => {
        const newTournament = event.target.value;
        
        // Update URL without refreshing the page
        const newUrl = `${window.location.pathname}?tournament=${encodeURIComponent(newTournament)}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        
        renderTable(newTournament);
    });
}

function renderTable(tournamentName) {
    const tableBody = document.getElementById("pointsTableBody");
    const data = leagueData.tables[tournamentName] || [];

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-5">No data available for "${tournamentName}".</td></tr>`;
        return;
    }

    tableBody.innerHTML = data.map(team => `
        <tr onclick="goToTeamPlayers('${team.name}', '${tournamentName}')" class="clickable-row" style="cursor:pointer;">
            <td class="text-center"><span class="pos-badge">${team.pos}</span></td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="team-logo-placeholder me-3">
                        <i class="bi bi-shield-fill text-primary"></i>
                    </div>
                    <span class="fw-bold text-dark">${team.name}</span>
                </div>
            </td>
            <td class="text-center fw-semibold text-secondary">${team.played}</td>
            <td class="text-center text-success fw-bold">${team.win}</td>
            <td class="text-center text-danger fw-bold">${team.loss}</td>
            <td class="text-center text-muted">${team.nr}</td>
            <td class="text-center"><span class="pts-badge">${team.pts}</span></td>
            <td class="text-center">
                <div class="form-container">
                    ${team.form.map(res => {
                        const statusClass = res === 'W' ? 'form-w' : (res === 'L' ? 'form-l' : 'form-d');
                        return `<span class="form-circle ${statusClass}">${res}</span>`;
                    }).join('')}
                </div>
            </td>
        </tr>
    `).join('');
}

function goToTeamPlayers(teamName, tournamentName) {
    window.location.href = `playerstep1.html?team=${encodeURIComponent(teamName)}&tournament=${encodeURIComponent(tournamentName)}`;
}

document.addEventListener('DOMContentLoaded', initialize);