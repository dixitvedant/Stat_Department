def LeaderBoard_match(dfs):
    pms = dfs.get("player_match_stat")
    player = dfs.get("player")

    if pms is None or player is None:
        return {}

    result = {}

    # Create maps
    player_name_map = {row.player_id: row.player_name for _, row in player.iterrows()}
    player_role_map = {row.player_id: row.role for _, row in player.iterrows()}

    # Prepare dataframe
    pms = pms.copy()
    pms["role"] = pms["player_id"].map(player_role_map)
    pms["attack_points"] = pms["attack_points"].fillna(0)
    pms["defense_points"] = pms["defense_points"].fillna(0)

    # Group by match
    for match_id, match_df in pms.groupby("match_id"):
        details = []

        # -----------------------------
        # Best Attacker (Only Attack Role)
        # -----------------------------
        attackers = match_df[match_df["role"] == "Attacker"]
        if not attackers.empty:
            idx = attackers["attack_points"].idxmax()
            row = attackers.loc[idx]

            details.append({
                "name": player_name_map.get(row["player_id"], "Unknown"),
                "role": "Attacker",
                "points": int(row["attack_points"])
            })

        # -----------------------------
        # Best Defender (Only Defender Role)
        # -----------------------------
        defenders = match_df[match_df["role"] == "Defender"]
        if not defenders.empty:
            idx = defenders["defense_points"].idxmax()
            row = defenders.loc[idx]

            details.append({
                "name": player_name_map.get(row["player_id"], "Unknown"),
                "role": "Defender",
                "points": int(row["defense_points"])
            })

        # -----------------------------
        # Best All-Rounder (Only All-Rounder Role)
        # -----------------------------
        all_rounders = match_df[match_df["role"] == "All-Rounder"]
        if not all_rounders.empty:
            all_rounders = all_rounders.copy()
            all_rounders["total_score"] = (
                all_rounders["attack_points"] * 30
                + all_rounders["defense_points"]
            )

            idx = all_rounders["total_score"].idxmax()
            row = all_rounders.loc[idx]

            details.append({
                "name": player_name_map.get(row["player_id"], "Unknown"),
                "role": "All-Rounder",
                "points": int(row["total_score"])
            })

        match_code = f"M{match_id:02d}"
        result[match_code] = details

    return result