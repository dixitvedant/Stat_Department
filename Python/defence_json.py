
def build_defence_json(dfs,filters=None):

    matches = dfs.get("match_details")
    teams = dfs.get("team")
    seasons=dfs.get("season")
    defence = dfs.get("team_defence")

    defence_dict = {}

    if matches is None or defence is None:
        return defence_dict
    
    if filters:

        if filters.get("tournament_id") is not None:
            matches = matches[
                matches["season_id"].isin(
                    seasons.loc[
                        seasons["tournament_id"] == filters["tournament_id"],
                        "season_id"
                    ]
                )
            ]

        if filters.get("season_id") is not None:
            matches = matches[
                matches["season_id"] == filters["season_id"]
            ]

        if filters.get("match_id") is not None:
            matches = matches[
                matches["match_id"] == filters["match_id"]
            ]

        if filters.get("team_id") is not None:
            matches = matches[
                (matches["home_team"] == filters["team_id"]) |
                (matches["away_team"] == filters["team_id"])
            ]


    defence = defence[
        defence["match_id"].isin(matches["match_id"])]

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
                "start": float(d.get("start_time")),
                "end_time": float(d.get("end_time")),
                "duration": float(d.get("duration"))
            }

            inning_key = f"inning{inning}"

            if team_name not in match_structure["defence"][inning_key]:
                match_structure["defence"][inning_key][team_name] = []

            match_structure["defence"][inning_key][team_name].append(batch_data)
        match_code = f"M{m_id:02d}"
        defence_dict[match_code] = match_structure

    return defence_dict

