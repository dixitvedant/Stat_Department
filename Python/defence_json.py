def build_defence_json(dfs, filters=None):
    # Get required tables
    matches = dfs.get("match_details")
    teams = dfs.get("team")
    tournaments = dfs.get("tournament")
    defence = dfs.get("team_defence")

    defence_dict = {}

    if matches is None or defence is None:
        return defence_dict

    # Mappings 
    team_name_map = (
        teams.set_index("team_id")["team_name"].to_dict()
        if teams is not None else {}
    )

    tournament_name_map = (
        tournaments.set_index("tournament_id")["tournament_name"].to_dict()
        if tournaments is not None else {}
    )

    # Filters
    if filters:

        # Tournament filter 
        if filters.get("tournament") and filters["tournament"] != "all":
            matches = matches[
                matches["tournament_id"].isin([
                    tid for tid, tname in tournament_name_map.items()
                    if tname.lower() == filters["tournament"].lower()
                ])
            ]

        # Match filter 
        if filters.get("match"):
            matches = matches[
                matches["match_name"].str.lower() == filters["match"].lower()
            ]

    # Filter defence only once
    defence = defence[
        defence["match_id"].isin(matches["match_id"])
    ]

    # Group defence by match_id to avoid repeated filtering
    defence_grouped = defence.groupby("match_id")

    # Loop through matches 
    for m in matches.itertuples(index=False):

        m_id = int(m.match_id)
        t_id = m.tournament_id
        match_name = getattr(m, "match_name", None)

        tournament_name = tournament_name_map.get(
            t_id, f"Tournament_{t_id}"
        )

        # tournament level bifurcation
        if tournament_name not in defence_dict:
            defence_dict[tournament_name] = {}

        # Get match defence data 
        match_defence = (
            defence_grouped.get_group(m_id)
            if m_id in defence_grouped.groups else None
        )

        # dynamic innings
        match_structure = {
            "defence": {}
        }

        if match_defence is not None:

            # Loop defence rows 
            for d in match_defence.itertuples(index=False):

                inning = int(d.inning_no)
                inning_key = f"inning{inning}"

                # Create inning dynamically
                if inning_key not in match_structure["defence"]:
                    match_structure["defence"][inning_key] = {}

                team_id = int(d.team_id)
                team_name = team_name_map.get(team_id, "Unknown")

                batch_data = {
                    "batch": f"Batch {int(d.batch_no)}",
                    "start": float(d.start_time),
                    "end_time": float(d.end_time),
                    "duration": float(d.duration)
                }

                if team_name not in match_structure["defence"][inning_key]:
                    match_structure["defence"][inning_key][team_name] = []

                match_structure["defence"][inning_key][team_name].append(batch_data)

        # Store under tournament → match
        defence_dict[tournament_name][match_name] = match_structure

    return defence_dict
