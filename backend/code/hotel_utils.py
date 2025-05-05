import json
import pandas as pd
from typing import Dict, List, Optional
from models import Constraint
from llm_utils import get_openai_client, get_boolean_constraint, get_comparison_constraint, get_value_constraint
from constants import CATEGORY_STRING, load_grouped_columns_from_json_string

def load_grouped_columns_from_json_string(json_string: str) -> dict[str, list[str]]:
    data = json.loads(json_string)

    # Sicherheitsprüfungen
    if not isinstance(data, dict):
        raise ValueError("JSON content must be a dictionary.")

    for key, value in data.items():
        if not isinstance(key, str) or not isinstance(value, list):
            raise ValueError(
                "Each key must be a string and each value must be a list of strings."
            )
        if not all(isinstance(item, str) for item in value):
            raise ValueError("Each item in the value lists must be a string.")

    return data

def parse_hotels_from_parquet(parquet_path: str) -> dict:
    df = pd.read_parquet(parquet_path)

    if "hotel_name" not in df.columns:
        raise ValueError("Parquet file must contain a 'hotel_name' column.")

    hotels = {}

    for _, row in df.iterrows():
        hotel_name = row["hotel_name"]
        hotel_data = row.drop(labels=["hotel_name"]).to_dict()
        hotel_data = {
            k: (v.item() if hasattr(v, "item") else v) for k, v in hotel_data.items()
        }
        hotels[hotel_name] = hotel_data

    return hotels

def get_score(
    constraints: list[Constraint], hotels: dict[str, dict[str, object]]
) -> dict[str, int]:
    scores = {}

    for hotel_name, hotel_data in hotels.items():
        score = 0
        for constraint in constraints:
            score += constraint.is_satisfied(hotel_data)
        if score > 0:
            scores[hotel_name] = score

    return scores

def sort_hotels_by_score(
    scores: dict[str, int], hotels: dict[str, dict[str, object]]
) -> list[str]:
    # Liste der Hotels sortieren: erst nach Score, dann nach ltr_score
    sorted_hotels = sorted(
        scores.items(),
        key=lambda item: (item[1], hotels[item[0]].get("ltr_score", 0)),
        reverse=True,
    )
    # Nur Hotelnamen zurückgeben
    return [hotel_name for hotel_name, _ in sorted_hotels]

def sort_hotels_by_ltr_score(hotels: dict[str, dict[str, object]]) -> list[str]:
    sorted_hotels = sorted(
        hotels.items(), key=lambda item: item[1].get("ltr_score", 0), reverse=True
    )
    return [hotel_name for hotel_name, _ in sorted_hotels]

def create_constraints(
    hotels: dict[str, dict[str, object]],
    query: str,
    important_fields: list[str],
    client,
) -> list[Constraint]:
    constraints = []
    for field in important_fields:
        # Beispiel: Automatisch Typen erkennen anhand der ersten Hotel-Objekte
        if field == "Massage" or field == "Pool":
            constraint = get_boolean_constraint(field, query, client)
            if constraint:
                constraints.append(constraint)
            continue
        if field == "starcategory":
            constraint = get_comparison_constraint(field, query, client)
            if constraint:
                constraints.append(constraint)
            continue
        for hotel in hotels.values():
            if field in hotel:
                value = hotel[field]
                if isinstance(value, int):
                    constraint = get_boolean_constraint(field, query, client)
                elif isinstance(value, float):
                    constraint = get_comparison_constraint(field, query, client)
                elif isinstance(value, str):
                    possible_values = set()
                    for hotel_data in hotels.values():
                        possible_values.add(hotel_data[field])
                    constraint = get_value_constraint(
                        field, query, client, possible_values
                    )
                else:
                    constraint = None
                if constraint:
                    constraints.append(constraint)
                break  # Field gefunden und behandelt
    return constraints 