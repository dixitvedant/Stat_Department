import pandas as pd

def build_match_wise(dfs, filters=None):

    # Get required tables from dictionary
    matches = dfs.get("match_details")
    teams = dfs.get("team")
    tournament = dfs.get("tournament")

    # If no match data is available, return empty list
    if matches is None:
        return {"matches": []}

    # Create mapping of team_id to team_name (optimized)
    team_name_map = (
        teams.set_index("team_id")["team_name"].to_dict()
        if teams is not None else {}
    )

    # Create mapping of tournament_id to tournament_name (optimized)
    tournament_name_map = (
        tournament.set_index("tournament_id")["tournament_name"].to_dict()
        if tournament is not None else {}
    )

    match_list = []

    # Loop through each match record (optimized)
    for m in matches.itertuples(index=False):

        # Extract basic IDs
        match_id = int(m.match_id)
        tournament_id = int(m.tournament_id)

        home_team_id = int(m.home_team)
        away_team_id = int(m.away_team)

        # Get team names using mapping
        home_team_name = team_name_map.get(home_team_id, "Unknown")
        away_team_name = team_name_map.get(away_team_id, "Unknown")

        # Determine winner
        winner_raw = getattr(m, "winning_team", None)

        if pd.isna(winner_raw):
            winner_name = "Draw"
        else:
            winner_name = team_name_map.get(int(winner_raw), "Draw")

        # Get tournament name
        tournament_name = tournament_name_map.get(tournament_id, "Unknown")

        # Get match result text
        score_text = getattr(m, "result", None)

        # Append formatted match data
        match_list.append({
            "id": getattr(m, "match_name", None),  # match identifier
            "name": f"{home_team_name} vs {away_team_name}",  # match title
            "date": str(m.match_date),
            "tournament": tournament_name,
            "score": score_text,
            "winner": winner_name
        })

    # Apply filters if provided
    if filters:

        # Filter by search query (match name)
        if filters.get("query"):
            match_list = [
                m for m in match_list
                if filters["query"].lower() in m["name"].lower()
            ]

        # Filter by tournament (case-insensitive fix)
        if filters.get("tournament") and filters["tournament"] != "all":
            match_list = [
                m for m in match_list
                if m["tournament"].lower() == filters["tournament"].lower()
            ]

        # Filter by year (from date string)
        if filters.get("year") and filters["year"] != "all":
            match_list = [
                m for m in match_list
                if filters["year"] in m["date"]
            ]

    # Return final result
    return {
        "matches": match_list
    }
