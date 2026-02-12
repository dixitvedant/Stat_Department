document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('playerId');

    if (playerId) {
        fetchPlayerData(playerId);
    }
});

async function fetchPlayerData(id) {
    try {
        // Ensure the filename matches your actual JSON file name
        const response = await fetch('player_profile.json');
        const allData = await response.json();
        const player = allData.players.find(p => p.id === id);

        if (player) {
            renderProfile(player);
        } else {
            console.error("Player not found ID:", id);
        }
    } catch (err) {
        console.error("Error loading player details:", err);
    }
}

function renderProfile(p) {
    // Identity Section
    document.getElementById("playerName").innerText = p.name;
    document.getElementById("playerTeam").innerText = p.team;
    document.getElementById("playerRoleBadge").innerText = p.role;
    document.getElementById("heroTotalPoints").innerText = p.stats.total_pts;
    document.getElementById("heroMatches").innerText = p.stats.matches;
    if (p.image) document.getElementById("playerImg").src = p.image;

    // Point Breakdown
    document.getElementById("ptsAttacker").innerText = p.stats.attacker_pts;
    document.getElementById("ptsDefender").innerText = p.stats.defender_pts;
    document.getElementById("ptsTotal").innerText = p.stats.total_pts;
    document.getElementById("ptsTeamTotal").innerText = p.stats.team_total;

    // Career Highlights
    document.getElementById("highScore").innerText = p.stats.highest_score;
    document.getElementById("defTime").innerText = p.stats.longest_def_time;

    // --- Role-Based Section Management ---
    const attackerSection = document.getElementById("attackerSection");
    const defenderSection = document.getElementById("defenderSection"); // Ensure this ID exists in your HTML

    if (p.role === "Defender") {
        // Show Defender stats, Hide Attacker stats
        if (attackerSection) attackerSection.style.display = "none";
        if (defenderSection) {
            defenderSection.style.display = "block";
            // Populate Defender specific fields if they exist in your HTML
            if (document.getElementById("defTimeDetail")) {
                document.getElementById("defTimeDetail").innerText = p.stats.longest_def_time;
            }
        }
    } else {
        // Show Attacker stats (also used for All-Rounders), Hide Defender specific block
        if (attackerSection) {
            attackerSection.style.display = "block";
            document.getElementById("poleDives").innerText = p.stats.pole_dives || 0;
            document.getElementById("skyDives").innerText = p.stats.sky_dives || 0;
            document.getElementById("assists").innerText = p.stats.assists || 0;
            document.getElementById("avgPoints").innerText = p.stats.avg_pts || 0;
            document.getElementById("successRate").innerText = (p.stats.success_rate || 0) + "%";
            document.getElementById("totalTouches").innerText = p.stats.total_touches || 0;
        }
        if (defenderSection) defenderSection.style.display = "none";
    }

    // Performance Metrics (Calculated Bars)
    document.getElementById("metricMatches").innerText = p.stats.matches;
    document.getElementById("barMatches").style.width = Math.min(p.stats.matches * 4, 100) + "%";

    const totalTouches = p.stats.total_touches || 0;
    document.getElementById("metricTouches").innerText = totalTouches;
    document.getElementById("barTouches").style.width = Math.min(totalTouches, 100) + "%";

    const avgPts = p.stats.avg_pts || 0;
    document.getElementById("metricAvgPts").innerText = avgPts;
    document.getElementById("barAvgPts").style.width = Math.min(avgPts * 10, 100) + "%";

    const successRate = p.stats.success_rate || 0;
    document.getElementById("metricSuccess").innerText = successRate + "%";
    document.getElementById("barSuccess").style.width = successRate + "%";

    // Team Impact
    document.getElementById("rateWithPlayer").innerText = p.stats.win_rate_with + "%";
    document.getElementById("rateWithBar").style.width = p.stats.win_rate_with + "%";

    document.getElementById("rateWithoutPlayer").innerText = p.stats.win_rate_without + "%";
    document.getElementById("rateWithoutBar").style.width = p.stats.win_rate_without + "%";
}