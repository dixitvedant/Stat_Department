let allPlayers = [];
let filteredPlayers = []; 
let displayedCount = 10; 
const increment = 10; 

/**
 * INITIAL DATA FETCH
 */
fetch("playerstep1.json")
    .then(res => res.json())
    .then(data => {
        allPlayers = data.players;
        filteredPlayers = [...allPlayers]; 
        
        const params = new URLSearchParams(window.location.search);
        const searchName = params.get('search');
        const teamFilter = params.get('team'); 
        
        const searchInput = document.getElementById("playerSearch");
        const backBtnContainer = document.getElementById("backBtnContainer");
        const teamCard = document.getElementById("teamProfileCard");

        if (teamFilter) {
            // 1. Show Back Button
            if (backBtnContainer) backBtnContainer.classList.remove("d-none");
            
            // 2. Setup and Show Team Profile Card
            if (teamCard) {
                document.getElementById("teamDisplayName").innerText = teamFilter;
                // Update Logo path - make sure your logos are in a folder named 'logos'
                document.getElementById("teamLogo").src = `logos/${teamFilter.toLowerCase().replace(/\s/g, '_')}.png`;
                teamCard.classList.remove("d-none");
            }

            // 3. Filter data
            if (searchInput) {
                searchInput.value = teamFilter;
                filterData(); 
            }
        } else if (searchName) {
            if (searchInput) {
                searchInput.value = searchName;
                filterData(); 
            }
        } else {
            renderPlayers(); 
        }
    })
    .catch(err => console.error("Error loading players database:", err));

document.getElementById("loadMoreBtn").addEventListener("click", () => {
    displayedCount += increment;
    renderPlayers();
});

document.getElementById("playerSearch").addEventListener("input", () => {
    displayedCount = 10; 
    filterData();
});

document.querySelectorAll("#roleFilters .nav-link").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll("#roleFilters .nav-link").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        displayedCount = 10; 
        filterData();
    });
});

function filterData() {
    const searchTerm = document.getElementById("playerSearch").value.toLowerCase();
    const activeTab = document.querySelector("#roleFilters .nav-link.active").dataset.filter;

    filteredPlayers = allPlayers.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                              p.id.toLowerCase().includes(searchTerm) ||
                              p.team.toLowerCase().includes(searchTerm);
        const matchesTab = (activeTab === "All") || (p.role === activeTab);
        return matchesSearch && matchesTab;
    });

    // Update athlete count in the Team Card if it's visible
    const teamCountBadge = document.getElementById("teamPlayerCount");
    if (teamCountBadge) teamCountBadge.innerText = `${filteredPlayers.length} Athletes`;

    renderPlayers();
}

function renderPlayers() {
    const grid = document.getElementById("playerGrid");
    const loadMoreBtn = document.getElementById("loadMoreContainer");
    const resultsCountDisplay = document.getElementById("resultsCount");
    
    const toShow = filteredPlayers.slice(0, displayedCount);
    const totalFound = filteredPlayers.length;
    const currentlyShowing = toShow.length;

    if (resultsCountDisplay) {
        resultsCountDisplay.innerHTML = `Showing <b>${currentlyShowing}</b> of <b>${totalFound}</b> athletes found`;
    }

    let htmlContent = "";

    if (toShow.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center py-5"><p class="text-muted">No athletes match criteria.</p></div>`;
        if (loadMoreBtn) loadMoreBtn.classList.add("d-none");
        return;
    }

    toShow.forEach(p => {
        let roleClass = "role-default";
        if (p.role === "Attacker") roleClass = "role-attacker";
        if (p.role === "Defender") roleClass = "role-defender";
        if (p.role === "All-Rounder") roleClass = "role-allrounder";

        htmlContent += `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="player-card" onclick="goToProfile('${p.id}')" style="cursor: pointer;">
                    <div class="mb-2"><span class="role-badge ${roleClass}">${p.role}</span></div>
                    <h3 class="player-name">${p.name}</h3>
                    <p class="team-name">${p.team}</p>
                    <div class="stat-container">
                        <div class="stat-item"><span>Points</span><span>${p.stats.points}</span></div>
                        <div class="stat-item"><span>Matches</span><span>${p.stats.matches}</span></div>
                    </div>
                </div>
            </div>`;
    });

    grid.innerHTML = htmlContent;

    if (loadMoreBtn) {
        displayedCount >= filteredPlayers.length ? loadMoreBtn.classList.add("d-none") : loadMoreBtn.classList.remove("d-none");
    }
}

function goToProfile(id) {
    window.location.href = `player_profile.html?playerId=${encodeURIComponent(id)}`;
}a