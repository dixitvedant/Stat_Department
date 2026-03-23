import pandas as pd

def build_h2h_json(dfs, filters=None):

    # Get required tables
    matches = dfs.get("match_details")
    teams = dfs.get("team")
    tournament = dfs.get("tournament")

    # If no match data, return empty result
    if matches is None or matches.empty:
        return {}

    # Create mappings for team and tournament names
    team_name_map = {row.team_id: row.team_name for _, row in teams.iterrows()} if teams is not None else {}
    tournament_name_map = {row.tournament_id: row.tournament_name for _, row in tournament.iterrows()} if tournament is not None else {}

    # Apply filters if provided
    if filters:

        # Filter matches by tournament
        if filters.get("tournament") and filters["tournament"] != "all":
            matches = matches[
                matches["tournament_id"].isin([
                    tid for tid, tname in tournament_name_map.items()
                    if tname == filters["tournament"]
                ])
            ]

    # If no matches left after filtering
    if matches.empty:
        return {}

    # If specific match is provided, return last 5 H2H matches
    if filters and filters.get("match"):

        # Get selected match
        base_match = matches[matches["match_name"] == filters["match"]]

        if base_match.empty:
            return {}

        base_match = base_match.iloc[0]

        # Get team IDs of selected match
        teamA_id = base_match["home_team"]
        teamB_id = base_match["away_team"]

        # Get matches between these two teams
        h2h_matches = matches[
            ((matches["home_team"] == teamA_id) & (matches["away_team"] == teamB_id)) |
            ((matches["home_team"] == teamB_id) & (matches["away_team"] == teamA_id))
        ]

        # Sort by date and take last 5 matches
        h2h_matches = h2h_matches.sort_values("match_date", ascending=False).head(5)

        # Create key name for teams
        key_name = f"{team_name_map.get(teamA_id)} vs {team_name_map.get(teamB_id)}"

        # Return H2H data for selected match
        return {
            key_name: build_match_list(h2h_matches, team_name_map)
        }

    # If no specific match, return all H2H groups
    h2h_result = {}

    # Create team pair (same pair regardless of order)
    matches["pair"] = matches.apply(
        lambda row: tuple(sorted([row["home_team"], row["away_team"]])),
        axis=1
    )

    # Group matches by team pair
    grouped = matches.groupby("pair")

    for pair, group in grouped:

        team1, team2 = pair

        # Create key name
        key_name = f"{team_name_map.get(team1)} vs {team_name_map.get(team2)}"

        # Sort matches by date
        group = group.sort_values("match_date", ascending=False)

        # Store match list
        h2h_result[key_name] = build_match_list(group, team_name_map)

    return h2h_result


# Helper Function
def build_match_list(matches, team_name_map):

    result_list = []

    # Loop through each match
    for _, m in matches.iterrows():

        result_value = m.get("result")

        # Determine winner
        if result_value == "Match Drawn":
            winner_name = "Draw"
        else:
            winner_name = team_name_map.get(m.get("winning_team"))

        # Append match details
        result_list.append({
            "match": m.get("match_name"),
            "date": str(m.get("match_date")) if pd.notna(m.get("match_date")) else None,
            "score": result_value,
            "winner": winner_name
        })

    return result_list
