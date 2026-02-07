// URL PARAM
const params = new URLSearchParams(window.location.search);
// Check both possible keys
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
    fetch("matches_data.json").then(r => r.json()),
    fetch("attack.json").then(r => r.json()),
    fetch("defence.json").then(r => r.json()),
    fetch("players.json").then(r => r.json()),
    fetch("roster.json").then(r => r.json())
]).then(([matches, attack, defence, players, roster]) => {
    // Robust ID matching
    const matchInfo = matches.matches.find(x => String(x.id) === String(matchId));

    if (!matchInfo) {
        console.error("Match ID not found:", matchId);
        document.getElementById("matchTitle").textContent = "Match Not Found";
        return;
    }

    matchData = { ...matchInfo, attack: attack[matchId] || {} };
    defenceData = defence[matchId]?.defence || {};
    rosterData = roster[matchId] || null;

    // UPDATE HEADER
    document.getElementById("matchTitle").textContent = matchInfo.name;
    document.getElementById("matchId").textContent = `Match ID: ${matchId}`;

    // UPDATE OVERVIEW
    document.getElementById("ovWinner").textContent = matchInfo.winner || "–";
    document.getElementById("ovWickets").textContent = matchInfo.totalWickets || "–";
    document.getElementById("ovAttacker").textContent = matchInfo.bestAttacker || "–";
    document.getElementById("ovDefender").textContent = matchInfo.bestDefender || "–";

    // LOAD ROSTER SECTION
    if (rosterData) loadRoster();

    // -------------------- H2H SECTION --------------------
    fetch("h2h.json")
        .then(res => res.json())
        .then(h2hData => {
            const h2hMatches = h2hData[matchId];
            const h2hContent = document.getElementById("h2hContent");

            if (!h2hMatches || h2hMatches.length === 0) {
                h2hContent.innerHTML = "<p class='text-muted'>No previous matches found.</p>";
                return;
            }

            const teamAName = rosterData?.teamA?.name || "Team A";
            const teamBName = rosterData?.teamB?.name || "Team B";

            const teamAWins = h2hMatches.filter(m => m.winner === teamAName).length;
            const teamBWins = h2hMatches.filter(m => m.winner === teamBName).length;
            const draws = h2hMatches.filter(m => m.winner === "Draw").length;
            const total = h2hMatches.length;

            const teamAPercent = (teamAWins / total) * 100;
            const drawPercent = (draws / total) * 100;
            const teamBPercent = (teamBWins / total) * 100;

            h2hContent.innerHTML = `
                <h6 class="mt-3 mb-2 text-center">Last ${total} Matches</h6>
                <div class="d-flex justify-content-between mb-1 fw-semibold small">
                    <span>${teamAName} (${teamAWins})</span>
                    <span>Draws (${draws})</span>
                    <span>${teamBName} (${teamBWins})</span>
                </div>
                <div style="display: flex; height: 14px; border-radius: 8px; overflow: hidden; background: #e5e7eb;">
                    <div style="width: ${teamAPercent}%; background: #2563eb;"></div>
                    <div style="width: ${drawPercent}%; background: #9ca3af;"></div>
                    <div style="width: ${teamBPercent}%; background: #dc2626;"></div>
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
                                <td>${m.match}</td>
                                <td>${m.date || "–"}</td>
                                <td>${m.score || "–"}</td>
                                <td class="fw-semibold">${m.winner}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>`;
        })
        .catch(err => console.error("H2H data error:", err));
}).catch(err => console.error("Initialization Error:", err));

// MVP SECTION
fetch("mvp.json")
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

// TYPE CHANGE
typeSelect.addEventListener("change", () => {
    inningSelect.value = "";
    inningSelect.disabled = !typeSelect.value;
    chartSection.classList.add("hidden");
    if (chart) chart.destroy();
});

// INNING CHANGE
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
    const teamA = labels.map(p => -data[p].teamA);
    const teamB = labels.map(p => data[p].teamB);

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
    const timeline = defenceData[inning];
    if (!timeline) { hideLoader(); return alert("Defence data not found"); }

    if (chart) chart.destroy();
    chart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: timeline.map(d => d.batch),
            datasets: [{
                label: "Duration",
                data: timeline.map(d => d.duration),
                backgroundColor: "#22c55e"
            }]
        },
        options: { indexAxis: "y" }
    });
    hideLoader();
}

function loadRoster() {
    if (!rosterData) return;
    document.getElementById("teamAName").innerHTML = `<i class="bi bi-shield-fill-check text-primary me-2"></i> ${rosterData.teamA.name}`;
    document.getElementById("teamBName").innerHTML = `<i class="bi bi-shield-fill-check text-warning me-2"></i> ${rosterData.teamB.name}`;

    document.getElementById("teamAStats").innerHTML = "";
    document.getElementById("teamBStats").innerHTML = "";

    fillListWithStats("teamAAttackers", rosterData.teamA.attackers || [], "teamAStats");
    fillListWithStats("teamADefenders", rosterData.teamA.defenders || [], "teamAStats");
    fillListWithStats("teamAAll", rosterData.teamA.allRounders || [], "teamAStats");

    fillListWithStats("teamBAttackers", rosterData.teamB.attackers || [], "teamBStats");
    fillListWithStats("teamBDefenders", rosterData.teamB.defenders || [], "teamBStats");
    fillListWithStats("teamBAll", rosterData.teamB.allRounders || [], "teamBStats");
}

function fillListWithStats(listId, items, statsContainerId) {
    const ul = document.getElementById(listId);
    if (!ul) return;
    ul.innerHTML = "";
    items.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name;
        ul.appendChild(li);
    });

    const statsContainer = document.getElementById(statsContainerId);
    const totalPlayers = getTotalPlayers(statsContainerId);

    if (totalPlayers > 0 && items.length > 0) {
        const roleName = listId.includes("Attackers") ? "Attackers" : listId.includes("Defenders") ? "Defenders" : "All-Rounders";
        const count = items.length;
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
    const team = statsContainerId === "teamAStats" ? rosterData.teamA : rosterData.teamB;
    if (!team) return 0;
    return (team.attackers?.length || 0) + (team.defenders?.length || 0) + (team.allRounders?.length || 0);
}

// SECTION NAV
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