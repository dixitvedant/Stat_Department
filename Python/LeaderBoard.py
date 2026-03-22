def LeaderBoard_match(dfs, filters=None):
    pms = dfs.get("player_match_stat")
    player = dfs.get("player")
    matches = dfs.get("match_details")
    tournament = dfs.get("tournament")

    if pms is None or player is None:
        return {}

    result = {}

    # Mappings
    player_name_map = {row.player_id: row.player_name for _, row in player.iterrows()}
    player_role_map = {row.player_id: row.role for _, row in player.iterrows()}

    match_name_map = {
        (row.tournament_id, row.match_id): row.match_name
        for _, row in matches.iterrows()
    }

    tournament_map = {
        row.tournament_id: row.tournament_name
        for _, row in tournament.iterrows()
    }

    # Prepare dataframe
    pms = pms.copy()
    pms["role"] = pms["player_id"].map(player_role_map)
    pms["attack_points"] = pms["attack_points"].fillna(0)
    pms["defense_points"] = pms["defense_points"].fillna(0)

    # FILTERS
    if filters:
        if filters.get("tournament"):
            tname = filters["tournament"].lower()

            valid_tournaments = [
                tid for tid, name in tournament_map.items()
                if name.lower() == tname
            ]

            pms = pms[pms["tournament_id"].isin(valid_tournaments)]

        if filters.get("match"):
            mname = filters["match"].lower()

            valid_matches = [
                mid for (tid, mid), name in match_name_map.items()
                if name.lower() == mname
                and (not filters.get("tournament") or tid in valid_tournaments)
            ]

            pms = pms[pms["match_id"].isin(valid_matches)]

    # GROUP BY MATCH
    for (tournament_id, match_id), match_df in pms.groupby(["tournament_id", "match_id"]):

        match_result = {
            "attackers": [],
            "defenders": [],
            "allrounders": []
        }

        # ATTACKERS (Top 3)
        attackers = match_df[match_df["role"] == "Attacker"] \
            .sort_values(by="attack_points", ascending=False) \
            .head(3)

        for _, row in attackers.iterrows():
            match_result["attackers"].append({
                "name": player_name_map.get(row["player_id"], "Unknown"),
                "points": int(row["attack_points"])
            })

       
        # DEFENDERS (Top 3)
        defenders = match_df[match_df["role"] == "Defender"] \
            .sort_values(by="defense_points", ascending=False) \
            .head(3)

        for _, row in defenders.iterrows():
            match_result["defenders"].append({
                "name": player_name_map.get(row["player_id"], "Unknown"),
                "points": int(row["defense_points"])
            })

       
        # ALL-ROUNDERS (Top 3)
        all_rounders = match_df[match_df["role"] == "All-Rounder"].copy()

        if not all_rounders.empty:
            all_rounders["total_score"] = (
                all_rounders["attack_points"] * 30 +
                all_rounders["defense_points"]
            )

            all_rounders = all_rounders \
                .sort_values(by="total_score", ascending=False) \
                .head(3)

            for _, row in all_rounders.iterrows():
                match_result["allrounders"].append({
                    "name": player_name_map.get(row["player_id"], "Unknown"),
                    "points": int(row["total_score"])
                })

        
        match_name = match_name_map.get((tournament_id, match_id), "Unknown")
        tournament_name = tournament_map.get(tournament_id, "Unknown")

        result[f"{tournament_name} - {match_name}"] = match_result

    return result
