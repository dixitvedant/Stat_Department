from database_connectivity_raw_data import connect_db,fetch_tables

conn=connect_db()
db_cursor=conn.cursor()

dfs=fetch_tables(conn)
for key, df in dfs.items():
    pass
def insert(dfs):
    pass