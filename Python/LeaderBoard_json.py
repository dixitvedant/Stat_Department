def LeaderBoard(dfs):
    pms = dfs.get("player_season_stat")
    player = dfs.get("player")
    result = []
    if pms is None:
        return result
    player_name_map = {
        row.player_id: row.player_name
        for _, row in player.iterrows()
    }
    max_attack = -1
    max_defence = -1
    max_all_rounder = -1
    attack_player_id = -1
    defence_player_id = -1
    all_rounder_player_id = -1
    for _, pm in pms.iterrows():
        a_point = pm.get("total_attack_points", 0)
        d_point = pm.get("total_defense_points", 0)
        s_id=int(pm.get("season_id"))
        if a_point > max_attack:
            max_attack = a_point
            attack_player_id = pm.get("player_id")
        if d_point > max_defence:
            max_defence = d_point
            defence_player_id = pm.get("player_id")
        all_score = (a_point * 30) + d_point
        if all_score > max_all_rounder:
            max_all_rounder = all_score
            all_rounder_player_id = pm.get("player_id")

    attack_player_name = player_name_map.get(attack_player_id, "Unknown")
    defence_player_name = player_name_map.get(defence_player_id, "Unknown")
    all_rounder_player_name = player_name_map.get(all_rounder_player_id, "Unknown")

    result.append({
        "Season ID":s_id,
        "Player name": attack_player_name,
        "Award": "Best Attacker",
        "Attack Points": int(max_attack)
    })

    result.append({
        "Season ID":s_id,
        "Player name": defence_player_name,
        "Award": "Best Defender",
        "Defence Points": int(max_defence)
    })

    result.append({
        "Season ID":s_id,
        "Player name": all_rounder_player_name,
        "Award": "Best All-Rounder",
        "All Rounder Points": int(max_all_rounder)
    })

    return result
