from database_connectivity_raw_data import connect_db,fetch_tables
from data_cleaning import clean_table
def main2():
    conn=connect_db()
    dfs_raw=fetch_tables(conn)
    for key,df in dfs_raw.items():
        dfs_raw[key]=clean_table(df,key)
    conn.close()
    return dfs_raw