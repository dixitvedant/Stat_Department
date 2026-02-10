import pandas as pd
from database_connectivity_raw_data import connect_db
from reading_csv_file import read_csv_file

conn=connect_db()
cursor=conn.cursor()
file_csv=read_csv_file()

def storing_in_main_file():
    query="Insert into raw_match_file_log(file_name,file_type,uploaded_by,uploaded_at) VALUES (%s,%s,%s,NOW())"
    data=("random.csv","CSV","ADMIN")
    cursor.execute(query,data)
    conn.commit()
    file_id=cursor.lastrowid
    return file_id
file_id=storing_in_main_file()

def insert_match_detail(file_id):
    match_details=file_csv[["match_id","match_date","home_team","away_team","home_team_points","away_team_points","result","winner","venue"]].drop_duplicates()
    match_id_map={}
    for _,m in match_details.iterrows():
        query="Insert into raw_match_data(file_id,raw_match_id,raw_match_date,raw_team_a,raw_team_b,raw_team_a_score,raw_team_b_score,raw_result,raw_winner,raw_venue) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        data=(file_id,m.match_id,m.match_date,m.home_team,m.away_team,m.home_team_points,m.away_team_points,m.result,m.winner,m.venue)
        cursor.execute(query,data)
        raw_match_id = cursor.lastrowid   
        match_id_map[m.match_id] = raw_match_id
    conn.commit()
    return match_id_map

def insert_attack_detail(file_id,match_id_map):
    attack_rows = []

    for _, r in file_csv.iterrows():
        # Home team attack
        attack_rows.append({
            "match_id": r.match_id,
            "team": r.home_team,
            "points": r.home_team_points,
            "inning": r.inning,
            "phase": r.phase
        })

        # Away team attack
        attack_rows.append({
            "match_id": r.match_id,
            "team": r.away_team,
            "points": r.away_team_points,
            "inning": r.inning,
            "phase": r.phase
        })

    attack_df = pd.DataFrame(attack_rows)
    attack_detail=attack_df[["match_id","team","points","inning","phase"]].drop_duplicates()
    attack_detail["raw_team_name"]=attack_detail["team"]
    attack_detail["raw_match"]=attack_detail["match_id"].map(match_id_map)
    attack_detail = attack_detail.dropna(subset=["raw_match"])
    for _,a in attack_detail.iterrows():
        query="Insert into raw_attack_details(file_id,raw_match,raw_team_name,raw_points,raw_inning,raw_phase) VALUES (%s,%s,%s,%s,%s,%s)"
        data=(file_id,a.raw_match,a.raw_team_name,a.points,a.inning,a.phase)
        cursor.execute(query,data)
    conn.commit()
    
def insert_defence_detail(file_id,match_id_map):
    defence_rows = []

    for _, r in file_csv.iterrows():
        # Home team attack
        defence_rows.append({
            "match_id": r.match_id,
            "team": r.home_team,
            "batch": r.batch,
            "inning": r.inning,
            "duration": r.duration
        })

        # Away team attack
        defence_rows.append({
            "match_id": r.match_id,
            "team": r.away_team,
            "batch": r.batch,
            "inning": r.inning,
            "duration": r.duration
        })

    defence_df = pd.DataFrame(defence_rows)
    defence_detail=defence_df[["match_id","team","batch","inning","duration"]].drop_duplicates()
    defence_detail["raw_team_name"]=defence_detail["team"]
    defence_detail["raw_match"]=defence_detail["match_id"].map(match_id_map)
    defence_detail = defence_detail.dropna(subset=["raw_match"])
    for _,a in defence_detail.iterrows():
        query="Insert into raw_defence_details(file_id,raw_match,raw_team_name,raw_batch,raw_inning,raw_duration) VALUES (%s,%s,%s,%s,%s,%s)"
        data=(file_id,a.raw_match,a.raw_team_name,a.batch,a.inning,a.duration)
        cursor.execute(query,data)
    conn.commit()
    

def insert_match_stat(file_id,match_id_map):
    stat=file_csv[["match_id","stat_type","home_team_count","away_team_count"]].drop_duplicates()
    stat["raw_match"]=stat["match_id"].map(match_id_map)
    stat = stat.dropna(subset=["raw_match"])
    for _,s in stat.iterrows():
        query="Insert into raw_match_stats(file_id,raw_match,raw_stat_type,raw_team_a_count,raw_team_b_count) VALUES (%s,%s,%s,%s,%s)"
        data=(file_id,s.raw_match,s.stat_type,s.home_team_count,s.away_team_count)
        cursor.execute(query,data)
    conn.commit()
        
        
    