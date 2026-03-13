
def sec_to_ms(sec):
    if sec is None:
        return "0m 0s"
    m = int(sec) // 60
    s = int(sec) % 60
    return f"{m}m {s}s"

def build_players_json(dfs):

    pss = dfs.get("player_season_stat")
    player = dfs.get("player")
    team = dfs.get("team")
    season = dfs.get("season")
    tournament = dfs.get("tournament")
    ts=dfs.get("team_stat")

    if pss is None or player is None:
        return {"players": []}

    players_list = []
    season_list=[]
    team_list=[]
    # Maps
    player_name_map = {row.player_id: row.player_name for _, row in player.iterrows()}
    player_role_map = {row.player_id: row.role for _, row in player.iterrows()}
    player_team_map = {row.player_id: row.team_id for _, row in player.iterrows()}
    player_jersey_map = {row.player_id: row.jersey_no for _, row in player.iterrows()}

    team_name_map = {row.team_id: row.team_name for _, row in team.iterrows()}
    season_name_map = {row.season_id: row.season_name for _, row in season.iterrows()}
    season_tournament_map = {row.season_id: row.tournament_id for _, row in season.iterrows()}
    tournament_name_map = {row.tournament_id: row.tournament_name for _, row in tournament.iterrows()}
    team_points_map = {(row.team_id, row.season_id): row.total_points for _, row in ts.iterrows()}
    
    for _, row in pss.iterrows():

        player_id = row["player_id"]
        season_id = row["season_id"]

        name = player_name_map.get(player_id, "Unknown")
        role = player_role_map.get(player_id, "Unknown")
        jersey = player_jersey_map.get(player_id, None)

        team_id = player_team_map.get(player_id)
        team_name = team_name_map.get(team_id, "Unknown")

        season_name = season_name_map.get(season_id, "Unknown")
        tournament_id = season_tournament_map.get(season_id)
        tournament_name = tournament_name_map.get(tournament_id, "Unknown")
        
        matches = row["matches_played"] or 0
        
        team_points = team_points_map.get((team_id, season_id), 0)
        
        total_attack = row["total_attack_points"] or 0
        total_defense = row["total_defence_points"] or 0

        # Calculations
        avg_attack = round(total_attack / matches, 2) if matches else 0
        avg_def_time = round(total_defense / matches, 2) if matches else 0

        # Player ID generation
        team_code = team_name[:3].upper()
        initials = "".join([x[0] for x in name.split()][:2]).upper()
        player_code = f"{team_code}_{initials}"
        total_points=int(row["total_attack_points"])+int(row["total_defence_points"])
        players_list.append({

            "id": player_code,
            "name": name,
            "team": team_name,
            "role": role,
            "jersey_no": jersey,
            "season": season_name,
            "tournament": tournament_name,

            "stats": {
                "matches":int(row["matches_played"] or 0),
                "simple_touch": int(row["total_touches"] or 0),
                "pole_dive": int(row["pole_dives"] or 0),
                "sky_dive": int(row["sky_dives"] or 0),
                "total_pts":total_points,
                "attacker_pts": total_attack,
                "defender_pts": total_defense,   
                "avg_attacking_points": avg_attack,
                "assist": int(row["assists"] or 0),
                "highest_attack_points": int(row["highest_attack_points"] or 0),
                "total_defence_time": sec_to_ms(int(total_defense)),
                "highest_defence_time": sec_to_ms(int(row["highest_def_time"] or 0)),
                "avg_defence_time": sec_to_ms(avg_def_time),
                "total_touches": int(row["total_touches"]),
                "team_total": int(team_points),
                "out_of_field": int(row["out_of_field"] or 0)

            }

        })

    return {"players": players_list}