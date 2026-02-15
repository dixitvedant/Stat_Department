/**
 * GLOBAL SEARCH ENGINE
 * Optimized to handle Matches, Players, and Teams
 */

let globalIndex = [];

async function initializeSearch() {
    try {
        // Run all fetches in parallel for speed
        const [matchesRes, playersRes, teamsRes] = await Promise.allSettled([
            fetch('matches_data.json').then(res => res.json()),
            fetch('playerstep1.json').then(res => res.json()),
            fetch('pointstable.json').then(res => res.json())
        ]);

        // 1. Index Matches
        if (matchesRes.status === 'fulfilled') {
            matchesRes.value.matches.forEach(m => {
                globalIndex.push({
                    name: m.name,
                    type: 'Match',
                    url: `match_details.html?matchId=${m.id}`,
                    subtext: `${m.date} | ${m.venue || 'Main Stadium'}`
                });
            });
        }

        // 2. Index Players
        if (playersRes.status === 'fulfilled') {
            playersRes.value.players.forEach(p => {
                globalIndex.push({
                    name: p.name,
                    type: 'Player',
                    url: `player_profile.html?playerId=${p.id}`,
                    subtext: `Role: ${p.role} | Team: ${p.team}`
                });
            });
        }

        // 3. Index Teams
        if (teamsRes.status === 'fulfilled') {
            teamsRes.value.teams.forEach(t => {
                globalIndex.push({
                    name: t.teamName,
                    type: 'Team',
                    url: `team_details.html?teamId=${t.id}`,
                    subtext: `Captain: ${t.captain}`
                });
            });
        }

        console.log("Global Search Index Ready:", globalIndex.length, "items loaded.");

    } catch (error) {
        console.error("Search initialization failed:", error);
    }
}

// Logic for displaying results
const mainSearch = document.getElementById('mainSearch');
const suggestionsBox = document.getElementById('searchSuggestions');

mainSearch.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
        suggestionsBox.classList.add('hidden');
        return;
    }

    // Advanced filtering: matches name OR type
    const results = globalIndex.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.type.toLowerCase().includes(query)
    );

    renderSearchUI(results);
});

function renderSearchUI(results) {
    if (results.length === 0) {
        suggestionsBox.innerHTML = `<div class="p-3 text-muted">No results found.</div>`;
    } else {
        suggestionsBox.innerHTML = results.map(item => `
            <div class="search-item" onclick="window.location.href='${item.url}'">
                <div>
                    <div class="fw-bold text-dark">${item.name}</div>
                    <small class="text-muted">${item.subtext}</small>
                </div>
                <span class="type-badge badge-role-${item.type.toLowerCase()}">${item.type}</span>
            </div>
        `).join('');
    }
    suggestionsBox.classList.remove('hidden');
}

// Start the engine
initializeSearch();

/**
 * DYNAMIC SCORE TICKER
 * Fetches match data and updates the top scrolling bar
 */

async function updateTicker() {
    const tickerContainer = document.getElementById('liveTickerContent');

    try {
        const response = await fetch('Hompage.json');
        const data = await response.json();
        const matches = data.matches;

        // Build the HTML string for the ticker
        let tickerHTML = "";

        matches.forEach(match => {
            let statusBadge = "";
            let textColor = "";

            // Style based on match status
            if (match.status === "LIVE") {
                statusBadge = `<span class="badge bg-danger">LIVE</span>`;
                textColor = "text-white";
            } else if (match.status === "FINAL") {
                statusBadge = `<span class="badge bg-secondary">FINAL</span>`;
                textColor = "text-muted";
            } else {
                statusBadge = `<span class="text-primary fw-bold">UPCOMING:</span>`;
                textColor = "text-white";
            }

            // Create the match segment
            tickerHTML += `
                <span class="ticker-item mx-4">
                    ${statusBadge} ${match.score} <small>(${match.info})</small>
                </span>
                <span class="mx-3 text-muted">|</span>
            `;
        });

        // Duplicate the string to ensure seamless looping
        tickerContainer.innerHTML = tickerHTML + tickerHTML;

    } catch (error) {
        console.error("Ticker Error:", error);
        tickerContainer.innerHTML = "Scores temporarily unavailable.";
    }
}

// Initialize Ticker
updateTicker();
// Optional: Refresh every 30 seconds for live updates
setInterval(updateTicker, 30000);



// /**
//  * DYNAMIC SCORE TICKER - BACKEND READY VERSION
//  */

// // Swap this URL when moving to your real API
// const API_BASE_URL = "Homepage.json"; 

// async function updateTicker() {
//     const tickerContainer = document.getElementById('liveTickerContent');
//     if (!tickerContainer) return; // Guard clause

//     try {
//         const response = await fetch(API_BASE_URL);
        
//         // Check if server actually responded correctly
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
//         const data = await response.json();
        
//         // Ensure data.matches exists and is an array (Standard Backend Practice)
//         const matches = data.matches || [];

//         if (matches.length === 0) {
//             tickerContainer.innerHTML = "No matches scheduled for today.";
//             return;
//         }

//         let tickerHTML = matches.map(match => {
//             let statusBadge = "";
            
