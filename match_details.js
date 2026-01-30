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
});

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

// SECTION NAV
document.querySelectorAll("#sectionNav .nav-link").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll("#sectionNav .nav-link").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".section-content").forEach(s => s.classList.add("hidden"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.section).classList.remove("hidden");
    });
});
