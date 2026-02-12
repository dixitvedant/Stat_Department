import json

def Point_Table(dfs):
    ts=dfs.get("team_stat")
    season=dfs.get("season")
    teams=dfs.get("team")
    result=[]
    team_name_map = ({row.team_id: row.team_name for _, row in teams.iterrows()}if teams is not None else {})
    season_name_map=({row.season_id: row.season_name for _, row in season.iterrows()}if season is not None else {})
    if ts is None:
        return result
    points={}
    p_list=[]
    key_dic={}
    position=0
    for _,t_s in ts.iterrows():
        points[int(t_s["team_id"])]=int(t_s["total_points"])
    for value in points.values():
        p_list.append(value)
    p_list.sort(reverse=True)
    for p in p_list:
        for key,val in points.items():
            if val == p:
                key_dic[key]=val
    for k , v in key_dic.items():
        position+=1
        for _,t_s in ts.iterrows():
            t_id=int(t_s["team_id"])
            played=int(t_s["matches_played"])
            Win = int(t_s["matches_wins"])
            Lost = int(t_s["matches_lost"])
            Draw = int(t_s["matches_draws"])
            recent_match=t_s["recent_form"]
            recent_match = json.loads(recent_match)
            if t_id == int(k):
                team_name=team_name_map.get(int(t_s["team_id"]),"UNKNOWN")
                season_name=season_name_map.get(int(t_s["season_id"]),"Unknown")
                result.append({
                    "Season name": season_name,
                    "Position" : position,
                    "Team name":team_name,
                    "Total Matches Played":played,
                    "Total Wins":Win,
                    "Total Lost":Lost,
                    "Total Draws":Draw,
                    "Total Points":v,
                    "Recent Form":recent_match
                })
    return result
