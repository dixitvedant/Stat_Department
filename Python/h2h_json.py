import pandas as pd

def build_h2h_json(dfs, filters=None):

    # Get required tables
    matches = dfs.get("match_details")
    teams = dfs.get("team")
    tournament = dfs.get("tournament")

    # If no match data, return empty result
    if matches is None or matches.empty:
        return {}

    # Create mappings for team and tournament names (optimized)
    team_name_map = (
        teams.set_index("team_id")["team_name"].to_dict()
        if teams is not None else {}
    )

    tournament_name_map = (
        tournament.set_index("tournament_id")["tournament_name"].to_dict()
        if tournament is not None else {}
    )

    # Apply filters if provided
    if filters:

        # Filter matches by tournament (case-insensitive fix)
        if filters.get("tournament") and filters["tournament"] != "all":
            matches = matches[
                matches["tournament_id"].isin([
                    tid for tid, tname in tournament_name_map.items()
                    if tname.lower() == filters["tournament"].lower()
                ])
            ]

    # If no matches left after filtering
    if matches.empty:
        return {}

    # If specific match is provided, return last 5 H2H matches
    if filters and filters.get("match"):

        # Get selected match (case-insensitive fix)
        base_match = matches[
            matches["match_name"].str.lower() == filters["match"].lower()
        ]

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

    # Create copy 
    matches = matches.copy()
    
    # Create team pair (optimized, removed apply)
    matches["pair"] = list(zip(
        matches[["home_team", "away_team"]].min(axis=1),
        matches[["home_team", "away_team"]].max(axis=1)
    ))

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

    # Loop through each match (optimized)
    for m in matches.itertuples(index=False):

        result_value = getattr(m, "result", None)

        # Determine winner
        if result_value == "Match Drawn":
            winner_name = "Draw"
        else:
            winner_name = team_name_map.get(getattr(m, "winning_team", None))

        # Append match details
        result_list.append({
            "match": getattr(m, "match_name", None),
            "date": str(getattr(m, "match_date", None)) if pd.notna(getattr(m, "match_date", None)) else None,
            "score": result_value,
            "winner": winner_name
        })

    return result_list
