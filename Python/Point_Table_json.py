import json
import pandas as pd

def Point_Table(dfs, filters=None):

    # Get required dataframes
    ts = dfs.get("team_stat")
    tournament = dfs.get("tournament")
    teams = dfs.get("team")

    # Return empty if no team stats
    if ts is None:
        return {"tournament": [], "tables": {}}

    # Create team_id → team_name map
    team_name_map = (
        teams.set_index("team_id")["team_name"].to_dict()
        if teams is not None else {}
    )

    # Create tournament_id → tournament_name map
    tournament_name_map = (
        tournament.set_index("tournament_id")["tournament_name"].to_dict()
        if tournament is not None else {}
    )

    # Final output structure
    final_output = {
        "tournament": [],
        "tables": {}
    }

    # Apply tournament filter if given
    if filters and filters.get("tournament") and filters["tournament"] != "all":
        valid_ids = [
            tid for tid, name in tournament_name_map.items()
            if name == filters["tournament"]
        ]
        ts = ts[ts["tournament_id"].isin(valid_ids)]

    # Group data by tournament
    for tournament_id, tournament_group in ts.groupby("tournament_id"):

        # Get tournament name
        tournament_name = tournament_name_map.get(tournament_id, str(tournament_id))
        final_output["tournament"].append(str(tournament_name))

        # Sort teams by points
        tournament_group = (
            tournament_group
            .sort_values(by="total_points", ascending=False)
            .reset_index(drop=True)
        )

        table_list = []

        # Loop through each team row
        for idx, row in enumerate(tournament_group.itertuples(index=False), start=1):

            # Get team name
            team_name = team_name_map.get(row.team_id, "UNKNOWN")

            # Convert recent_form JSON string to list
            recent_form = (
                json.loads(row.recent_form)
                if pd.notna(row.recent_form)
                else []
            )

            # Append row data
            table_list.append({
                "pos": idx,
                "id": team_name,
                "played": int(row.matches_played),
                "win": int(row.matches_wins),
                "loss": int(row.matches_lost),
                "nr": int(row.matches_draws),
                "pts": int(row.total_points),
                "form": recent_form,
            })

        # Store table for this tournament
        final_output["tables"][str(tournament_name)] = table_list

    return final_output
