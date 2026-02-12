document.addEventListener("DOMContentLoaded", () => {
    // We use 'id' to match the link from leaderboard.js: player_profile.html?id=...
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('id'); 

    if (playerId) {
        fetchPlayerData(playerId);
    } else {
        console.error("No Player ID found in URL.");
    }
});

async function fetchPlayerData(id) {
    try {
        const response = await fetch('player_profile.json');
        const allData = await response.json();
        
        // Find the specific player using the ID from the URL
        const player = allData.players.find(p => p.id === id);

        if (player) {
            renderProfile(player);
        } else {
            console.error("Player not found with ID:", id);
            // Optional: Redirect to home or show error message on UI
        }
    } catch (err) {
        console.error("Error loading player details:", err);
    }
}

function renderProfile(p) {
    // --- 1. Identity Section ---
    if (document.getElementById("playerName")) document.getElementById("playerName").innerText = p.name;
    if (document.getElementById("playerTeam")) document.getElementById("playerTeam").innerText = p.team;
    if (document.getElementById("playerRoleBadge")) document.getElementById("playerRoleBadge").innerText = p.role;
    if (document.getElementById("heroTotalPoints")) document.getElementById("heroTotalPoints").innerText = p.stats.total_pts;
    if (document.getElementById("heroMatches")) document.getElementById("heroMatches").innerText = p.stats.matches;
    if (p.image && document.getElementById("playerImg")) document.getElementById("playerImg").src = p.image;

    // --- 2. Point Breakdown ---
    if (document.getElementById("ptsAttacker")) document.getElementById("ptsAttacker").innerText = p.stats.attacker_pts || 0;
    if (document.getElementById("ptsDefender")) document.getElementById("ptsDefender").innerText = p.stats.defender_pts || 0;
    if (document.getElementById("ptsTotal")) document.getElementById("ptsTotal").innerText = p.stats.total_pts;
    if (document.getElementById("ptsTeamTotal")) document.getElementById("ptsTeamTotal").innerText = p.stats.team_total || 0;

    // --- 3. Career Highlights ---
    if (document.getElementById("highScore")) document.getElementById("highScore").innerText = p.stats.highest_score || 0;
    if (document.getElementById("defTime")) document.getElementById("defTime").innerText = p.stats.longest_def_time || "0s";

    // --- 4. Role-Based Section Management ---
    const attackerSection = document.getElementById("attackerSection");
    const defenderSection = document.getElementById("defenderSection");

    if (p.role === "Defender") {
        if (attackerSection) attackerSection.style.display = "none";
        if (defenderSection) {
            defenderSection.style.display = "block";
            // Populate Defender Detail if available
            const defDetail = document.getElementById("defTimeDetail");
            if (defDetail) defDetail.innerText = p.stats.avg_def_time || p.stats.longest_def_time;
        }
    } else {
        // Show Attacker stats (also for All-Rounders)
        if (attackerSection) {
            attackerSection.style.display = "block";
            if (document.getElementById("poleDives")) document.getElementById("poleDives").innerText = p.stats.pole_dives || 0;
            if (document.getElementById("skyDives")) document.getElementById("skyDives").innerText = p.stats.sky_dives || 0;
            if (document.getElementById("assists")) document.getElementById("assists").innerText = p.stats.assists || 0;
            if (document.getElementById("avgPoints")) document.getElementById("avgPoints").innerText = p.stats.avg_pts || 0;
            if (document.getElementById("successRate")) document.getElementById("successRate").innerText = (p.stats.success_rate || 0) + "%";
            if (document.getElementById("totalTouches")) document.getElementById("totalTouches").innerText = p.stats.total_touches || 0;
        }
        if (defenderSection) defenderSection.style.display = "none";
    }

    // --- 5. Performance Metrics (Progress Bars) ---
    // Matches Bar
    if (document.getElementById("metricMatches")) {
        document.getElementById("metricMatches").innerText = p.stats.matches;
        document.getElementById("barMatches").style.width = Math.min(p.stats.matches * 5, 100) + "%";
    }

    // Touches Bar
    const totalTouches = p.stats.total_touches || 0;
    if (document.getElementById("metricTouches")) {
        document.getElementById("metricTouches").innerText = totalTouches;
        document.getElementById("barTouches").style.width = Math.min(totalTouches / 2, 100) + "%";
    }

    // Avg Pts Bar
    const avgPts = p.stats.avg_pts || 0;
    if (document.getElementById("metricAvgPts")) {
        document.getElementById("metricAvgPts").innerText = avgPts;
        document.getElementById("barAvgPts").style.width = Math.min(avgPts * 8, 100) + "%";
    }

    // Success Rate Bar
    const successRate = p.stats.success_rate || 0;
    if (document.getElementById("metricSuccess")) {
        document.getElementById("metricSuccess").innerText = successRate + "%";
        document.getElementById("barSuccess").style.width = successRate + "%";
    }

    // --- 6. Team Impact ---
    if (document.getElementById("rateWithPlayer")) {
        const withRate = p.stats.win_rate_with || 0;
        document.getElementById("rateWithPlayer").innerText = withRate + "%";
        document.getElementById("rateWithBar").style.width = withRate + "%";
    }

    if (document.getElementById("rateWithoutPlayer")) {
        const withoutRate = p.stats.win_rate_without || 0;
        document.getElementById("rateWithoutPlayer").innerText = withoutRate + "%";
        document.getElementById("rateWithoutBar").style.width = withoutRate + "%";
    }
}   