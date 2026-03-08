// URL PARAM
const params = new URLSearchParams(window.location.search);
const matchId = params.get("matchId") || params.get("id");

// DOM
const typeSelect = document.getElementById("typeSelect");
const inningSelect = document.getElementById("inningSelect");
const chartSection = document.getElementById("chartSection");
const canvas = document.getElementById("tornadoChart");

// INITIAL
if (inningSelect) inningSelect.disabled = true;

let chart = null;
let matchData = null;
let defenceData = {};
let rosterData = {};
let masterPlayersList = []; // Global variable to store IDs and Names

// LOADER FUNCTIONS
function showLoader() {
    const loader = document.getElementById("chartLoader");
    if (loader) loader.classList.remove("d-none");
    if (canvas) canvas.classList.add("d-none"); 
}

function hideLoader() {
    const loader = document.getElementById("chartLoader");
    if (loader) loader.classList.add("d-none");
    if (canvas) canvas.classList.remove("d-none");
}

// FETCH ALL DATA
Promise.all([
    fetch("http://127.0.0.1:5000/match-details").then(r => r.json()),
    fetch("http://127.0.0.1:5000/attacker").then(r => r.json()),
    fetch("http://127.0.0.1:5000/defence").then(r => r.json()),
    fetch("http://127.0.0.1:5000/player-season").then(r => r.json()), // Master table for ID-to-Name lookup
    fetch("http://127.0.0.1:5000/roaster").then(r => r.json())       // Roster containing IDs
]).then(([matches, attack, defence, players, roster]) => {
    
    // Store master players for lookup logic
    masterPlayersList = players.players;

    const matchInfo = matches.matches.find(x => String(x.id) === String(matchId));

    if (!matchInfo) {
        console.error("Match ID not found:", matchId);
        document.getElementById("matchTitle").textContent = "Match Not Found";
        return;
    }

    matchData = { ...matchInfo, attack: attack[matchId] || {} };
    defenceData = defence[matchId]?.defence || {};
    rosterData = roster[matchId] || null;

    document.getElementById("matchTitle").textContent = matchInfo.name;
    document.getElementById("matchId").textContent = `Match ID: ${matchId}`;

    document.getElementById("ovWinner").textContent = matchInfo.winner || "–";
    document.getElementById("ovWickets").textContent = matchInfo.totalWickets || "–";
    document.getElementById("ovAttacker").textContent = matchInfo.bestAttacker || "–";
    document.getElementById("ovDefender").textContent = matchInfo.bestDefender || "–";

    if (rosterData) loadRoster(matchId);

    // H2H SECTION
   fetch("http://127.0.0.1:5000/h2h")
    .then(res => res.json())
    .then(h2hData => {

        const h2hContent = document.getElementById("h2hContent");

        // Get team names from roster
        const teamAName = rosterData?.home_team?.name;
        const teamBName = rosterData?.away_team?.name;

        if (!teamAName || !teamBName) {
            h2hContent.innerHTML =
                "<p class='text-muted'>Team data not available.</p>";
            return;
        }

        // 🔥 IMPORTANT: Create sorted key (same logic as backend)
        let key1 = `${teamAName} vs ${teamBName}`;
	let key2 = `${teamBName} vs ${teamAName}`;

	let h2hMatches = h2hData[key1] || h2hData[key2] || [];
        if (!h2hMatches.length) {
            h2hContent.innerHTML =
                "<p class='text-muted'>No previous matches found.</p>";
            return;
        }

        const total = h2hMatches.length;

        const teamAWins = h2hMatches.filter(
            m => m.winner === teamAName
        ).length;

        const teamBWins = h2hMatches.filter(
            m => m.winner === teamBName
        ).length;

        const draws = h2hMatches.filter(
            m => m.winner === "Draw"
        ).length;

        const teamAPercent = ((teamAWins / total) * 100).toFixed(1);
        const drawPercent = ((draws / total) * 100).toFixed(1);
        const teamBPercent = ((teamBWins / total) * 100).toFixed(1);

        h2hContent.innerHTML = `
            <h6 class="mt-3 mb-2 text-center">
                Last ${total} Matches
            </h6>

            <div class="d-flex justify-content-between mb-1 fw-semibold small">
                <span>${teamAName} (${teamAWins})</span>
                <span>Draws (${draws})</span>
                <span>${teamBName} (${teamBWins})</span>
            </div>

            <div style="display:flex;height:14px;border-radius:8px;overflow:hidden;background:#e5e7eb;">
                <div style="width:${teamAPercent}%;background:#2563eb;"></div>
                <div style="width:${drawPercent}%;background:#9ca3af;"></div>
                <div style="width:${teamBPercent}%;background:#dc2626;"></div>
            </div>

            <table class="table table-striped mt-4 small">
                <thead>
                    <tr>
                        <th>Match</th>
                        <th>Date</th>
                        <th>Score</th>
                        <th>Winner</th>
                    </tr>
                </thead>
                <tbody>
                    ${h2hMatches.map(m => `
                        <tr>
                            <td>${m.match || "–"}</td>
                            <td>${m.date || "–"}</td>
                            <td>${m.score || "–"}</td>
                            <td class="fw-semibold">${m.winner || "–"}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    })
    .catch(err => console.error("H2H load failed:", err));
});

