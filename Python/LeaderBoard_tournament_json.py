def LeaderBoard_tournament(dfs, filters=None):
    # Get required tables
    pms = dfs.get("player_tournament_stat")
    player = dfs.get("player")
    tournament = dfs.get("tournament")

     # If no tournament or player or player_tournament_stat data, return empty result
    if pms is None or player is None or tournament is None:
        return {}

    result = {}

    # Apply tournament filter
    if filters and filters.get("tournament") is not None:
        matching_tournaments = tournament[
            tournament["tournament_name"] == filters["tournament"]
        ]["tournament_id"].tolist()

        pms = pms[pms["tournament_id"].isin(matching_tournaments)]

    # Create maps
    player_name_map = {row.player_id: row.player_name for _, row in player.iterrows()}
    player_role_map = {row.player_id: row.role for _, row in player.iterrows()}
    tournament_name_map = {row.tournament_id: row.tournament_name for _, row in tournament.iterrows()}

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
        attackers = t_df[t_df["role"] == "Attacker"] \
            .sort_values(by="total_attack_points", ascending=False) \
            .head(3)

        for _, row in attackers.iterrows():
            tournament_result["attackers"].append({
                "name": player_name_map.get(row["player_id"], "Unknown"),
                "points": int(row["total_attack_points"])
            })

        # Top 3 defenders
        defenders = t_df[t_df["role"] == "Defender"] \
            .sort_values(by="total_defence_points", ascending=False) \
            .head(3)

        for _, row in defenders.iterrows():
            tournament_result["defenders"].append({
                "name": player_name_map.get(row["player_id"], "Unknown"),
                "points": int(row["total_defence_points"])
            })

        # Top 3 all-rounders
        all_rounders = t_df[t_df["role"] == "All-Rounder"].copy()

        if not all_rounders.empty:
            all_rounders["total_score"] = (
                all_rounders["total_attack_points"] * 30 +
                all_rounders["total_defence_points"]
            )

            all_rounders = all_rounders \
                .sort_values(by="total_score", ascending=False) \
                .head(3)

            for _, row in all_rounders.iterrows():
                tournament_result["allrounders"].append({
                    "name": player_name_map.get(row["player_id"], "Unknown"),
                    "points": int(row["total_score"])
                })

        tournament_name = tournament_name_map.get(tournament_id, "Unknown")
        result[tournament_name] = tournament_result

    return result
