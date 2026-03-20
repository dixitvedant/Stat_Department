/**
 * LOCAL CONFIGURATION
 * Ensure player_profile.json is in the same folder as your HTML
 */
const LOCAL_JSON_PATH = 'player_profile.json'; 

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('id'); 

    if (playerId) {
        loadLocalPlayerData(playerId);
    } else {
        console.error("No Player ID found in URL.");
        document.getElementById("playerName").innerText = "No Player Selected";
    }
});

/**
 * CORE FETCH FUNCTION (LOCAL VERSION)
 * Fetches the entire JSON file and filters for the specific ID
 */
async function loadLocalPlayerData(id) {
    try {
        const response = await fetch(LOCAL_JSON_PATH);
        
        if (!response.ok) {
            throw new Error(`Could not load local file: ${response.status}`);
        }

        const data = await response.json();
        
        // Find the player matching the ID from the URL
        const player = data.players.find(p => p.id === id);

        if (player) {
            renderProfile(player);
        } else {
            console.error("Player not found in JSON file.");
            document.getElementById("playerName").innerText = "Player Not Found";
        }

    } catch (err) {
        console.error("Error reading local JSON:", err);
        document.getElementById("playerName").innerText = "File Load Error";
    }
}

/**
 * UI RENDERING
 * Updated to handle your nested "stats" object structure
 */
function renderProfile(p) {
    // 1. Identity
    document.getElementById("playerName").innerText = p.name || "N/A";
    document.getElementById("playerTeam").innerText = p.team || "N/A";
    document.getElementById("playerRoleBadge").innerText = p.role || "Player";
    document.getElementById("playerImg").src = p.image || "https://placehold.co/200x200";

    // 2. Points (Accessing nested stats object)
    const s = p.stats || {};
    document.getElementById("ptsAttacker").innerText = s.attacker_pts || 0;
    document.getElementById("ptsDefender").innerText = s.defender_pts || 0;
    document.getElementById("ptsTotal").innerText = s.total_pts || 0;

    // 3. Highlights
    document.getElementById("highScore").innerText = s.highest_score || 0;
    document.getElementById("defTime").innerText = s.longest_def_time || "0s";

    // 4. Attacker Stats
    document.getElementById("poleDives").innerText = s.pole_dives || 0;
    document.getElementById("sky_dives" ? "skyDives" : "skyDives").innerText = s.sky_dives || 0;
    document.getElementById("avgPoints").innerText = s.avg_pts || 0;

    // 5. Defender Stats
    document.getElementById("defDetailTime").innerText = s.longest_def_time || "0s";
    document.getElementById("avgDefTime").innerText = s.avg_def_time || "0s";

    // // 6. Summary Progress Bar
    const matches = s.matches || 0;
    document.getElementById("metricMatches").innerText = matches;
    // document.getElementById("barMatches").style.width = Math.min((matches / 20) * 100, 100) + "%";
}

