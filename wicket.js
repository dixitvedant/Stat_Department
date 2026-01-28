let chart;
let matchData;

// Load JSON data ONCE
fetch("wicket.json")
    .then(res => res.json())
    .then(data => {
        matchData = data;
    });

// Dropdowns
const typeSelect = document.getElementById("typeSelect");
const inningSelect = document.getElementById("inningSelect");

// Enable inning dropdown after selecting type
typeSelect.addEventListener("change", () => {
    inningSelect.disabled = false;
});

// When inning is selected → draw tornado chart
inningSelect.addEventListener("change", () => {
    const type = typeSelect.value;
    const inning = inningSelect.value;

    if (type && inning) {
        drawTornadoChart(type, inning);
    }
});

/* ================= TORNADO CHART FUNCTION ================= */

function drawTornadoChart(type, inning) {

    const phaseData = matchData[type][inning];

    const labels = phaseData.map(p => p.phase);
    const teamA = phaseData.map(p => -p.teamA); // left side
    const teamB = phaseData.map(p => p.teamB);  // right side

    // Destroy old chart
    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("tornadoChart"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Team A",
                    data: teamA,
                    backgroundColor: "#38bdf8"
                },
                {
                    label: "Team B",
                    data: teamB,
                    backgroundColor: "#f97316"
                }
            ]
        },
        options: {
            indexAxis: "y",
            scales: {
                x: {
                    ticks: {
                        callback: value => Math.abs(value)
                    },
                    title: {
                        display: true,
                        text: "Wickets"
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Tornado Chart – ${type.toUpperCase()} (${inning.toUpperCase()})`
                }
            }
        }
    });
}
