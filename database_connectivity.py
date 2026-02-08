import mysql.connector
import pandas as pd

DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "Advait@18"
DB_NAME = "Kho_Kho_db"
OUTPUT_DIR = "outputs"

EXPECTED_TABLES = [
    "Team",
    "Player",
    "Match_details",
    "Player_Match_Stat",
    "Player_Season_Stat",
    "Team_Stat",
    "Team_Attack",
    "Team_Defence"
]

# -------------------------------
# Connect to MySQL
# -------------------------------
def connect_db():
    """Return MySQL connection"""
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
def fetch_tables(conn):
    """Fetch all expected tables as pandas DataFrames"""
    dfs = {}
    for table in EXPECTED_TABLES:
        try:
            dfs[table.lower()] = pd.read_sql(f"SELECT * FROM `{table}`", conn)
        except:
            dfs[table.lower()] = None
    return dfs