//             // Using a Map or Object for status is cleaner than if/else
//             const statusConfig = {
//                 "LIVE": `<span class="badge bg-danger">LIVE</span>`,
//                 "FINAL": `<span class="badge bg-secondary">FINAL</span>`,
//                 "UPCOMING": `<span class="text-primary fw-bold">UPCOMING:</span>`
//             };

//             statusBadge = statusConfig[match.status] || "";

//             return `
//                 <span class="ticker-item mx-4">
//                     ${statusBadge} ${match.score} <small>(${match.info})</small>
//                 </span>
//                 <span class="mx-3 text-muted">|</span>
//             `;
//         }).join(''); // Join array into a single string

//         // Smooth Looping Injection
//         tickerContainer.innerHTML = tickerHTML + tickerHTML;

//     } catch (error) {
//         console.error("Critical Ticker Error:", error);
//         // Show a generic message to the user
//         tickerContainer.innerHTML = "Live scores are currently offline.";
//     }
// }

// // Initial Call
// updateTicker();

// // Polling: Real-time update every 30s
// const tickerInterval = setInterval(updateTicker, 30000);

/**
 * SPLASH SCREEN LOGIC
 * Shows a splash screen with video on page reload (F5)
 */
document.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById('splash-screen');
    const video = document.getElementById('welcomeVideo');

    // Detect Navigation Type
    const navEntries = performance.getEntriesByType("navigation");
    const navType = navEntries.length > 0 ? navEntries[0].type : "";
    
    // Detect if the user is coming from an external site (or no site at all)
    const isExternal = document.referrer === "" || !document.referrer.includes(window.location.hostname);
    
    // CONDITION: Show if it's a Reload OR if it's the very first time entering the site (External)
    if (navType === "reload" || isExternal) {
        
        document.body.style.overflow = 'hidden';
        window.scrollTo(0, 0);

        const removeSplash = () => {
            splash.classList.add('hidden');
            document.body.style.overflow = 'auto';
            // Optional: once hidden, remove from DOM to ensure no scroll interference
            setTimeout(() => { splash.style.display = 'none'; }, 600);
        };

        // Play video and set end trigger
        video.play().catch(error => {
            console.log("Autoplay blocked or video missing, skipping splash.");
            removeSplash();
        });

        video.onended = removeSplash;

        // Safety timeout (4 seconds)
        setTimeout(() => {
            if (!splash.classList.contains('hidden')) {
                removeSplash();
            }
        }, 2000);

    } else {
        // Internal navigation (clicking links within your site)
        splash.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});
/**
 * REFINED SMART PARSER
 * Fixes "Not Available" by being more flexible with raw text patterns
 */
document.getElementById('analyzeBtn')?.addEventListener('click', () => {
    const fileInput = document.getElementById('matchUpload');
    const resultArea = document.getElementById('uploadResult');
    const content = document.getElementById('quickStatsContent');

    if (!fileInput || fileInput.files.length === 0) {
        alert("Please select a file first.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const rawText = e.target.result;
        let processedData = { winner: 'Not Available', score: 'Not Available', bestAttacker: 'Not Available' };

        try {
            if (file.name.endsWith('.json')) {
                const json = JSON.parse(rawText);
                const m = json.match || (json.matches ? json.matches[0] : json);
                processedData = { 
                    winner: m.winner || 'Not Available', 
                    score: m.score || 'Not Available', 
                    bestAttacker: m.bestAttacker || 'Not Available' 
                };
            } else {
                // SMART EXTRACTION FOR RAW TXT/CSV
                const lines = rawText.split(/\r?\n/);
                
                lines.forEach(line => {
                    const cleanLine = line.replace(/[*_#]/g, '').trim(); // Remove markdown/junk chars
                    const lowerLine = cleanLine.toLowerCase();

                    // Look for Winner
                    if (lowerLine.includes('winner') || lowerLine.includes('won by')) {
                        processedData.winner = cleanLine.split(/[:=-]/)[1]?.trim() || processedData.winner;
                    }
                    // Look for Score
                    if (lowerLine.includes('score') || lowerLine.includes('result')) {
                        processedData.score = cleanLine.split(/[:=-]/)[1]?.trim() || processedData.score;
                    }
                    // Look for Player/Attacker
                    if (lowerLine.includes('attacker') || lowerLine.includes('player') || lowerLine.includes('performer')) {
                        processedData.bestAttacker = cleanLine.split(/[:=-]/)[1]?.trim() || processedData.bestAttacker;
                    }
                });
            }

            // Injected Updated UI
            if (resultArea && content) {
                resultArea.classList.remove('d-none');
                content.innerHTML = `
                    <div class="col-md-3 border-end">
                        <div class="small text-muted">Winner</div>
                        <div class="h5 fw-bold text-primary">${processedData.winner}</div>
                    </div>
                    <div class="col-md-3 border-end">
                        <div class="small text-muted">Match Score</div>
                        <div class="h5 fw-bold">${processedData.score}</div>
                    </div>
                    <div class="col-md-3 border-end">
                        <div class="small text-muted">Best Performer</div>
                        <div class="h5 fw-bold text-success">${processedData.bestAttacker}</div>
                    </div>
                    <div class="col-md-3">
                        <div class="badge bg-success-subtle text-success p-2">Analysis Complete</div>
                    </div>
                `;
            }
        } catch (err) {
            alert("Error reading file.");
            console.error(err);
        }
    };

    reader.readAsText(file);
});