fetch("match_wise.json")
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("matchList");

        data.matches.forEach(match => {
            const card = document.createElement("a");
            card.href = `match_details.html?matchId=${match.id}`;
            card.className = "match-card";

            card.innerHTML = `
                <h3>${match.name}</h3>
                <p><i class="bi bi-calendar-event"></i> ${match.date}</p>
                <p><i class="bi bi-bar-chart"></i> ${match.score}</p>
                <p class="fw-semibold text-success">
                    <i class="bi bi-trophy-fill"></i> Winner: ${match.winner}
                </p>
            `;

            container.appendChild(card);
        });
    })
    .catch(err => console.error("JSON load error:", err));
