import json
import pandas as pd

def Point_Table(dfs, filters=None):

    # Get required tables
    ts = dfs.get("team_stat")
    tournament = dfs.get("tournament")
    teams = dfs.get("team")

    # If no team stats data, return empty structure
    if ts is None:
        return {"seasons": [], "tables": {}}
    
    # Create mapping of team_id to team_name
    team_name_map = {
        row.team_id: row.team_name
        for _, row in teams.iterrows()
    } if teams is not None else {}

    # Create mapping of tournament_id to tournament_name
    tournament_name_map = {
        row.tournament_id: row.tournament_name
        for _, row in tournament.iterrows()
    } if tournament is not None else {}

    # Initialize final output structure
    final_output = {
        "tournament": [],
        "tables": {}
    }

    # Apply tournament filter if provided
    if filters and filters.get("tournament") and filters["tournament"] != "all":
        ts = ts[
            ts["tournament_id"].isin([
                tid for tid, tname in tournament_name_map.items()
                if tname == filters["tournament"]
            ])
        ]

    # Group data by tournament
    for tournament_id, tournament_group in ts.groupby("tournament_id"):

        # Get tournament name
        tournament_name = tournament_name_map.get(tournament_id, str(tournament_id))

        # Add tournament name to output list
        final_output["tournament"].append(str(tournament_name))

        # Sort teams by total points in descending order
        tournament_group = tournament_group.sort_values(
            by="total_points", ascending=False
        ).reset_index(drop=True)

        table_list = []

        # Loop through each team in tournament
        for index, row in tournament_group.iterrows():

            # Get team name
            team_name = team_name_map.get(row["team_id"], "UNKNOWN")

            # Convert recent form string to list
            recent_form = (json.loads(row["recent_form"]) 
                if pd.notna(row["recent_form"]) else [])

            # Append team data
            table_list.append({
                "pos": index + 1,  # position in table
                "name": team_name,
                "played": int(row["matches_played"]),
                "win": int(row["matches_wins"]),
                "loss": int(row["matches_lost"]),
                "nr": int(row["matches_draws"]),
                "pts": int(row["total_points"]),
                "form": recent_form,
                "id": team_name
            })

        # Store table under tournament name
        final_output["tables"][str(tournament_name)] = table_list

    # Return final output
    return final_output
