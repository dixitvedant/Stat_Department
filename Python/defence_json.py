import pandas as pd

def build_defence_json(dfs):

    matches = dfs.get("match_details")
    teams = dfs.get("team")
    defence = dfs.get("team_defence")

    defence_list = []

    if matches is None or defence is None:
        return defence_list

    team_name_map = {
        row.team_id: row.team_name
        for _, row in teams.iterrows()
    } if teams is not None else {}

    for _, m in matches.iterrows():

        m_id = int(m.get("match_id"))
        match_dict = {}
        match_defence = defence[defence["match_id"] == m_id]

        for _, d in match_defence.iterrows():

            inning = int(d.get("inning_no"))
            team_id = int(d.get("team_id"))
            team_name = team_name_map.get(team_id, "Unknown")

            if inning not in match_dict:
                match_dict[inning] = {}

            if team_name not in match_dict[inning]:
                match_dict[inning][team_name] = []

            batch_data = {
                "batch": int(d.get("batch_no")),
                "start_time": int(d.get("start_minute")),
                "duration": int(d.get("duration"))
            }

            match_dict[inning][team_name].append(batch_data)

        defence_list.append({m_id: match_dict})

    return defence_list
"""
