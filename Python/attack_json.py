import pandas as pd
def build_attack_json(dfs):
    matches=dfs.get("match_details")
    teams=dfs.get("team")
    attack=dfs.get("team_attack")
    attack_list=[]
    team_name_map = {row.team_id: row.team_name for _, row in teams.iterrows()} if teams is not None else {}
    if matches is None:
        return attack_list
    for _,m in matches.iterrows():
        m_id=m.get("match_id")
        team_cols = []
        phase_dic={}
        if "home_team" in m and pd.notna(m["home_team"]):
            team_cols.append(m["home_team"])
        if "away_team" in m and pd.notna(m["away_team"]):
            team_cols.append(m["away_team"])
        for tid in team_cols:
            for _,a in attack.iterrows():
                t_id=a.get("team_id")
                if int(a["match_id"]) == int(m_id) and int(a["team_id"]) == int(tid):
                    team_name=team_name_map.get(t_id,-1)
                    innings=a.get("inning")
                    points=a.get("points")
                    phase=a.get("phase")
                    if innings not in phase_dic:
                        phase_dic[innings] = {}
                    if phase not in phase_dic[innings]:
                        phase_dic[innings][phase] = {}
                    phase_dic[innings][phase][team_name] = points            
        attack_list.append({m_id:phase_dic})
    return attack_list
