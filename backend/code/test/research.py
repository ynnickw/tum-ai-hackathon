import os

import pandas as pd

# Folder containing the Parquet files
folder_path = "../../data/hotels"

# List all Parquet files in the folder
parquet_files = [f for f in os.listdir(folder_path) if f.endswith(".parquet")]

# Only take the first three files
parquet_files = parquet_files[:3]


# Function to find constant columns in a DataFrame
def find_constant_columns(df):
    constant_cols = []
    for col in df.columns:
        if df[col].nunique(dropna=False) == 1:
            constant_cols.append(col)
    return set(constant_cols)


# List to store constant columns per file
constant_columns_list = []
for file in parquet_files:
    file_path = os.path.join(folder_path, file)
    df = pd.read_parquet(file_path)

    # Rename columns by removing 'amenity_' prefix
    df.columns = [col.replace("amenity_", "") for col in df.columns]

    constant_columns = find_constant_columns(df)
    constant_columns_list.append(constant_columns)

# Find intersection of constant columns across all files
common_constant_columns = set.intersection(*constant_columns_list)

# Print the common constant columns
print("Common constant columns across all files:")
print(list(common_constant_columns))
