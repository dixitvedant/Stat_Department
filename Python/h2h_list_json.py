import pandas as pd

def build_h2h_json(dfs):
    matches = dfs.get("match_details")
    teams = dfs.get("team")
    pms = dfs.get("player_match_stat")
    players = dfs.get("player")
    h2h_list = []
    team_name_map = {row.team_id: row.team_name for _, row in teams.iterrows()} if teams is not None else {}
    player_team_map = {row.player_id: row.team_id for _, row in players.iterrows()} if players is not None else {}

    if matches is None:
        return h2h_list

    for _, m in matches.iterrows():
        match_id = m.get("match_id")
        teamA_id = m.get("home_team")
        teamB_id = m.get("away_team")
        teamA_score = m.get("home_team_score") 
        teamB_score = m.get("away_team_score") 
        result=m.get("result")
        if (teamA_score == 0 and teamB_score == 0) and pms is not None:
            pm_match = pms[pms["match_id"] == match_id].copy()
            if "team_id" not in pm_match:
                pm_match["team_id"] = pm_match["player_id"].map(player_team_map)
            if "points" in pm_match:
                team_scores = pm_match.groupby("team_id")["points"].sum().to_dict()
                teamA_score = team_scores.get(teamA_id, 0)
                teamB_score = team_scores.get(teamB_id, 0)

        winner_id = None
        if teamA_score > teamB_score:
            winner_id = teamA_id
        elif teamB_score > teamA_score:
            winner_id = teamB_id
        #winner_id=m.get("winning_team")
        
        h2h_list.append({
            "match_id": int(match_id),
            "match_date": str(m.get("match_date")) if pd.notna(m.get("match_date")) else None,
            "home_team": {"team_id": int(teamA_id), "team_name": team_name_map.get(teamA_id, "Unknown"), "score": teamA_score},
            "away_team": {"team_id": int(teamB_id), "team_name": team_name_map.get(teamB_id, "Unknown"), "score": teamB_score},
            "Result":str(result) if pd.notna(m.get("result")) else None,
            "winner_team_id": int(winner_id) if winner_id else None,
            "winner_name": team_name_map.get(winner_id) if winner_id else None
        })
    return h2h_list
