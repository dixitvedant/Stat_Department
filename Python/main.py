from exporting_json import export_json
from data_cleaning import standardize_columns,clean_table
from h2h_list_json import build_h2h_json
from roaster_json import build_roaster_json
from attack_json import build_attack_json
from defence_json import build_defence_json
from Point_Table_json import Point_Table
from database_connectivity import connect_db,fetch_tables 
from insert_clean_data import insert_clean_data_in_match,insert_clean_data_in_team_attack,insert_clean_data_in_team_defence,insert_clean_data_in_match_stat
from raw_data_pipeline import main2

def main():
    conn = connect_db()
    dfs = fetch_tables(conn)
    #print(dfs)
    for key, df in dfs.items():
        dfs[key] = clean_table(standardize_columns(df), key) 
    dfs_raw=main2()
    insert_clean_data_in_match(dfs_raw,dfs)
    insert_clean_data_in_team_attack(dfs_raw,dfs)
    insert_clean_data_in_team_defence(dfs_raw,dfs)
    insert_clean_data_in_match_stat(dfs_raw,dfs)
    roaster = build_roaster_json(dfs)
    h2h = build_h2h_json(dfs)
    attack=build_attack_json(dfs)
    defence=build_defence_json(dfs)
    table=Point_Table(dfs)
    export_json(roaster, "roaster.json")
    export_json(h2h, "h2h.json")
    export_json(attack,"attack.json")
    export_json(defence,"defence.json")
    export_json(table,"Points_Table.json")
    conn.close()
if __name__ == "__main__":
    main()
