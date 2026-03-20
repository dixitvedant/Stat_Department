import json
import pandas as pd

def Point_Table(dfs,filters=None):

    ts = dfs.get("team_stat")
    tournament=dfs.get("tournament")
    teams = dfs.get("team")

    if ts is None:
        return {"seasons": [], "tables": {}}
    
    team_name_map = {
        row.team_id: row.team_name
        for _, row in teams.iterrows()
    } if teams is not None else {}

    tournament_name_map = {
        row.tournament_id: row.tournament_name
        for _, row in tournament.iterrows()
    } if tournament is not None else {}

    final_output = {
        "tournament": [],
        "tables": {}
    }

    if filters.get("tournament") and filters["tournament"] != "all":
        ts = ts[
            ts["tournament_id"].isin([
                tid for tid, tname in tournament_name_map.items()
                if tname == filters["tournament"]
            ])
        ]

    
    for tournamnet_id, tournamnet_group in ts.groupby("tournament_id"):

        tournament_name = tournament_name_map.get(tournamnet_id, str(tournamnet_id))
        final_output["tournament"].append(str(tournament_name))

        tournamnet_group = tournamnet_group.sort_values(
            by="total_points", ascending=False
        ).reset_index(drop=True)

        table_list = []

        for index, row in tournamnet_group.iterrows():

            team_name = team_name_map.get(row["team_id"], "UNKNOWN")

            recent_form = json.loads(row["recent_form"]) \
                if pd.notna(row["recent_form"]) else []

            table_list.append({
                "pos": index + 1,
                "name": team_name,
                "played": int(row["matches_played"]),
                "win": int(row["matches_wins"]),
                "loss": int(row["matches_lost"]),
                "nr": int(row["matches_draws"]),
                "pts": int(row["total_points"]),
                "form": recent_form,
                "id": team_name  
            })

        final_output["tables"][str(tournament_name)] = table_list

    return final_output
