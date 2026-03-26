import pandas as pd

def build_match_details_json(dfs, filters=None):

    # Get required tables
    matches = dfs.get("match_details")
    teams = dfs.get("team")
    pms = dfs.get("player_match_stat")
    player = dfs.get("player")
    tournament = dfs.get("tournament")

    # Return empty if required data missing
    if matches is None or pms is None:
        return {}

    # Apply filters
    if filters:

        # Filter by tournament
        if filters.get("tournament") and tournament is not None:
            t_ids = tournament[
                tournament["tournament_name"] == filters["tournament"]
            ]["tournament_id"]
            matches = matches[matches["tournament_id"].isin(t_ids)]

        # Filter by match name
        if filters.get("match"):
            matches = matches[matches["match_name"] == filters["match"]]

    detail_list = []

    # Create lookup maps
    player_name_map = player.set_index("player_id")["player_name"].to_dict() if player is not None else {}
    player_role_map = player.set_index("player_id")["role"].to_dict() if player is not None else {}
    team_name_map = teams.set_index("team_id")["team_name"].to_dict() if teams is not None else {}

    # Group player stats by match_id
    pms_grouped = pms.groupby("match_id")

    # Loop through matches
    for m in matches.itertuples(index=False):

        m_id = m.match_id

        # Get player stats for match (do not skip if missing)
        match_pms = pms_grouped.get_group(m_id) if m_id in pms_grouped.groups else pd.DataFrame()

        # Add role column if data exists
        if not match_pms.empty:
            match_pms = match_pms.copy()
            match_pms["role"] = match_pms["player_id"].map(player_role_map)

        # Split by roles
        attackers = match_pms[match_pms["role"] == "Attacker"] if not match_pms.empty else pd.DataFrame()
        defenders = match_pms[match_pms["role"] == "Defender"] if not match_pms.empty else pd.DataFrame()
        all_rounders = match_pms[match_pms["role"] == "All-Rounder"] if not match_pms.empty else pd.DataFrame()

        # Best attacker
        best_attacker_id = (
            attackers.loc[attackers["attack_points"].fillna(0).idxmax()]["player_id"]
            if not attackers.empty else None
        )

        # Best defender
        best_defender_id = (
            defenders.loc[defenders["defense_points"].fillna(0).idxmax()]["player_id"]
            if not defenders.empty else None
        )

        # Best all-rounder
        best_all_rounder_id = None
        if not all_rounders.empty:
            idx = (
                (all_rounders["attack_points"].fillna(0) * 30) +
                all_rounders["defense_points"].fillna(0)
            ).idxmax()
            best_all_rounder_id = all_rounders.loc[idx]["player_id"]

        # Get team names
        home_team_name = team_name_map.get(m.home_team, "Unknown")
        away_team_name = team_name_map.get(m.away_team, "Unknown")

        # Determine winner
        winning_team_id = m.winning_team
        winner_team_name = "Draw" if pd.isna(winning_team_id) else team_name_map.get(winning_team_id, "Unknown")

        # Append match details
        detail_list.append({
            "id": m.match_name,
            "name": f"{home_team_name} vs {away_team_name}",
            "winner": winner_team_name,
            "bestAttacker": player_name_map.get(best_attacker_id, "Unknown"),
            "bestDefender": player_name_map.get(best_defender_id, "Unknown"),
            "bestAllrounder": player_name_map.get(best_all_rounder_id, "Unknown")
        })

    # Return final output
    return {"matches": detail_list}
