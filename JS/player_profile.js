document.addEventListener("DOMContentLoaded", () => {

    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get("playerId");

    if (playerId) {
        fetchPlayerData(playerId);
    } else {
        console.error("No Player ID found in URL");
    }

});

async function fetchPlayerData(id) {

    try {

        const response = await fetch("http://127.0.0.1:5000/player-profile");
        const data = await response.json();

        const player = data.players.find(p => p.id === id);

        if (player) {
            renderProfile(player);
        } else {
            console.error("Player not found:", id);
        }

    } catch (err) {
        console.error("Error loading player:", err);
    }

}

function renderProfile(p) {

    /* ---------- Identity Section ---------- */

    document.getElementById("playerName").innerText = p.name;
    document.getElementById("playerTeam").innerText = p.team;
    document.getElementById("playerRoleBadge").innerText = p.role;

    document.getElementById("heroTotalPoints").innerText =
        p.stats.total_pts || 0;

    document.getElementById("heroMatches").innerText =
        p.stats.matches || 0;


    /* ---------- Point Breakdown ---------- */

    document.getElementById("ptsAttacker").innerText =
        p.stats.attacker_pts || 0;

    document.getElementById("ptsDefender").innerText =
        p.stats.defender_pts || 0;

    document.getElementById("ptsTotal").innerText =
        p.stats.total_pts || 0;

    /* IMPORTANT: TEAM TOTAL */
    document.getElementById("ptsTeamTotal").innerText =
        p.stats.team_total || 0;


    /* ---------- Career Highlights ---------- */

    document.getElementById("highScore").innerText =
        p.stats.highest_attack_points || 0;

    document.getElementById("defTime").innerText =
        p.stats.highest_defence_time || "0m 0s";


    /* ---------- Role Based Sections ---------- */

    const attackerSection = document.getElementById("attackerSection");
    const defenderSection = document.getElementById("defenderSection");

    if (p.role === "Defender") {

        attackerSection.style.display = "none";
        defenderSection.style.display = "block";

        document.getElementById("defDetailTime").innerText =
            p.stats.total_defence_time || "0m 0s";

        document.getElementById("avgDefTime").innerText =
            p.stats.avg_defence_time || "0m 0s";

    } else {

        attackerSection.style.display = "block";
        defenderSection.style.display = "none";

        document.getElementById("poleDives").innerText =
            p.stats.pole_dive || 0;

        document.getElementById("skyDives").innerText =
            p.stats.sky_dive || 0;

        document.getElementById("assists").innerText =
            p.stats.assist || 0;

        document.getElementById("avgPoints").innerText =
            p.stats.avg_attacking_points || 0;

        /* IMPORTANT: TOTAL TOUCHES */
        document.getElementById("totalTouches").innerText =
            p.stats.total_touches || 0;

    }


    /* ---------- Performance Metrics ---------- */

    const matches = p.stats.matches || 0;

    document.getElementById("metricMatches").innerText = matches;
    document.getElementById("barMatches").style.width =
        Math.min(matches * 5, 100) + "%";


    const touches = p.stats.total_touches || 0;

    document.getElementById("metricTouches").innerText = touches;
    document.getElementById("barTouches").style.width =
        Math.min(touches * 2, 100) + "%";


    const avgPts = p.stats.avg_attacking_points || 0;

    document.getElementById("metricAvgPts").innerText = avgPts;
    document.getElementById("barAvgPts").style.width =
        Math.min(avgPts * 8, 100) + "%";

}
