def sec_to_ms(sec):
    # Convert seconds to "Xm Ys" format
    if sec is None:
        return "0m 0s"
    m = int(sec) // 60
    s = int(sec) % 60
    return f"{m}m {s}s"


def build_players_json(dfs, filters=None):

    # Get required tables
    pss = dfs.get("player_tournament_stat")
    player = dfs.get("player")
    team = dfs.get("team")
    tournament = dfs.get("tournament")

    # Return empty if data missing
    if pss is None or player is None:
        return {"players": []}

    players_list = []

    # Create quick lookup maps
    player_name_map = player.set_index("player_id")["player_name"].to_dict()
    player_role_map = player.set_index("player_id")["role"].to_dict()
    player_team_map = player.set_index("player_id")["team_id"].to_dict()
    player_jersey_map = player.set_index("player_id")["jersey_no"].to_dict()

    team_name_map = team.set_index("team_id")["team_name"].to_dict() if team is not None else {}
    tournament_name_map = tournament.set_index("tournament_id")["tournament_name"].to_dict() if tournament is not None else {}

    # Create player_code for filtering and output
    temp_player = player.copy()

    temp_player["team_name"] = temp_player["team_id"].map(team_name_map)
    temp_player["team_code"] = temp_player["team_name"].str[:3].str.upper()
    temp_player["initials"] = temp_player["player_name"].apply(
        lambda x: "".join([i[0] for i in x.split()][:2]).upper()
    )
    temp_player["player_code"] = temp_player["team_code"] + "_" + temp_player["initials"]

    player_code_map = temp_player.set_index("player_id")["player_code"].to_dict()

    # Apply filters
    if filters:

        # Filter by tournament
        if filters.get("tournament") and filters["tournament"] != "all":
            valid_ids = [
                tid for tid, tname in tournament_name_map.items()
                if tname == filters["tournament"]
            ]
            pss = pss[pss["tournament_id"].isin(valid_ids)]

        # Filter by player_code (example: SAT_AY)
        if filters.get("player_code"):
            code_filter = filters["player_code"].upper()

            valid_player_ids = [
                pid for pid, code in player_code_map.items()
                if code == code_filter
            ]

            pss = pss[pss["player_id"].isin(valid_player_ids)]

    # Build final response
    for row in pss.itertuples(index=False):

        player_id = row.player_id

        name = player_name_map.get(player_id, "Unknown")
        role = player_role_map.get(player_id, "Unknown")
        jersey = player_jersey_map.get(player_id, None)

        team_id = player_team_map.get(player_id)
        team_name = team_name_map.get(team_id, "Unknown")

        tournament_name = tournament_name_map.get(row.tournament_id, "Unknown")

        matches = row.matches_played or 0
        total_attack = row.total_attack_points or 0
        total_defense = row.total_defence_points or 0

        avg_attack = round(total_attack / matches, 2) if matches else 0
        avg_def_time = round(total_defense / matches, 2) if matches else 0

        # Get generated player_code
        player_code = player_code_map.get(player_id, "UNK_XX")

        total_points = int(total_attack * 30) + int(total_defense)

        players_list.append({

            "id": player_code,
            "name": name,
            "team": team_name,
            "role": role,
            "jersey_no": jersey,
            "tournament": tournament_name,

            "stats": {
                "matches": int(matches),
                "pole_dive": int(row.pole_dives or 0),
                "sky_dive": int(row.sky_dives or 0),
                "total_pts": total_points,
                "attacker_pts": total_attack,
                "defender_pts": total_defense,
                "avg_attacking_points": avg_attack,
                "highest_attack_points": int(row.highest_attack_points or 0),
                "total_defence_time": sec_to_ms(int(total_defense)),
                "highest_defence_time": sec_to_ms(int(row.highest_def_time or 0)),
                "avg_defence_time": sec_to_ms(avg_def_time),
            }

        })

    return {"players": players_list}
