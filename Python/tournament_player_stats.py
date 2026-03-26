def tournament_players_json(dfs,filters=None):
    # Fetch required dataframes
    pms = dfs.get("player_tournament_stat")
    player = dfs.get("player")
    team = dfs.get("team")
    tournament=dfs.get("tournament")

    # If essential data is missing, return empty list
    if pms is None or player is None:
        return []

    # Create lookup maps for fast access 

    # Map: player_id → {name, role, jersey_no}
    player_map = (
        player.set_index("player_id")[["player_name","role","jersey_no"]]
        .to_dict(orient="index")
    )

    # Map: team_id → team_name 
    team_map = (
        team.set_index("team_id")["team_name"].to_dict()
        if team is not None else {}
    )

    # Map: tournament_id → tournament_name 
    tournament_name_map = (
        tournament.set_index("tournament_id")["tournament_name"].to_dict()
        if tournament is not None else {}
    )

    result = {}

    if filters:
        if filters.get("tournament") and filters["tournament"] != "all":
            tname = filters["tournament"].lower()

            valid_tournaments = [
                tid for tid, name in tournament_name_map.items()
                if name.lower() == tname
            ]

            pms = pms[pms["tournament_id"].isin(valid_tournaments)]
    
    # Group by tournament_id to avoid repeated filtering 
    pms_grouped = pms.groupby("tournament_id")
    
    # Loop season-wise 
    for tournamnet_id, tournamnet_df in pms_grouped:

        players_list = []

        # Loop player-wise within season 
        for row in tournamnet_df.itertuples(index=False):

            player_id = int(row.player_id)

            # Extract attack & defense stats 
            attack = int(row.total_attack_points or 0)
            defense = int(row.total_defence_points or 0)

            # Get player info from lookup map
            player_info = player_map.get(player_id, {})

            role = str(player_info.get("role", "Unknown"))
            name = str(player_info.get("player_name", "Unknown"))
            jersey_no = player_info.get("jersey_no")

            # Role-based points calculation
            if role == "Attacker":
                points = attack
            elif role == "Defender":
                points = defense
            elif role == "All-Rounder":
                points = (attack * 30) + defense
            else:
                points = 0

            # Generate formatted player ID
            team_name = str(team_map.get(row.team_id, "Unknown"))
            team_code = team_name[:3].upper()

            # Extract initials from player name
            initials = "".join([part[0] for part in name.split() if part]).upper()

            formatted_id = f"{team_code}_{initials}"

            players_list.append({
                "id": formatted_id,           
                "player_id": player_id,       
                "name": str(name),
                "jersey_no": int(jersey_no) if jersey_no is not None else None,
                "team": team_name,
                "role": str(role),
                "stats": {
                    "matches": int(row.matches_played),
                    "points": int(points)
                }
            })

        # Append season-wise data
        result[tournament_name_map.get(tournamnet_id, str(tournamnet_id))] = players_list

    return result
