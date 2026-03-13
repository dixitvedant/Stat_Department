import pandas as pd


def build_h2h_json(dfs, filters=None):

    matches = dfs.get("match_details")
    teams = dfs.get("team")
    pms = dfs.get("player_match_stat")
    players = dfs.get("player")
    seasons = dfs.get("season")

    if matches is None or matches.empty:
        return {}

    team_name_map = {row.team_id: row.team_name for _, row in teams.iterrows()} if teams is not None else {}
    player_team_map = {row.player_id: row.team_id for _, row in players.iterrows()} if players is not None else {}

    # APPLY FILTERS (if any)
    if filters:

        if filters.get("tournament_id") is not None and seasons is not None:
            valid_seasons = seasons.loc[
                seasons["tournament_id"] == filters["tournament_id"],
                "season_id"
            ]
            matches = matches[matches["season_id"].isin(valid_seasons)]

        if filters.get("season_id") is not None:
            matches = matches[matches["season_id"] == filters["season_id"]]

        if filters.get("team_id") is not None:
            matches = matches[
                (matches["home_team"] == filters["team_id"]) |
                (matches["away_team"] == filters["team_id"])
            ]

    if matches.empty:
        return {}

    # IF match_id GIVEN → get only that pair
    if filters and filters.get("match_id") is not None:

        base_match = matches[matches["match_id"] == filters["match_id"]]

        if base_match.empty:
            return {}

        base_match = base_match.iloc[0]
        teamA_id = base_match["home_team"]
        teamB_id = base_match["away_team"]

        matches = matches[
            ((matches["home_team"] == teamA_id) & (matches["away_team"] == teamB_id)) |
            ((matches["home_team"] == teamB_id) & (matches["away_team"] == teamA_id))
        ]

        group_key = f"M{filters['match_id']:02d}"

        return {
            group_key: build_match_list(matches, team_name_map, pms, player_team_map)
        }

    # IF NO match_id → return ALL H2H GROUPS
    h2h_result = {}

    # Create unique team pairs
    matches["pair"] = matches.apply(
        lambda row: tuple(sorted([row["home_team"], row["away_team"]])),
        axis=1
    )

    grouped = matches.groupby("pair")

    for pair, group in grouped:

        team1, team2 = pair
        key_name = f"{team_name_map.get(team1)} vs {team_name_map.get(team2)}"

        h2h_result[key_name] = build_match_list(
            group.sort_values("match_date", ascending=False),
            team_name_map,
            pms,
            player_team_map
        )

    return h2h_result


# Helper Function
def build_match_list(matches, team_name_map, pms, player_team_map):

    result_list = []

    for _, m in matches.iterrows():

        match_id = m["match_id"]
        teamA_id = m["home_team"]
        teamB_id = m["away_team"]
        teamA_score = m["home_team_score"]
        teamB_score = m["away_team_score"]

        # If 0-0 calculate from player stats
        if (teamA_score == 0 and teamB_score == 0) and pms is not None:
            pm_match = pms[pms["match_id"] == match_id].copy()

            if "team_id" not in pm_match.columns:
                pm_match["team_id"] = pm_match["player_id"].map(player_team_map)

            if "points" in pm_match.columns:
                team_scores = pm_match.groupby("team_id")["points"].sum().to_dict()
                teamA_score = team_scores.get(teamA_id, 0)
                teamB_score = team_scores.get(teamB_id, 0)

        # Winner Logic
        if pd.isna(m.get("winning_team")):
            winner_name = "Draw"
        else:
            winner_name = team_name_map.get(m.get("winning_team"))

        score_string = f"{team_name_map.get(teamA_id)} {teamA_score}-{teamB_score} {team_name_map.get(teamB_id)}"
        match_code = f"M{match_id:02d}"

        result_list.append({
            "match": match_code,
            "date": str(m.get("match_date")) if pd.notna(m.get("match_date")) else None,
            "score": score_string,
            "winner": winner_name
        })

    return result_list
