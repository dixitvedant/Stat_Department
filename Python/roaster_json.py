import pandas as pd

def build_roaster_json(dfs, filters=None):
    
    # Extract required dataframes from input dict
    
    matches = dfs.get("match_details")
    players = dfs.get("player")
    pms = dfs.get("player_match_stat")
    teams = dfs.get("team")

    roster_dict = {}

    # If no match data is available, return empty result
    if matches is None:
        return roster_dict

   
    # Apply optional filters
    
    if filters:
        # Filter by match_id (affects both matches & match stats)
        if filters.get("match_id") is not None:
            matches = matches[matches["match_id"] == filters["match_id"]]
            pms = pms[pms["match_id"] == filters["match_id"]]

        # Filter players by role (if provided)
        if filters.get("role") is not None:
            players = players[
                players["role"].str.lower() == filters["role"].lower()
            ]

    
    
    

    # Map: team_id → team_name
    team_name_map = (
        {row.team_id: row.team_name for _, row in teams.iterrows()}
        if teams is not None else {}
    )

    # Map: player_id → player_name
    player_name_map = {
        row.player_id: row.player_name for _, row in players.iterrows()
    }

    # Map: player_id → role
    player_role_map = {
        row.player_id: row.role for _, row in players.iterrows()
    }

    # Map: player_id → team_id
    player_team_map = {
        int(row.player_id): int(row.team_id)
        for _, row in players.iterrows()
    }

    
    # Loop through each match
    
    for _, m in matches.iterrows():

        match_id = int(m["match_id"])
        match_date = m["match_date"]

        home_team = m.get("home_team")
        away_team = m.get("away_team")

        # Filter match stats for current match only
        match_players = pms[pms["match_id"] == match_id]

       
        # Helper function to build team-wise roster
        
        def get_team_data(team_id):
            attackers = []
            defenders = []
            all_rounders = []

            for _, prow in match_players.iterrows():
                pid = int(prow["player_id"])

                # Check if player belongs to this team
                if player_team_map.get(pid) == int(team_id):

                    pname = player_name_map.get(pid, "Unknown")
                    role = player_role_map.get(pid, "").lower()

                    # Categorize player based on role
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

        # Format match code as M01, M02, etc.
        match_code = f"M{match_id:02d}"

        # Store structured match roster data
        roster_dict[match_code] = {
            "match_date": str(match_date) if pd.notna(match_date) else None,
            "home_team": get_team_data(home_team),
            "away_team": get_team_data(away_team)
        }

    return roster_dict
