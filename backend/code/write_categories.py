import csv
import json
from collections import defaultdict


def group_columns_by_category(csv_path: str) -> dict[str, list[str]]:
    category_columns = defaultdict(list)

    with open(csv_path, mode="r", encoding="utf-8") as file:
        reader = csv.reader(file)
        next(reader)  # Header überspringen
        for column_name, category in reader:
            column_name = column_name.strip()
            category = category.strip()
            category_columns[category].append(column_name)

    return dict(category_columns)


def save_to_json(data: dict, output_path: str) -> None:
    with open(output_path, mode="w+", encoding="utf-8") as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)


# Beispielnutzung
if __name__ == "__main__":
    csv_file = "../data/hotel_columns_categorised.csv"  # <- Pfad zu deinem CSV hier
    json_file = "../data/grouped_columns.json"  # <- Name der JSON-Datei

    grouped_columns = group_columns_by_category(csv_file)
    save_to_json(grouped_columns, json_file)

    print(f"Grouped columns saved to '{json_file}'!")
