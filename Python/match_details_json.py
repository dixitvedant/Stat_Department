import pandas as pd

def build_match_details_json(dfs, filters=None):

    # Get required tables
    matches = dfs.get("match_details")
    teams = dfs.get("team")
    pms = dfs.get("player_match_stat")
    player = dfs.get("player")
    tournament = dfs.get("tournament")

    # If required data is missing, return empty result
    if matches is None or pms is None:
        return {}

    # Apply filters
    if filters:

        # Filter matches by tournament name
        if filters.get("tournament") and tournament is not None:

            # Get tournament IDs matching the selected name
            t_ids = tournament[
                tournament["tournament_name"] == filters["tournament"]
            ]["tournament_id"].tolist()

            # Keep only matches from selected tournament
            matches = matches[matches["tournament_id"].isin(t_ids)]

        # Filter matches by match name (M01, M02)
        if filters.get("match"):
            matches = matches[matches["match_name"] == filters["match"]]

    detail_list = []

    # Create lookup maps
    player_name_map = {row.player_id: row.player_name for _, row in player.iterrows()} if player is not None else {}
    team_name_map = {row.team_id: row.team_name for _, row in teams.iterrows()} if teams is not None else {}
    player_role_map = {row.player_id: row.role for _, row in player.iterrows()} if player is not None else {}

    # Loop through each match
    for _, m in matches.iterrows():

        m_id = int(m["match_id"])

        # Get player stats for current match
        match_pms = pms[pms["match_id"] == m_id].copy()

        # Add role column to player stats
        match_pms["role"] = match_pms["player_id"].map(player_role_map)

        # Separate players by role
        attackers = match_pms[match_pms["role"] == "Attacker"]
        defenders = match_pms[match_pms["role"] == "Defender"]
        all_rounders = match_pms[match_pms["role"] == "All-Rounder"]

        # Find best attacker based on attack points
        best_attacker_id = (
            attackers.loc[attackers["attack_points"].fillna(0).idxmax()]["player_id"]
            if not attackers.empty else None
        )

        # Find best defender based on defense points
        best_defender_id = (
            defenders.loc[defenders["defense_points"].fillna(0).idxmax()]["player_id"]
            if not defenders.empty else None
        )

        # Find best all-rounder based on combined score
        best_all_rounder_id = None
        if not all_rounders.empty:
            idx = (
                (all_rounders["attack_points"].fillna(0) * 20) +
                all_rounders["defense_points"].fillna(0)
            ).idxmax()
            best_all_rounder_id = all_rounders.loc[idx]["player_id"]

        # Get team names
        home_team_name = team_name_map.get(m["home_team"], "Unknown")
        away_team_name = team_name_map.get(m["away_team"], "Unknown")

        # Determine winner
        winning_team_id = m.get("winning_team")
        winner_team_name = "Draw" if pd.isna(winning_team_id) else team_name_map.get(winning_team_id, "Unknown")

        # Append match details
        detail_list.append({
            "id": m.get("match_name"),
            "name": f"{home_team_name} vs {away_team_name}",
            "winner": winner_team_name,
            "bestAttacker": player_name_map.get(best_attacker_id, "Unknown"),
            "bestDefender": player_name_map.get(best_defender_id, "Unknown"),
            "bestAllrounder": player_name_map.get(best_all_rounder_id, "Unknown")
        })

    # Return final result
    return {"matches": detail_list}
