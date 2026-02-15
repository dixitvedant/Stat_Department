import pandas as pd

def build_roaster_json(dfs,filters=None):
    matches = dfs.get("match_details")
    players = dfs.get("player")
    pms = dfs.get("player_match_stat")
    teams = dfs.get("team")

    roster_dict = {}

    if matches is None :
        return roster_dict
    
    if filters:
        if filters.get("match_id") is not None:
            matches = matches[matches["match_id"] == filters["match_id"]]
            pms = pms[pms["match_id"] == filters["match_id"]]

        if filters.get("team_id") is not None:
            players = players[players["team_id"] == filters["team_id"]]

        if filters.get("role") is not None:
            players = players[
                players["role"].str.lower() == filters["role"].lower()
            ]


    team_name_map = {row.team_id: row.team_name for _, row in teams.iterrows()} if teams is not None else {}
    player_name_map = {row.player_id: row.player_name for _, row in players.iterrows()}
    player_role_map = {row.player_id: row.role for _, row in players.iterrows()}
    player_team_map = {int(row.player_id): int(row.team_id) for _, row in players.iterrows()}

    for _, m in matches.iterrows():

        match_id = int(m["match_id"])
        match_date = m["match_date"]

        home_team = m.get("home_team")
        away_team = m.get("away_team")

        match_players = pms[pms["match_id"] == match_id]

        def get_team_data(team_id):
            attackers, defenders, all_rounders = [], [], []

            for _, prow in match_players.iterrows():
                pid = int(prow["player_id"])

                if player_team_map.get(pid) == int(team_id):
                    pname = player_name_map.get(pid, "Unknown")
                    role = player_role_map.get(pid, "").lower()

                    if role == "attacker":
                        attackers.append(pname)
                    elif role == "defender":
                        defenders.append(pname)
                    elif role == "all-rounder":
                        all_rounders.append(pname)

            return {
                "name": team_name_map.get(team_id, "Unknown"),
                "attackers": attackers,
                "defenders": defenders,
                "allRounders": all_rounders
            }

        roster_dict[str(match_id)] = {
            "match_date": str(match_date) if pd.notna(match_date) else None,
            "teamA": get_team_data(home_team),
            "teamB": get_team_data(away_team)
        }

    return roster_dict
