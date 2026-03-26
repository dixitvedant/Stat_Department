import pandas as pd

def build_roaster_json(dfs, filters=None):
    
    # Get required tables
    matches = dfs.get("match_details")
    players = dfs.get("player")
    pms = dfs.get("player_match_stat")
    teams = dfs.get("team")
    tournament = dfs.get("tournament")

    roster_dict = {}

    # If no match data, return empty result
    if matches is None:
        return roster_dict

    # Create lookup maps

    # Map team_id to team_name 
    team_name_map = (
        teams.set_index("team_id")["team_name"].to_dict()
        if teams is not None else {}
    )

    # Map player_id to player_name 
    player_name_map = (
        players.set_index("player_id")["player_name"].to_dict()
        if players is not None else {}
    )

    # Map player_id to role 
    player_role_map = (
        players.set_index("player_id")["role"].to_dict()
        if players is not None else {}
    )

    # Map player_id to team_id 
    player_team_map = (
        players.set_index("player_id")["team_id"].to_dict()
        if players is not None else {}
    )
    
    # Tournament ID to name 
    tournament_name_map = (
        tournament.set_index("tournament_id")["tournament_name"].to_dict()
        if tournament is not None else {}
    )
    

    # Apply filter if required 
    if filters:

        # Filter matches by tournament
        if filters.get("tournament") and tournament is not None:
            matches = matches[
                matches["tournament_id"].isin([
                    tid for tid, tname in tournament_name_map.items()
                    if tname == filters["tournament"]
                ])
            ]

        # Filter matches by match name (M01, M02)
        if filters.get("match"):
            matches = matches[matches["match_name"] == filters["match"]]

            # Filter player match stats for selected match
            pms = pms[pms["match_id"].isin(matches["match_id"])]

    # If no matches left after filtering
    if matches.empty:
        return roster_dict

    # Group player stats by match_id to avoid repeated filtering 
    pms_grouped = pms.groupby("match_id")

    # Build roster data
    for m in matches.itertuples(index=False):  # optimized loop

        # Get match details
        match_id = int(m.match_id)
        match_date = getattr(m, "match_date", None)
        home_team = getattr(m, "home_team", None)
        away_team = getattr(m, "away_team", None)
        tournament_id = getattr(m, "tournament_id", None)

        # Get tournament name
        tournament_name = tournament_name_map.get(tournament_id, "Unknown")

        # Create tournament entry if not exists
        if tournament_name not in roster_dict:
            roster_dict[tournament_name] = {}

        # Get player stats for current match (optimized using groupby)
        match_players = pms_grouped.get_group(match_id) if match_id in pms_grouped.groups else pd.DataFrame()

        # Function to get players of a team grouped by role
        def get_team_data(team_id):
            attackers = []
            defenders = []
            all_rounders = []

            for prow in match_players.itertuples(index=False):  
                pid = int(prow.player_id)

                # Check if player belongs to this team
                if player_team_map.get(pid) == int(team_id):

                    pname = player_name_map.get(pid, "Unknown")
                    role = player_role_map.get(pid, "").lower()

                    # Group players by role
                    if role == "attacker":
                        attackers.append(pname)
                    elif role == "defender":
                        defenders.append(pname)
                    elif role == "all-rounder":
                        all_rounders.append(pname)

            # Return structured team data
            return {
                "name": team_name_map.get(team_id, "Unknown"),
                "attackers": attackers,
                "defenders": defenders,
                "allRounders": all_rounders
            }

        # Store match roster under tournament
        roster_dict[tournament_name][m.match_name] = {
            "match_date": str(match_date) if pd.notna(match_date) else None,
            "home_team": get_team_data(home_team),
            "away_team": get_team_data(away_team)
        }

    # Return final roster data
    return roster_dict
