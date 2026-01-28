let allMatches;
let selectedMatch;
let chart;

// Load all match data
fetch("match_wise.json")
    .then(res => res.json())
    .then(data => {
        allMatches = data.matches;
        loadMatchList();
    });

// Display match list
function loadMatchList() {
    const list = document.getElementById("matchList");

    allMatches.forEach(match => {
        const div = document.createElement("div");
        div.className = "match-card";
        div.textContent = match.name;

        div.onclick = () => selectMatch(match);
        list.appendChild(div);
    });
}

// On match click
function selectMatch(match) {
    selectedMatch = match;
    document.getElementById("controls").classList.remove("hidden");
    document.querySelector(".chart-container").classList.add("hidden");
}

// Dropdown logic
const typeSelect = document.getElementById("typeSelect");
const inningSelect = document.getElementById("inningSelect");

typeSelect.addEventListener("change", () => {
    inningSelect.disabled = false;
});

inningSelect.addEventListener("change", () => {
    drawChart(typeSelect.value, inningSelect.value);
});

// Draw Tornado Chart
function drawChart(type, inning) {

    const data = selectedMatch[type][inning];
    const labels = Object.keys(data);

    const teamA = labels.map(p => -data[p].teamA);
    const teamB = labels.map(p => data[p].teamB);

    if (chart) chart.destroy();

    document.querySelector(".chart-container").classList.remove("hidden");

    chart = new Chart(document.getElementById("tornadoChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [
                { label: "Team A", data: teamA, backgroundColor: "#38bdf8" },
                { label: "Team B", data: teamB, backgroundColor: "#f97316" }
            ]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    ticks: { callback: v => Math.abs(v) }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${selectedMatch.name} – ${type.toUpperCase()} (${inning.toUpperCase()})`
                }
            }
        }
    });
}
