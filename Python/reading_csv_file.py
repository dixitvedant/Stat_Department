import pandas as pd
from data_cleaning import standardize_columns
def read_csv_file():
    file_csv=pd.read_csv("E:\KHO KHO STATS\DS_match.csv",header=None)
    file_csv=standardize_columns(file_csv)
    return file_csv