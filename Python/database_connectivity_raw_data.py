# insert the data in match_detail and player_match_stat Tables
import mysql.connector
import pandas as pd

DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "Advait@18"
DB_NAME = "Kho_Kho_db"
OUTPUT_DIR = "outputs"

EXPECTED_TABLES = [
    "raw_match_file_log",
    "raw_match_data",
    "raw_attack_details",
    "raw_defence_details",
    "raw_match_stats" 
]

def connect_db():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
def fetch_tables(conn):
    dfs = {}
    for table in EXPECTED_TABLES:
        try:
            dfs[table.lower()] = pd.read_sql(f"SELECT * FROM `{table}`", conn)
        except:
            dfs[table.lower()] = None
    return dfs

