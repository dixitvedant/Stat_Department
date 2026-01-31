// URL PARAM
const params = new URLSearchParams(window.location.search);
const matchId = params.get("matchId");

// DOM
const typeSelect = document.getElementById("typeSelect");
const inningSelect = document.getElementById("inningSelect");
const chartSection = document.getElementById("chartSection");
const canvas = document.getElementById("tornadoChart");

// INITIAL
inningSelect.disabled = true;

let chart = null;
let matchData = null;
let defenceData = {};
let rosterData = {};

// LOADER FUNCTIONS
function showLoader() {
    document.getElementById("chartLoader").classList.remove("d-none");
    canvas.classList.add("d-none");
}

function hideLoader() {
    document.getElementById("chartLoader").classList.add("d-none");
    canvas.classList.remove("d-none");
}

// FETCH ALL DATA
Promise.all([
    fetch("matches_data.json").then(r => r.json()),
    fetch("attack.json").then(r => r.json()),
    fetch("defence.json").then(r => r.json()),
    fetch("players.json").then(r => r.json()),
    fetch("roster.json").then(r => r.json())
]).then(([matches, attack, defence, players, roster]) => {
    const matchInfo = matches.matches.find(x => x.id === matchId);
    if (!matchInfo) return alert("Match not found");

    matchData = { ...matchInfo, attack: attack[matchId] };
    defenceData = defence[matchId]?.defence || {};
    rosterData = roster[matchId];

    // UPDATE HEADER
    document.getElementById("matchTitle").textContent = matchInfo.name;
    document.getElementById("matchId").textContent = `Match ID: ${matchId}`;

    // UPDATE OVERVIEW
    document.getElementById("ovWinner").textContent = matchInfo.winner || "–";
    document.getElementById("ovWickets").textContent = matchInfo.totalWickets || "–";
    document.getElementById("ovAttacker").textContent = matchInfo.bestAttacker || "–";
    document.getElementById("ovDefender").textContent = matchInfo.bestDefender || "–";

    // LOAD ROSTER SECTION
    loadRoster();

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

            const teamAName = rosterData.teamA.name;
            const teamBName = rosterData.teamB.name;

            const teamAWins = h2hMatches.filter(m => m.winner === teamAName).length;
            const teamBWins = h2hMatches.filter(m => m.winner === teamBName).length;
            const draws = h2hMatches.filter(m => m.winner === "Draw").length;
            const total = h2hMatches.length;

            const teamAPercent = (teamAWins / total) * 100;
            const drawPercent = (draws / total) * 100;
            const teamBPercent = (teamBWins / total) * 100;

            // Title
            const title = document.createElement("h6");
            title.className = "mt-3 mb-2 text-center";
            title.textContent = `Last ${total} Matches`;
            h2hContent.appendChild(title);

            // Labels
            const labelRow = document.createElement("div");
            labelRow.className = "d-flex justify-content-between mb-1 fw-semibold";
            labelRow.innerHTML = `
            <span>${teamAName} (${teamAWins})</span>
            <span>Draws (${draws})</span>
            <span>${teamBName} (${teamBWins})</span>
        `;
            h2hContent.appendChild(labelRow);

            // Bar
            const bar = document.createElement("div");
            bar.style.display = "flex";
            bar.style.height = "14px";
            bar.style.borderRadius = "8px";
            bar.style.overflow = "hidden";
            bar.style.background = "#e5e7eb";

            const barA = document.createElement("div");
            barA.style.width = `${teamAPercent}%`;
            barA.style.background = "#2563eb";

            const barDraw = document.createElement("div");
            barDraw.style.width = `${drawPercent}%`;
            barDraw.style.background = "#9ca3af";

            const barB = document.createElement("div");
            barB.style.width = `${teamBPercent}%`;
            barB.style.background = "#dc2626";

            bar.appendChild(barA);
            bar.appendChild(barDraw);
            bar.appendChild(barB);
            h2hContent.appendChild(bar);

            // TABLE (UPDATED)
            const table = document.createElement("table");
            table.className = "table table-striped mt-4";

            table.innerHTML = `
            <thead>
                <tr>
                    <th>Match</th>
                    <th>Date</th>
                    <th>Score</th>
                    <th>Winner</th>
                    <th>Total Wickets</th>
                </tr>
            </thead>
            <tbody>
                ${h2hMatches.map(m => `
                    <tr>
                        <td>${m.match}</td>
                        <td>${m.date || "–"}</td>
                        <td>${m.score || "–"}</td>
                        <td class="fw-semibold">${m.winner}</td>
                        <td>${m.totalWickets}</td>
                    </tr>
                `).join("")}
            </tbody>
        `;

            h2hContent.appendChild(table);
        })
        .catch(err => console.error("H2H data error:", err));


});
// MVP SECTION
fetch("mvp.json")
    .then(r => r.json())
    .then(mvpData => {

        const list = mvpData[matchId];
        if (!list || list.length === 0) return;

        // Sort by points DESC
        list.sort((a, b) => b.points - a.points);

        // TOP MVP
        const top = list[0];
        document.getElementById("topMvpName").textContent = top.name;
        document.getElementById("topMvpRole").textContent = top.role;
        document.getElementById("topMvpPoints").textContent = `${top.points} pts`;

        renderMvpList(list);

        document.getElementById("mvpRoleFilter")
            .addEventListener("change", e => {
                const role = e.target.value;

                let filtered = list;
                if (role !== "All") {
                    filtered = list
                        .filter(p => p.role === role)
                        .slice(0, 3); // TOP 3 ONLY
                } else {
                    filtered = [
                        ...list.filter(p => p.role === "Attacker").slice(0, 3),
                        ...list.filter(p => p.role === "Defender").slice(0, 3),
                        ...list.filter(p => p.role === "All-Rounder").slice(0, 3)
                    ];
                }

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
            </div>
        `;
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

// DRAW ATTACK
function drawAttack(inning) {
    const data = matchData.attack?.[inning];
    if (!data) return alert("Attack data not found");

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

// DRAW DEFENCE
function drawDefence(inning) {
    const timeline = defenceData[inning];
    if (!timeline) return alert("Defence data not found");

    if (chart) chart.destroy();

    chart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: timeline.map(d => d.batch),
            datasets: [{
                data: timeline.map(d => d.duration),
                backgroundColor: "#22c55e"
            }]
        },
        options: { indexAxis: "y" }
    });

    hideLoader();
}

// LOAD ROSTER WITH COUNT & PERCENTAGE
function loadRoster() {
    if (!rosterData) return;

    // TEAM NAMES
    document.getElementById("teamAName").textContent = rosterData.teamA.name;
    document.getElementById("teamBName").textContent = rosterData.teamB.name;

    // Clear previous stats
    document.getElementById("teamAStats").innerHTML = "";
    document.getElementById("teamBStats").innerHTML = "";

    // FILL TEAM A
    fillListWithStats("teamAAttackers", rosterData.teamA.attackers, "teamAStats");
    fillListWithStats("teamADefenders", rosterData.teamA.defenders, "teamAStats");
    fillListWithStats("teamAAll", rosterData.teamA.allRounders, "teamAStats");

    // FILL TEAM B
    fillListWithStats("teamBAttackers", rosterData.teamB.attackers, "teamBStats");
    fillListWithStats("teamBDefenders", rosterData.teamB.defenders, "teamBStats");
    fillListWithStats("teamBAll", rosterData.teamB.allRounders, "teamBStats");
}

// FILL LIST & SHOW COUNT + PERCENTAGE
function fillListWithStats(listId, items, statsContainerId) {
    const ul = document.getElementById(listId);
    ul.innerHTML = "";

    items.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name;
        ul.appendChild(li);
    });

    const statsContainer = document.getElementById(statsContainerId);
    const totalPlayers = getTotalPlayers(statsContainerId);

    if (totalPlayers > 0) {
        const roleName = listId.includes("Attackers") ? "Attackers" :
            listId.includes("Defenders") ? "Defenders" : "All-Rounders";

        const count = items.length;
        const percent = ((count / totalPlayers) * 100).toFixed(1);

        const statCard = document.createElement("div");
        statCard.className = "stat-card mb-2 p-2";

        const label = document.createElement("div");
        label.className = "stat-label";
        label.textContent = `${roleName}: ${count} (${percent}%)`;

        const progressWrapper = document.createElement("div");
        progressWrapper.className = "progress";

        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        progressBar.style.width = `${percent}%`;
        progressBar.classList.add(roleName === "Attackers" ? "bg-danger" : roleName === "Defenders" ? "bg-success" : "bg-warning");

        progressWrapper.appendChild(progressBar);
        statCard.appendChild(label);
        statCard.appendChild(progressWrapper);
        statsContainer.appendChild(statCard);
    }
}

function getTotalPlayers(statsContainerId) {
    if (statsContainerId === "teamAStats") {
        const team = rosterData.teamA;
        return team.attackers.length + team.defenders.length + team.allRounders.length;
    } else if (statsContainerId === "teamBStats") {
        const team = rosterData.teamB;
        return team.attackers.length + team.defenders.length + team.allRounders.length;
    }
    return 0;
}
function loadMvp(players) {
    const top = players.reduce((a, b) => b.points > a.points ? b : a);

    document.getElementById("topMvpName").textContent = top.name;
    document.getElementById("topMvpRole").textContent = top.role;
    document.getElementById("topMvpPoints").textContent = `${top.points} pts`;

    renderMvpList(players);
}

function renderMvpList(players) {
    const container = document.getElementById("mvpList");
    container.innerHTML = "";

    players.forEach((p, i) => {
        const row = document.createElement("div");
        row.className = "mvp-row";
        row.style.animationDelay = `${i * 0.1}s`;

        row.innerHTML = `
            <div>
                <div class="mvp-name">${p.name}</div>
                <div class="mvp-role">${p.role}</div>
            </div>
            <span class="badge bg-primary">${p.points}</span>
        `;

        container.appendChild(row);
    });
}


// -------------------- SECTION NAV --------------------
// SHOW ROSTER FIRST BY DEFAULT
document.querySelectorAll(".section-content").forEach(s => s.classList.add("hidden"));
document.getElementById("roster").classList.remove("hidden");

document.querySelectorAll("#sectionNav .nav-link").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll("#sectionNav .nav-link").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".section-content").forEach(s => s.classList.add("hidden"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.section).classList.remove("hidden");
    });
});
