def build_attack_json(dfs, filters=None):
    # Get required dataframes
    matches = dfs.get("match_details")
    teams = dfs.get("team")
    attack = dfs.get("team_attack")
    tournament = dfs.get("tournament")

    # Final result dictionary
    attack_dic = {}

    # Create mapping: team_id -> team_name 
    team_name_map = (
        teams.set_index("team_id")["team_name"].to_dict()
        if teams is not None else {}
    )

    # Create mapping: tournament_id -> tournament_name 
    tournament_name_map = (
        tournament.set_index("tournament_id")["tournament_name"].to_dict()
        if tournament is not None else {}
    )

    # Return empty if required data is missing
    if matches is None or attack is None:
        return attack_dic

    # Apply filters if provided
    if filters:

        # Filter by tournament name 
        if filters.get("tournament") and filters["tournament"] != "all":
            matches = matches[
                matches["tournament_id"].isin([
                    tid for tid, tname in tournament_name_map.items()
                    if tname.lower() == filters["tournament"].lower()
                ])
            ]

        # Filter by match name 
        if filters.get("match"):
            matches = matches[
                matches["match_name"].str.lower() == filters["match"].lower()
            ]

    # Group attack data by match_id to avoid repeated filtering 
    attack_grouped = attack.groupby("match_id")

    # Process each match (optimized)
    for m in matches.itertuples(index=False):
        m_id = m.match_id
        t_id = m.tournament_id
        match_name = getattr(m, "match_name", None)

        # Get tournament name using mapping
        tournament_name = tournament_name_map.get(t_id, f"Tournament_{t_id}")

        # Initialize tournament key if not present
        if tournament_name not in attack_dic:
            attack_dic[tournament_name] = {}

        phase_dic = {}

        # Get attack data for the current match 
        match_attack = attack_grouped.get_group(m_id) if m_id in attack_grouped.groups else None

        if match_attack is not None:

            # Process attack rows 
            for a in match_attack.itertuples(index=False):
                team_id = a.team_id
                team_name = team_name_map.get(team_id, -1)

                inning = "inning" + str(a.inning)
                phase = a.phase
                points = a.points

                # Initialize inning if not present
                if inning not in phase_dic:
                    phase_dic[inning] = {}

                # Initialize phase if not present
                if phase not in phase_dic[inning]:
                    phase_dic[inning][phase] = {}

                # Store points for the team
                phase_dic[inning][phase][team_name] = points

        # Assign match data under tournament
        attack_dic[tournament_name][match_name] = phase_dic

    return attack_dic
