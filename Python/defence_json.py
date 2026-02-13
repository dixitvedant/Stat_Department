import pandas as pd

def build_defence_json(dfs):

    matches = dfs.get("match_details")
    teams = dfs.get("team")
    defence = dfs.get("team_defence")

    defence_dict = {}

    if matches is None or defence is None:
        return defence_dict

    team_name_map = {
        row.team_id: row.team_name
        for _, row in teams.iterrows()
    } if teams is not None else {}

    for _, m in matches.iterrows():

        m_id = int(m.get("match_id"))
        match_defence = defence[defence["match_id"] == m_id]

        match_structure = {
            "defence": {
                "inning1": {},
                "inning2": {}
            }
        }

        for _, d in match_defence.iterrows():

            inning = int(d.get("inning_no"))
            team_id = int(d.get("team_id"))
            team_name = team_name_map.get(team_id, "Unknown")

            batch_data = {
                "batch": f"Batch {int(d.get('batch_no'))}",
                "start": int(d.get("start_minute")),
                "duration": int(d.get("duration"))
            }

            inning_key = f"inning{inning}"

            if team_name not in match_structure["defence"][inning_key]:
                match_structure["defence"][inning_key][team_name] = []

            match_structure["defence"][inning_key][team_name].append(batch_data)

        defence_dict[str(m_id)] = match_structure

    return defence_dict