// MVP SECTION
fetch("http://127.0.0.1:5000/LeaderBoard")
    .then(r => r.json())
    .then(mvpData => {
        const list = mvpData[matchId];
        if (!list || list.length === 0) return;
        list.sort((a, b) => b.points - a.points);
        const top = list[0];
        document.getElementById("topMvpName").textContent = top.name;
        document.getElementById("topMvpRole").textContent = top.role;
        document.getElementById("topMvpPoints").textContent = `${top.points} pts`;
        renderMvpList(list);

        document.getElementById("mvpRoleFilter").addEventListener("change", e => {
            const role = e.target.value;
            let filtered = role === "All" ? list : list.filter(p => p.role === role).slice(0, 3);
            renderMvpList(filtered);
        });
    });

function renderMvpList(players) {
    const container = document.getElementById("mvpList");
    container.innerHTML = "";
    players.forEach((p, i) => {
        container.innerHTML += `
            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                <strong>#${i + 1} ${p.name}</strong>
                <span class="badge bg-secondary">${p.role}</span>
                <span class="fw-bold">${p.points} pts</span>
            </div>`;
    });
}

// Chart Logic
typeSelect.addEventListener("change", () => {
    inningSelect.value = "";
    inningSelect.disabled = !typeSelect.value;
    chartSection.classList.add("hidden");
    if (chart) chart.destroy();
});

inningSelect.addEventListener("change", () => {
    if (!typeSelect.value || !inningSelect.value) return;
    chartSection.classList.remove("hidden");
    showLoader();
    if (typeSelect.value === "attack") drawAttack(inningSelect.value);
    if (typeSelect.value === "defence") drawDefence(inningSelect.value);
});

function drawAttack(inning) {
    const data = matchData.attack?.[inning];
    if (!data) { hideLoader(); return alert("Attack data not found"); }
    const labels = Object.keys(data);
    const teamNames = Object.keys(data[labels[0]]);
    const teamAName = teamNames[0];
    const teamBName = teamNames[1];

    const teamA = labels.map(p => -data[p][teamAName]);
    const teamB = labels.map(p => data[p][teamBName]);
    if (chart) chart.destroy();
    chart = new Chart(canvas, {
        type: "bar",
        data: {
            labels,
            datasets: [
                { label: "Team A", data: teamA, backgroundColor: "#2563eb" },
                { label: "Team B", data: teamB, backgroundColor: "#f97316" }
            ]
        },
        options: {
            indexAxis: "y",
            scales: {
                x: { stacked: true, ticks: { callback: v => Math.abs(v) } },
                y: { stacked: true }
            }
        }
    });
    hideLoader();
}

function drawDefence(inning) {
    const inningData = defenceData[inning];
    const firstTeam = Object.keys(inningData)[0];
    const timeline = inningData[firstTeam];
    if (!timeline) { hideLoader(); return alert("Defence data not found"); }
    if (chart) chart.destroy();
    chart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: timeline.map(d => d.batch),
            datasets: [{ label: "Duration", data: timeline.map(d => d.duration), backgroundColor: "#22c55e" }]
        },
        options: { indexAxis: "y" }
    });
    hideLoader();
}

