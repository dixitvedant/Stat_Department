def LeaderBoard_tournament(dfs, filters=None):
    # Get required tables
    pms = dfs.get("player_tournament_stat")
    player = dfs.get("player")
    tournament = dfs.get("tournament")

    # If no tournament or player or player_tournament_stat data, return empty result
    if pms is None or player is None or tournament is None:
        return {}

    result = {}

    # Create maps 
    player_name_map = (
        player.set_index("player_id")["player_name"].to_dict()
    )
    player_role_map = (
        player.set_index("player_id")["role"].to_dict()
    )
    tournament_name_map = (
        tournament.set_index("tournament_id")["tournament_name"].to_dict()
    )

    # Apply tournament filter 
    if filters and filters.get("tournament") is not None:
        tname = filters["tournament"].lower()

        matching_tournaments = [
            tid for tid, name in tournament_name_map.items()
            if name.lower() == tname
        ]

        pms = pms[pms["tournament_id"].isin(matching_tournaments)]

    # Prepare dataframe
    pms = pms.copy()
    pms["role"] = pms["player_id"].map(player_role_map)
    pms["total_attack_points"] = pms["total_attack_points"].fillna(0)
    pms["total_defence_points"] = pms["total_defence_points"].fillna(0)

    # Group by tournament
    for tournament_id, t_df in pms.groupby("tournament_id"):

        tournament_result = {
            "attackers": [],
            "defenders": [],
            "allrounders": []
        }

        # Top 3 attackers
        attackers = (
            t_df[t_df["role"] == "Attacker"]
            .sort_values(by="total_attack_points", ascending=False)
            .head(3)
        )

        for row in attackers.itertuples(index=False):  
            tournament_result["attackers"].append({
                "name": player_name_map.get(row.player_id, "Unknown"),
                "points": int(row.total_attack_points)
            })

        # Top 3 defenders
        defenders = (
            t_df[t_df["role"] == "Defender"]
            .sort_values(by="total_defence_points", ascending=False)
            .head(3)
        )

        for row in defenders.itertuples(index=False): 
            tournament_result["defenders"].append({
                "name": player_name_map.get(row.player_id, "Unknown"),
                "points": int(row.total_defence_points)
            })

        # Top 3 all-rounders
        all_rounders = t_df[t_df["role"] == "All-Rounder"].copy()

        if not all_rounders.empty:
            all_rounders["total_score"] = (
                all_rounders["total_attack_points"] * 30 +
                all_rounders["total_defence_points"]
            )

            all_rounders = (
                all_rounders
                .sort_values(by="total_score", ascending=False)
                .head(3)
            )

            for row in all_rounders.itertuples(index=False):  
                tournament_result["allrounders"].append({
                    "name": player_name_map.get(row.player_id, "Unknown"),
                    "points": int(row.total_score)
                })

        tournament_name = tournament_name_map.get(tournament_id, "Unknown")
        result[tournament_name] = tournament_result

    return result
