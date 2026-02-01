from exporting_json import export_json
from data_cleaning import standardize_columns,clean_table
from h2h_list_json import build_h2h_json
from roaster_json import build_roaster_json
from database_connectivity import connect_db,fetch_tables 

def main():
    conn = connect_db()
    dfs = fetch_tables(conn)
    for key, df in dfs.items():
        dfs[key] = clean_table(standardize_columns(df), key)
        
    roaster = build_roaster_json(dfs)
    h2h = build_h2h_json(dfs)

    export_json(roaster, "roaster.json")
    export_json(h2h, "h2h.json")
    conn.close()
if __name__ == "__main__":
    main()