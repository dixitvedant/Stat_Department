def LeaderBoard_match(dfs,filters=None):
    pms = dfs.get("player_match_stat")
    player = dfs.get("player")
    matches = dfs.get("match_details")
    tournament = dfs.get("tournament")

    if pms is None or player is None:
        return {}

    result = {}

    player_name_map = {row.player_id: row.player_name for _, row in player.iterrows()}
    player_role_map = {row.player_id: row.role for _, row in player.iterrows()}

    # include tournament_id
    match_name_map = {
        (row.tournament_id, row.match_id): row.match_name
        for _, row in matches.iterrows()
    }

    tournament_map = {
        row.tournament_id: row.tournament_name
        for _, row in tournament.iterrows()
    }

    pms = pms.copy()
    pms["role"] = pms["player_id"].map(player_role_map)
    pms["attack_points"] = pms["attack_points"].fillna(0)
    pms["defense_points"] = pms["defense_points"].fillna(0)
    
    # Apply filters
    if filters:
        if filters.get("tournament"):
            tname = filters["tournament"].lower()

            # find matching tournament_ids
            valid_tournaments = [
                tid for tid, name in tournament_map.items()
                if name.lower() == tname
            ]

            # filter dataframe
            pms = pms[pms["tournament_id"].isin(valid_tournaments)]
        
        if filters.get("match"):
            mname = filters["match"].lower()

            valid_matches = [
                mid for (tid, mid), name in match_name_map.items()
                if name.lower() == mname
                and (not filters.get("tournament") or tid in valid_tournaments)
            ]

            pms = pms[pms["match_id"].isin(valid_matches)]

    # GROUPING
    for (tournament_id, match_id), match_df in pms.groupby(["tournament_id", "match_id"]):

        details = []

        # Attacker
        attackers = match_df[match_df["role"] == "Attacker"]
        if not attackers.empty:
            row = attackers.loc[attackers["attack_points"].idxmax()]
            details.append({
                "name": player_name_map.get(row["player_id"], "Unknown"),
                "role": "Attacker",
                "points": int(row["attack_points"])
            })

        # Defender
        defenders = match_df[match_df["role"] == "Defender"]
        if not defenders.empty:
            row = defenders.loc[defenders["defense_points"].idxmax()]
            details.append({
                "name": player_name_map.get(row["player_id"], "Unknown"),
                "role": "Defender",
                "points": int(row["defense_points"])
            })

        # All-Rounder
        all_rounders = match_df[match_df["role"] == "All-Rounder"]
        if not all_rounders.empty:
            all_rounders = all_rounders.copy()
            all_rounders["total_score"] = (
                all_rounders["attack_points"] * 30 +
                all_rounders["defense_points"]
            )

            row = all_rounders.loc[all_rounders["total_score"].idxmax()]
            details.append({
                "name": player_name_map.get(row["player_id"], "Unknown"),
                "role": "All-Rounder",
                "points": int(row["total_score"])
            })

        match_name = match_name_map.get((tournament_id, match_id), "Unknown")
        tournament_name = tournament_map.get(tournament_id, "Unknown")

        result[f"{tournament_name} - {match_name}"] = details

    return result
