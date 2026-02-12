import pandas as pd

def build_roaster_json(dfs):
    matches = dfs.get("match_details")
    players = dfs.get("player")
    pms = dfs.get("player_match_stat")
    teams = dfs.get("team")
    roster_list = []

    team_name_map = {row.team_id: row.team_name for _, row in teams.iterrows()} if teams is not None else {}
    player_name_map = {row.player_id: row.player_name for _, row in players.iterrows()} if players is not None else {}
    player_role_map = {row.player_id: row.role for _, row in players.iterrows()} if players is not None else {}
    player_team_map={int(row.player_id): int(row.team_id) for _, row in players.iterrows()} if players is not None else {}
    if matches is None:
        return roster_list

    for _, m in matches.iterrows():
        match_id = m.get("match_id")
        match_date = m.get("match_date")
        team_cols = []
        if "home_team" in m and pd.notna(m["home_team"]):
            team_cols.append(m["home_team"])
        if "away_team" in m and pd.notna(m["away_team"]):
            team_cols.append(m["away_team"])
        teams_info = []
        for tid in team_cols:
            attackers, defenders, all_rounders = [], [], []
            if players is not None:
                pm_team = pms[pms["match_id"] == match_id]
                for _, prow in pm_team.iterrows():
                    pid = int(prow["player_id"])
                    pt_id=player_team_map.get(pid,-1)
                    if int(tid)==int(pt_id):
                                pname = player_name_map.get(pid, "Unknown")
                                role = player_role_map.get(pid,"Unknown")
                                player_obj = {"player_id": int(pid), "player_name": pname}
                                if role.lower() == "attacker":
                                    attackers.append(player_obj)
                                elif role.lower() == "defender":
                                    defenders.append(player_obj)
                                elif role.lower() == "all-rounder":
                                    all_rounders.append(player_obj)
            teams_info.append({
                "team_id": int(tid),
                "team_name": team_name_map.get(tid, "Unknown"),
                "attackers": attackers,
                "defenders": defenders,
                "all_rounders": all_rounders,
            })
        roster_list.append({
            "match_id": int(match_id),
            "match_date": str(match_date) if pd.notna(match_date) else None,
            "teams": teams_info
        })

    return roster_list
