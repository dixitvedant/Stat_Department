/* ---------------------------------------------------------
   1. GLOBAL VARIABLES & INITIALIZATION
--------------------------------------------------------- */
let allPlayers = [];
let filteredPlayers = [];
let displayedCount = 10;
const increment = 10;

// Run initialization when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    loadCommonComponents();
    loadPlayerData();
    setupEventListeners();
});

/* ---------------------------------------------------------
   2. COMPONENT LOADING (Navbar & Footer)
--------------------------------------------------------- */
function loadCommonComponents() {
    // Load Navbar
    fetch("cmn_navbar.html")
        .then(res => res.text())
        .then(data => {
            document.getElementById("navbar").innerHTML = data;
        })
        .catch(err => console.error("Error loading navbar:", err));

    // Load Footer
    fetch("cmn_footer.html")
        .then(res => res.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        })
        .catch(err => console.error("Error loading footer:", err));
}

/* ---------------------------------------------------------
   3. DATA FETCHING & FILTER POPULATION
--------------------------------------------------------- */
function loadPlayerData() {
    fetch("playerstep1.json")
        .then(res => res.json())
        .then(data => {
            allPlayers = data.players;
            populateTournaments();

            // Check if URL already has a tournament (e.g., coming back from profile)
            const urlParams = new URLSearchParams(window.location.search);
            const savedTournament = urlParams.get('tournament');

            if (savedTournament) {
                const selector = document.getElementById("tournamentFilter");
                selector.value = savedTournament;
                filterData(); // Auto-load the players
            } else {
                renderPlayers(); // Show the "Select Tournament" message
            }
        })
        .catch(err => console.error("Error loading players:", err));
}

function populateTournaments() {
    const selector = document.getElementById("tournamentFilter");

    // Get unique tournament names from the JSON backend
    const tournaments = [...new Set(allPlayers.map(p => p.tournament).filter(t => t))];

    tournaments.sort().forEach(tName => {
        const option = document.createElement("option");
        option.value = tName;
        option.textContent = tName;
        selector.appendChild(option);
    });
}

/* ---------------------------------------------------------
   4. EVENT LISTENERS
--------------------------------------------------------- */
function setupEventListeners() {
    // Tournament Dropdown Change
    document.getElementById("tournamentFilter").addEventListener("change", () => {
        displayedCount = 10;
        filterData();
    });

    // Search Input
    document.getElementById("playerSearch").addEventListener("input", () => {
        filterData();
    });

    // Role Tabs (All, Attacker, etc.)
    document.querySelectorAll("#roleFilters .nav-link").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll("#roleFilters .nav-link").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            filterData();
        });
    });

    // Load More Button
    document.getElementById("loadMoreBtn").addEventListener("click", () => {
        displayedCount += increment;
        renderPlayers();
    });
}

/* ---------------------------------------------------------
   5. FILTERING LOGIC
--------------------------------------------------------- */
function filterData() {
    const searchTerm = document.getElementById("playerSearch").value.toLowerCase();
    const activeTab = document.querySelector("#roleFilters .nav-link.active").dataset.filter;
    const tournamentVal = document.getElementById("tournamentFilter").value;

    // 1. Update the URL in the browser bar WITHOUT refreshing
    if (tournamentVal && tournamentVal !== "") {
        const newUrl = `${window.location.pathname}?tournament=${encodeURIComponent(tournamentVal)}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
    } else {
        // Clear URL if no tournament is selected
        window.history.pushState({}, '', window.location.pathname);
        filteredPlayers = [];
        renderPlayers();
        return;
    }

    // 2. Filter the player list
    filteredPlayers = allPlayers.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) ||
            p.team.toLowerCase().includes(searchTerm);

        const matchesTab = (activeTab === "All") || (p.role === activeTab);
        const matchesTournament = (p.tournament === tournamentVal);

        return matchesSearch && matchesTab && matchesTournament;
    });

    renderPlayers();
}

/* ---------------------------------------------------------
   6. RENDERING LOGIC (UI Generation)
--------------------------------------------------------- */
function renderPlayers() {
    const grid = document.getElementById("playerGrid");
    const loadMoreBtnContainer = document.getElementById("loadMoreContainer");
    const resultsCountDisplay = document.getElementById("resultsCount");
    const tournamentVal = document.getElementById("tournamentFilter").value;

    const toShow = filteredPlayers.slice(0, displayedCount);

    // Update Results Counter
    if (resultsCountDisplay) {
        resultsCountDisplay.innerHTML = `Showing <b>${toShow.length}</b> of <b>${filteredPlayers.length}</b> athletes`;
    }

    // SCENARIO 1: No Tournament Selected
    if (!tournamentVal) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-trophy mb-3 d-block opacity-25" style="font-size: 3.5rem; color: #64748b;"></i>
                <h4 class="text-muted fw-bold">Ready to explore?</h4>
                <p class="text-muted">Please select a tournament from the dropdown to view the athlete roster.</p>
            </div>`;
        loadMoreBtnContainer.classList.add("d-none");
        return;
    }

    // SCENARIO 2: Tournament Selected but no players match filters
    if (toShow.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No athletes found matching your current search/filters.</p>
            </div>`;
        loadMoreBtnContainer.classList.add("d-none");
        return;
    }

    // SCENARIO 3: Render Player Cards
    let htmlContent = "";
    toShow.forEach(p => {
        let roleClass = "role-default";
        if (p.role === "Attacker") roleClass = "role-attacker";
        else if (p.role === "Defender") roleClass = "role-defender";
        else if (p.role === "All-Rounder") roleClass = "role-allrounder";

        htmlContent += `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="player-card" onclick="goToProfile('${p.id}')" style="cursor: pointer;">
                    <div class="role-badge ${roleClass}">${p.role}</div>
                    <h3 class="player-name">${p.name}</h3>
                    <p class="team-name">${p.team}</p>
                    <div class="stat-container">
                        <div class="stat-item">
                            <span>Points</span>
                            <span>${p.stats.points}</span>
                        </div>
                        <div class="stat-item">
                            <span>Matches</span>
                            <span>${p.stats.matches}</span>
                        </div>
                    </div>
                </div>
            </div>`;
    });

    grid.innerHTML = htmlContent;

    // Toggle Load More Button visibility
    if (filteredPlayers.length > displayedCount) {
        loadMoreBtnContainer.classList.remove("d-none");
    } else {
        loadMoreBtnContainer.classList.add("d-none");
    }
}

/* ---------------------------------------------------------
   7. NAVIGATION
--------------------------------------------------------- */
function goToProfile(id) {
    const tournamentVal = document.getElementById("tournamentFilter").value;
    // Passes tournament name in URL so profile page back button works
    window.location.href = `player_profile.html?playerId=${encodeURIComponent(id)}&tournament=${encodeURIComponent(tournamentVal)}`;
}