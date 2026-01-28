let chart = null;
let matchData = null;
let defenceData = {};

// ================= GET MATCH ID =================
const params = new URLSearchParams(window.location.search);
const matchId = params.get("matchId");

// ================= DOM ELEMENTS =================
const typeSelect = document.getElementById("typeSelect");
const inningSelect = document.getElementById("inningSelect");
const chartSection = document.getElementById("chartSection");
const canvas = document.getElementById("tornadoChart");

// ================= INITIAL STATE =================
inningSelect.disabled = true;
chartSection.classList.add("hidden");

// ================= LOAD MATCH DATA =================
fetch("match_wise.json")
    .then(res => res.json())
    .then(data => {
        matchData = data.matches.find(m => m.id === matchId);

        if (!matchData) {
            alert("Match not found");
            return;
        }

        document.getElementById("matchTitle").textContent = matchData.name;
        document.getElementById("matchId").textContent = `Match ID: ${matchId}`;
    })
    .catch(err => console.error("Match data error:", err));

// ================= LOAD DEFENCE DATA =================
fetch("defence.json")
    .then(res => res.json())
    .then(data => {
        defenceData = data?.[matchId]?.defence || {};
    })
    .catch(err => console.error("Defence data error:", err));

// ================= TYPE CHANGE =================
typeSelect.addEventListener("change", () => {

    inningSelect.value = "";
    inningSelect.disabled = !typeSelect.value;

    chartSection.classList.add("hidden");

    if (chart) {
        chart.destroy();
        chart = null;
    }
});

// ================= INNING CHANGE =================
inningSelect.addEventListener("change", () => {

    if (!typeSelect.value || !inningSelect.value) return;

    chartSection.classList.remove("hidden");

    if (typeSelect.value === "attack") {
        drawAttackTornado(inningSelect.value);
    }

    if (typeSelect.value === "defence") {
        drawDefenceTimeline(inningSelect.value);
    }
});

// ================= ATTACK TORNADO =================
function drawAttackTornado(inning) {

    const phaseObj = matchData?.attack?.[inning];

    if (!phaseObj) {
        alert("Attack data not available for this inning");
        return;
    }

    const labels = Object.keys(phaseObj);
    const teamA = labels.map(p => -phaseObj[p].teamA);
    const teamB = labels.map(p => phaseObj[p].teamB);

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
            responsive: true,
            animation: {
                duration: 1200,
                easing: "easeOutQuart",
                delay: ctx => ctx.dataIndex * 120
            },
            scales: {
                x: {
                    ticks: { callback: v => Math.abs(v) },
                    title: { display: true, text: "Wickets" }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Attack Analysis – ${inning.toUpperCase()}`
                },
                tooltip: {
                    callbacks: {
                        label: ctx =>
                            `${ctx.dataset.label}: ${Math.abs(ctx.raw)} wickets`
                    }
                }
            }
        }
    });
}

// ================= DEFENCE TIMELINE =================
function drawDefenceTimeline(inning) {

    const timeline = defenceData?.[inning];

    if (!timeline || timeline.length === 0) {
        alert("Defence data not available for this inning");
        return;
    }

    const labels = timeline.map(d => d.batch);
    const dataset = timeline.map(d => ({
        x: d.duration,
        y: d.batch,
        base: d.start
    }));

    if (chart) chart.destroy();

    chart = new Chart(canvas, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Defence Duration",
                data: dataset,
                backgroundColor: "#22c55e",
                borderRadius: 6,
                barThickness: 20
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            animation: {
                duration: 1500,
                easing: "easeInOutCubic",
                delay: ctx => ctx.dataIndex * 180
            },
            scales: {
                x: {
                    title: { display: true, text: "Time (Minutes)" },
                    ticks: { stepSize: 1 }
                },
                y: {
                    title: { display: true, text: "Defence Batches" }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Defence Timeline – ${inning.toUpperCase()}`
                },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const start = ctx.raw.base;
                            const end = start + ctx.raw.x;
                            return `Locked from ${start} to ${end} min`;
                        }
                    }
                }
            }
        }
    });
}

// ================= SECTION NAVIGATION =================
const navButtons = document.querySelectorAll(".section-nav button");
const sections = document.querySelectorAll(".section-content");

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        navButtons.forEach(b => b.classList.remove("active"));
        sections.forEach(sec => sec.classList.add("hidden"));

        btn.classList.add("active");

        const targetId = btn.dataset.section;
        document.getElementById(targetId).classList.remove("hidden");

        // Cleanup chart when leaving wickets
        if (targetId !== "wickets" && chart) {
            chart.destroy();
            chart = null;
            chartSection.classList.add("hidden");
            typeSelect.value = "";
            inningSelect.value = "";
            inningSelect.disabled = true;
        }
    });
});
