import pandas as pd

def build_match_wise(dfs, filters=None):

    matches = dfs.get("match_details")
    teams = dfs.get("team")
    tournament = dfs.get("tournament")

    if matches is None:
        return {"matches": []}

    # -------------------
    # LOOKUP TABLES
    # -------------------

    team_name_map = {
        row.team_id: row.team_name
        for _, row in teams.iterrows()
    } if teams is not None else {}

    tournament_name_map = {
        row.tournament_id: row.tournament_name
        for _, row in tournament.iterrows()
    } if tournament is not None else {}

    # -------------------
    # BUILD JSON
    # -------------------

    match_list = []

    for _, m in matches.iterrows():

        match_id = int(m["match_id"])
        tournament_id = int(m["tournament_id"])

        home_team_id = int(m["home_team"])
        away_team_id = int(m["away_team"])

        home_team_name = team_name_map.get(home_team_id, "Unknown")
        away_team_name = team_name_map.get(away_team_id, "Unknown")

        winner_raw = m.get("winning_team")

        if pd.isna(winner_raw):
            winner_name = "Draw"
        else:
            winner_name = team_name_map.get(int(winner_raw), "Draw")

        tournament_name = tournament_name_map.get(tournament_id, "Unknown")

        home_score = m.get("home_team_score", "")
        away_score = m.get("away_team_score", "")

        score_text = f"{home_team_name} {home_score} - {away_score} {away_team_name}"

        match_list.append({
            "id": m.get("match_name", f"M{match_id:02d}"),  # use DB match_name
            "name": f"{home_team_name} vs {away_team_name}",
            "date": str(m["match_date"]),
            "tournament": tournament_name,
            "score": score_text,
            "winner": winner_name
        })

    # -------------------
    # APPLY FILTERS
    # -------------------

    if filters:

        if filters.get("query"):
            match_list = [
                m for m in match_list
                if filters["query"].lower() in m["name"].lower()
            ]

        if filters.get("tournament") and filters["tournament"] != "all":
            match_list = [
                m for m in match_list
                if m["tournament"] == filters["tournament"]
            ]

        if filters.get("year") and filters["year"] != "all":
            match_list = [
                m for m in match_list
                if filters["year"] in m["date"]
            ]

    return {
        "matches": match_list
    }
