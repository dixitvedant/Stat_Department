import pandas as pd

def build_h2h_json(dfs,filters=None):
    matches = dfs.get("match_details")
    teams = dfs.get("team")
    pms = dfs.get("player_match_stat")
    players = dfs.get("player")
    seasons=dfs.get("season")

    h2h_dict = {"match": []}

    team_name_map = {row.team_id: row.team_name for _, row in teams.iterrows()} if teams is not None else {}
    player_team_map = {row.player_id: row.team_id for _, row in players.iterrows()} if players is not None else {}

    if matches is None:
        return h2h_dict

    if filters:

        if filters.get("tournament_id") is not None:
            matches = matches[
                matches["season_id"].isin(
                    seasons.loc[
                    seasons["tournament_id"] == filters["tournament_id"],
                    "season_id"
                ])]

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

    for _, m in matches.iterrows():
        match_id = m.get("match_id")
        teamA_id = m.get("home_team")
        teamB_id = m.get("away_team")
        teamA_score = m.get("home_team_score")
        teamB_score = m.get("away_team_score")

        if (teamA_score == 0 and teamB_score == 0) and pms is not None:
            pm_match = pms[pms["match_id"] == match_id].copy()

            if "team_id" not in pm_match:
                pm_match["team_id"] = pm_match["player_id"].map(player_team_map)

            if "points" in pm_match:
                team_scores = pm_match.groupby("team_id")["points"].sum().to_dict()
                teamA_score = team_scores.get(teamA_id, 0)
                teamB_score = team_scores.get(teamB_id, 0)

        winner_name = None
        if teamA_score > teamB_score:
            winner_name = team_name_map.get(teamA_id)
        elif teamB_score > teamA_score:
            winner_name = team_name_map.get(teamB_id)

        score_string = f"{team_name_map.get(teamA_id)} {teamA_score}-{teamB_score} {team_name_map.get(teamB_id)}"

        h2h_dict["match"].append({
            "match": f"{int(match_id)}",
            "date": str(m.get("match_date")) if pd.notna(m.get("match_date")) else None,
            "score": score_string,
            "winner": winner_name
        })

    return h2h_dict
