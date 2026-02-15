import pandas as pd

def standardize_columns(df):
    if df is None:
        return None

    df = df.copy()
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace("-", "_")
        .str.replace(".", "_")
    )

    return df


def clean_table(df, table_name):
    if df is None:
        return None

    df = df.copy()

    # Remove completely empty rows
    df = df.dropna(how="all")

    # Remove duplicate rows
    df = df.drop_duplicates()

    if table_name.startswith("raw_"):

        for col in df.columns:

            # If column is numeric type
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(0)

            # Otherwise treat as varchar/text
            else:
                df[col] = df[col].replace(r'^\s*$', None, regex=True)
                df[col] = df[col].fillna("Unknown")

    return df
