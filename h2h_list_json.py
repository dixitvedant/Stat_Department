def build_h2h_json(dfs):
    matches = dfs.get("match_details")
    teams = dfs.get("team")
    result = []

    team_name_map = ({row.team_id: row.team_name for _, row in teams.iterrows()}if teams is not None else {})
    if matches is None:
        return result

    for _, m in matches.iterrows():
        match_id = m["match_id"]
        team_name_a = team_name_map.get(m["team_a"], "UNKNOWN")
        team_name_b = team_name_map.get(m["team_b"], "UNKNOWN")
        winning_team = team_name_map.get(m["winning_team"], "UNKNOWN")
        result.append({
            "match_id": int(match_id),
            "match_date":str(m["match_date"]),
            "Home Team":str(team_name_a),
            "Home_Team_Score":int(m["teama_score"]),
            "Away Team": str(team_name_b),
            "Away_Team_Score":int(m["teamb_score"]),
            "Winning Team": str(winning_team),
            "Result":str(m["result"])
        })

    return result
