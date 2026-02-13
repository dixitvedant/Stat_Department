import json
import pandas as pd

def Point_Table(dfs):

    ts = dfs.get("team_stat")
    season_df = dfs.get("season")
    teams_df = dfs.get("team")

    if ts is None:
        return {"seasons": [], "tables": {}}

    team_name_map = {
        row.team_id: row.team_name
        for _, row in teams_df.iterrows()
    } if teams_df is not None else {}

    season_name_map = {
        row.season_id: row.season_name
        for _, row in season_df.iterrows()
    } if season_df is not None else {}

    final_output = {
        "seasons": [],
        "tables": {}
    }

    for season_id, season_group in ts.groupby("season_id"):

        season_name = season_name_map.get(season_id, str(season_id))
        final_output["seasons"].append(str(season_name))

        season_group = season_group.sort_values(
            by="total_points", ascending=False
        ).reset_index(drop=True)

        table_list = []

        for index, row in season_group.iterrows():

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

        final_output["tables"][str(season_name)] = table_list

    return final_output
