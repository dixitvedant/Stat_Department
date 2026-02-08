"""
def build_defence_json(dfs):
    matches=dfs.get("match_details")
    teams=dfs.get("team")
    defence=dfs.get("team_defence")
    defence_list=[]
    team_name_map = {row.team_id: row.team_name for _, row in teams.iterrows()} if teams is not None else {}
    if matches is None:
        return defence_list
    for _,m in matches.iterrows():
        m_id=m.get("match_id")
        team_cols = []
        batch_dic={}
        if "team_a" in m and pd.notna(m["team_a"]):
            team_cols.append(m["team_a"])
        if "team_b" in m and pd.notna(m["team_b"]):
            team_cols.append(m["team_b"])
        for tid in team_cols:
            final_list=[]
            for _,d in defence.iterrows():
                t_id=d.get("team_id")
                if (d["match_id"]) == m_id and int(tid) == (d["team_id"]):
                    team_name=team_name_map.get(t_id,-1)
                    inning=int(d.get("inning_no"))
                    if inning not in batch_dic:
                        batch_dic[inning]={}
                    b_dic={
                        "batch": int(d.get("batch_no")),
                        "start_time": int(d.get("start_minute")),
                        "duration": int(d.get("duration"))}
                    
                    final_list.append(b_dic)
                    batch_dic[inning][team_name]=final_list
        defence_list.append({m_id:batch_dic})
        print(defence_list)
    return defence_list"""
def build_defence_json(dfs):
  matches = dfs.get("match_details")
  teams = dfs.get("team")
  defence = dfs.get("team_defence")

  result = []

  team_name_map = (
      {row.team_id: row.team_name for _, row in teams.iterrows()}
      if teams is not None else {}
  )

  if matches is None or defence is None:
      return result

  for _, d in defence.iterrows():
    match_id = d["match_id"]
    team_name = team_name_map.get(d["team_id"], "UNKNOWN")

    result.append({
      "match_id": int(match_id),
      "team": str(team_name),
      "inning": int(d["inning_no"]),
      "batch": f"Batch {int(d['batch_no'])}",
      "start": int(d["start_minute"]),
      "duration": int(d["duration"])
    })

  return result

