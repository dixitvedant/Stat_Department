from attack_json import build_attack_json
from defence_json import build_defence_json

def build_match_wise(dfs):
    matches=dfs.get("match_details")
    teams=dfs.get("team")
    match_list=[]
    if matches is None:
        return match_list
    attack=build_attack_json(dfs)
    defence=build_defence_json(dfs)
    team_name_map= {row.team_id: row.team_name for _, row in teams.iterrows()} if teams is not None else {}
    for _,m in matches.iterrows():
        m_id=int(m.get("match_id"))
        m_date=str(m.get("match_date"))
        home_team_id=int(m.get("home_team"))
        away_team_id=int(m.get("away_team"))
        winner_id=int(m.get("winning_team"))
        home_team_name=str(team_name_map.get(home_team_id,"Unknown"))
        away_team_name=str(team_name_map.get(away_team_id,"Unknown"))
        winner_name=str(team_name_map.get(winner_id,"Unknown"))
        attack_details=None
        defence_details=None
        for a in attack:
            for k,val in a.items():
                match_id=k
                if m_id == int(match_id):
                    attack_details=val
                    break
        for d in defence:
            for key,value in d.items():
                match_ID=key
                if m_id == int(match_ID):
                    defence_details=value
                    break
        match_list.append({
            "Match ID":m_id,
            "Match Date":m_date,
            "Score":f"{home_team_name} vs {away_team_name}",
            "Winner Team":winner_name,
            "Attack":attack_details,
            "defence":defence_details
        })
    return match_list