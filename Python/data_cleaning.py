import pandas as pd

def standardize_columns(df):
    if df is None:
        return None
    df = df.copy()
    df.columns = [c.strip().lower().replace(" ", "_").replace("-", "_").replace(".", "_") for c in df.columns]
    return df

def clean_table(df, table_name):
    if df is None:
        return None
    df = df.drop_duplicates()
    if table_name.startswith("raw_"):

        for c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="ignore")
            if pd.api.types.is_numeric_dtype(df[c]):
                df[c] = df[c].fillna(-1)
            else:
                df[c] = df[c].replace(r'^\s*$', "Unknown", regex=True)
                df[c] = df[c].fillna("Unknown")

    return df