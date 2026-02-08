def build_roaster_json(dfs):
    player=dfs.get("player")
    teams = dfs.get("team")
    result = []

    team_name_map = ({row.team_id: row.team_name for _, row in teams.iterrows()}if teams is not None else {})
    if player is None:
        return result

    for _, p in player.iterrows():
        team_name = team_name_map.get(p["team_id"], "UNKNOWN")
        result.append({
            "team name":team_name,
            "player_id":int(p["player_id"]),
            "player_name":str(p["player_name"]),
            "role":str(p["role"])
        })

    return result
