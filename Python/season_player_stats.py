def season_players_json(dfs):
    pms = dfs.get("player_season_stat")
    player = dfs.get("player")
    team = dfs.get("team")

    if pms is None or player is None:
        return []

    # Create lookup maps
    player_map = {
        row.player_id: {
            "name": row.player_name,
            "role": row.role,
            "jersey_no": row.jersey_no
        }
        for _, row in player.iterrows()
    }

    team_map = {
        row.team_id: row.team_name
        for _, row in team.iterrows()
    }

    result = []

    for season_id in pms["season_id"].unique():

        season_df = pms[pms["season_id"] == season_id]

        players_list = []

        for _, row in season_df.iterrows():

            player_id = int(row["player_id"])
            attack = int(row["total_attack_points"] or 0)
            defense = int(row["total_defense_points"] or 0)

            player_info = player_map.get(player_id, {})

            role = str(player_info.get("role", "Unknown"))
            name = str(player_info.get("name", "Unknown"))
            jersey_no = player_info.get("jersey_no")

            # Role-based points logic
            if role == "Attacker":
                points = attack
            elif role == "Defender":
                points = defense
            elif role == "All-Rounder":
                points = (attack * 30) + defense
            else:
                points = 0

            players_list.append({
                "id": int(player_id),
                "name": str(name),
                "jersey_no": int(jersey_no) if jersey_no is not None else None,
                "team": str(team_map.get(row.get("team_id"), "Unknown")),
                "role": str(role),
                "stats": {
                    "matches": int(row["matches_played"]),
                    "points": int(points)
                }
            })

        result.append({
            "season_id": int(season_id),
            "players": players_list
        })

    return result
