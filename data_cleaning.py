import pandas as pd

def standardize_columns(df):
    """Lowercase column names and replace special characters with underscores"""
    if df is None:
        return None
    df = df.copy()
    df.columns = [c.strip().lower().replace(" ", "_").replace("-", "_").replace(".", "_") for c in df.columns]
    return df

# -------------------------------
# Clean tables
# -------------------------------
def clean_table(df, table_name):
    """Remove duplicates and fill missing values"""
    if df is None:
        return None
    df = df.drop_duplicates()
    # Fill missing values based on table
    if table_name in ("player_match_stat", "player_season_stat", "team_stat"):
        for c in df.select_dtypes(include="number"):
            df[c] = df[c].fillna(0)
        for c in df.select_dtypes(include="object"):
            df[c] = df[c].fillna("Unknown")
    elif table_name == "player":
        if "player_name" in df.columns:
            df["player_name"] = df["player_name"].fillna("Unknown")
    elif table_name == "team":
        if "team_name" in df.columns:
            df["team_name"] = df["team_name"].fillna("Unknown")
    elif table_name == "match":
        for c in df.columns:
            if "score" in c:
                df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)
    return df