// ROSTER LOADING
function loadRoster(matchId) {
    try {
        if (!rosterData) {
            console.error("Roster data missing");
            return;
        }

        const home = rosterData.home_team;
        const away = rosterData.away_team;

        if (!home || !away) {
            console.error("Invalid roster structure");
            return;
        }

        // ✅ Set Team Names
        document.getElementById("teamAName").innerText = home.name;
        document.getElementById("teamBName").innerText = away.name;

        // Helper to fill list
        function populateList(id, players) {
            const ul = document.getElementById(id);
            if (!ul) return;

            ul.innerHTML = "";

            if (players && players.length > 0) {
                players.forEach(player => {
                    const li = document.createElement("li");
                    li.className = "mb-1";
                    li.textContent = player;
                    ul.appendChild(li);
                });
            } else {
                ul.innerHTML = "<li>No players available</li>";
            }
        }

        // ✅ Fill Home Team
        populateList("teamAAttackers", home.attackers);
        populateList("teamADefenders", home.defenders);
        populateList("teamAAll", home.allRounders);

        // ✅ Fill Away Team
        populateList("teamBAttackers", away.attackers);
        populateList("teamBDefenders", away.defenders);
        populateList("teamBAll", away.allRounders);

    } catch (err) {
        console.error("Roster load failed:", err);
    }
}
/**
 * UPDATED FUNCTION: 
 * Instead of linking to playerstep1.html, it links to the players list page
 * with a search parameter. Change "players.html" to your actual search page name.
 */
function fillListWithStats(listId, idArray, statsContainerId) {
    const ul = document.getElementById(listId);
    if (!ul) return;
    ul.innerHTML = "";

    idArray.forEach(playerId => {
        const playerInfo = masterPlayersList.find(p => p.id === playerId);
        const displayName = playerInfo ? playerInfo.name : playerId;

        const li = document.createElement("li");
        li.className = "player-item-link";
        
        // CHANGED: Link now points to search results rather than a direct profile page
        // Use 'players.html' or 'index.html' depending on where your search bar is.
        li.innerHTML = `<a href="playerstep1.html?search=${encodeURIComponent(playerId)}" class="roster-link">${displayName}</a>`;
        ul.appendChild(li);
    });

    const statsContainer = document.getElementById(statsContainerId);
    const totalPlayers = getTotalPlayers(statsContainerId);

    if (totalPlayers > 0 && idArray.length > 0) {
        const roleName = listId.includes("Attackers") ? "Attackers" : listId.includes("Defenders") ? "Defenders" : "All-Rounders";
        const count = idArray.length;
        const percent = ((count / totalPlayers) * 100).toFixed(1);

        const statCard = document.createElement("div");
        statCard.className = "stat-card mb-2 p-2";
        statCard.innerHTML = `
            <div class="stat-label small">${roleName}: ${count} (${percent}%)</div>
            <div class="progress" style="height: 5px;"><div class="progress-bar ${roleName === 'Attackers' ? 'bg-danger' : roleName === 'Defenders' ? 'bg-success' : 'bg-warning'}" style="width: ${percent}%"></div></div>`;
        statsContainer.appendChild(statCard);
    }
}

function getTotalPlayers(statsContainerId) {
    const team = statsContainerId === "teamAStats" 
        ? rosterData.home_team 
        : rosterData.away_team;

    if (!team) return 0;

    return (team.attackers?.length || 0) +
           (team.defenders?.length || 0) +
           (team.allRounders?.length || 0);
}

// Section Switching
document.querySelectorAll(".section-content").forEach(s => s.classList.add("hidden"));
const rosterSection = document.getElementById("roster");
if (rosterSection) rosterSection.classList.remove("hidden");

document.querySelectorAll("#sectionNav .nav-link").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll("#sectionNav .nav-link").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".section-content").forEach(s => s.classList.add("hidden"));
        btn.classList.add("active");
        const target = document.getElementById(btn.dataset.section);
        if (target) target.classList.remove("hidden");
    });
});
