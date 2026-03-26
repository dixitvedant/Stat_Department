def LeaderBoard_match(dfs, filters=None):
    # Get required tables
    pms = dfs.get("player_match_stat")
    player = dfs.get("player")
    matches = dfs.get("match_details")
    tournament = dfs.get("tournament")

    # If no player_match_stat or player data, return empty result
    if pms is None or player is None:
        return {}

    result = {}

    # Mappings 
    player_name_map = (
        player.set_index("player_id")["player_name"].to_dict()
    )
    player_role_map = (
        player.set_index("player_id")["role"].to_dict()
    )

    match_name_map = (
        matches.set_index(["tournament_id", "match_id"])["match_name"].to_dict()
        if matches is not None else {}
    )

    tournament_map = (
        tournament.set_index("tournament_id")["tournament_name"].to_dict()
        if tournament is not None else {}
    )

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
        attackers = (
            match_df[match_df["role"] == "Attacker"]
            .sort_values(by="attack_points", ascending=False)
            .head(3)
        )

        for row in attackers.itertuples(index=False):  
            match_result["attackers"].append({
                "name": player_name_map.get(row.player_id, "Unknown"),
                "points": int(row.attack_points)
            })

        # DEFENDERS (Top 3)
        defenders = (
            match_df[match_df["role"] == "Defender"]
            .sort_values(by="defense_points", ascending=False)
            .head(3)
        )

        for row in defenders.itertuples(index=False):  
            match_result["defenders"].append({
                "name": player_name_map.get(row.player_id, "Unknown"),
                "points": int(row.defense_points)
            })

        # ALL-ROUNDERS (Top 3)
        all_rounders = match_df[match_df["role"] == "All-Rounder"].copy()

        if not all_rounders.empty:
            all_rounders["total_score"] = (
                all_rounders["attack_points"] * 30 +
                all_rounders["defense_points"]
            )

            all_rounders = (
                all_rounders
                .sort_values(by="total_score", ascending=False)
                .head(3)
            )

            for row in all_rounders.itertuples(index=False):  # optimized
                match_result["allrounders"].append({
                    "name": player_name_map.get(row.player_id, "Unknown"),
                    "points": int(row.total_score)
                })

        match_name = match_name_map.get((tournament_id, match_id), "Unknown")
        tournament_name = tournament_map.get(tournament_id, "Unknown")

        result[f"{tournament_name} - {match_name}"] = match_result

    return result
