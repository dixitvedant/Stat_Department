from database_connectivity_raw_data import connect_db
from datetime import datetime
conn=connect_db()
cursor=conn.cursor()

def insert_clean_data_in_match(dfs_raw,dfs):
    rmd=dfs_raw.get("raw_match_data")
    season=dfs.get("Season")
    # add season_id in here
    for _,m in rmd.iterrows():
        m_id=m.get("raw_match_id")
        venue=m.get("raw_venue")
        home_team=m.get("raw_home_team")
        away_team=m.get("raw_away_team")
        date=m.get("raw_match_date")
        winner=m.get("raw_winner")
        home_team_score=m.get("raw_home_team_score")
        away_team_score=m.get("raw_away_team_score")
        result=m.get("result")
        query="Insert into Match_details(match_id,venue,home_team,away_team,match_date,winning_team,home_team_score,away_team_score,result) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        data=(m_id,venue,home_team,away_team,date,winner,home_team_score,away_team_score,result)
        cursor.execute(query,data) 
    conn.commit()
        
def insert_clean_data_in_team_attack(dfs_raw,dfs):
    rad=dfs_raw.get("raw_attack_details")
    teams=dfs.get("team")
    team_id_map = ({row.team_name: row.team_id for _, row in teams.iterrows()}if teams is not None else {})  
    for _,a in rad.iterrows():
        t_id=team_id_map.get(a.get("raw_team_name"),-1)
        m_id=a.get("raw_match")
        points=a.get("raw_points")
        inning=a.get("raw_inning")
        phase=a.get("raw_phase")
        query="Insert into Team_Attack(match_id,team_id,points,inning,phase) VALUES (%s,%s,%s,%s,%s)"
        data=(m_id,t_id,points,inning,phase)
        cursor.execute(query,data)
    conn.commit()
    
def insert_clean_data_in_team_defence(dfs_raw,dfs):
    rdd=dfs_raw.get("raw_defence_details")
    teams=dfs.get("team")
    team_id_map = ({row.team_name: row.team_id for _, row in teams.iterrows()}if teams is not None else {})
    for _,d in rdd.iterrows():
        t_id=team_id_map.get(d.get("raw_team_name"),-1)
        m_id=d.get("raw_match")
        batch=d.get("raw_batch")
        inning=d.get("raw_inning")
        start=d.get("raw_start_time")
        end=d.get("raw_end_time")
        fmt = "%H:%M"
        time1 = datetime.strptime(start, fmt)
        time2 = datetime.strptime(end, fmt)
        duration=abs(time2-time1)
        query="Insert into Team_Defence(match_id,inning_no,team_id,batch_no,start_time,end_time,duration) VALUES (%s,%s,%s,%s,%s,%s,%s)"
        data=(m_id,inning,t_id,batch,start,end,duration)
        cursor.execute(query,data)
    conn.commit()

def insert_clean_data_in_match_stat(dfs_raw,dfs):    
    rms=dfs_raw.get("raw_match_stats")
    for _,s in rms.iterrows():
        m_id=s.get("raw_match")
        category=s.get("raw_category")
        stat=s.get("raw_stat_type")
        home_team_count=s.get("raw_home_team_count")
        away_team_count=s.get("raw_away_team_count")
        query="Insert into Match_Stats(match_id,category,stat_type,home_team_count,away_team_count) VALUES (%s,%s,%s,%s,%s)"
        data=(m_id,category,stat,home_team_count,away_team_count)
        cursor.execute(query,data)
    conn.commit()
    
    

