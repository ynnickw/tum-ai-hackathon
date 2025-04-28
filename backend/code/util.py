from typing import Optional

import pandas as pd

model = "gpt-4o-0806-eu"


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


class Constraint:
    def __init__(
        self,
        column: str,
        datatype: type,
        value: object,
        comparison: Optional[str] = None,
    ):
        """
        column: Name der Spalte
        datatype: str, int oder float
        value: der Wert (z.B. True/False bei int, Vergleichswert bei float, exakter String bei str)
        comparison: für float ('<', '>', '<=', '>=', '==') – bei int/str wird es ignoriert
        """
        self.column = column
        self.datatype = datatype
        self.value = value
        self.comparison = comparison

    def is_satisfied(self, hotel_data: dict[str, object]) -> bool:
        if self.column not in hotel_data:
            return False

        hotel_value = hotel_data[self.column]
        if hotel_value is None:
            return False
        if self.datatype == int:
            # Boolesche Prüfung: int -> 1 = True, 0 = False
            return bool(hotel_value) == bool(self.value)

        elif self.datatype == float:
            if not isinstance(hotel_value, (int, float)):
                return False
            if self.comparison == ">":
                return hotel_value > self.value
            elif self.comparison == "<":
                return hotel_value < self.value
            elif self.comparison == ">=":
                return hotel_value >= self.value
            elif self.comparison == "<=":
                return hotel_value <= self.value
            elif self.comparison == "==":
                return hotel_value == self.value
            else:
                raise ValueError(f"Ungültige Vergleichsoperation: {self.comparison}")

        elif self.datatype == list[str]:
            return hotel_value in self.value

        else:
            raise TypeError(f"Unsupported datatype: {self.datatype}")

    def __repr__(self):
        return f"Constraint(column={self.column}, datatype={self.datatype.__name__}, value={self.value}, comparison={self.comparison})"


def get_boolean_constraint(column: str, query: str, client) -> Constraint:
    try:
        prompt = (
            f"Column: {column}. "
            f"User is searching for hotels. Prompt: '{query}'. "
            "Does this column need to be 1 (True) or 0 (False) for the user's request? "
            "Answer with only 1 or 0."
        )
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Answer only with 1 or 0."},
                {"role": "user", "content": prompt},
            ],
        )
        value = int(response.choices[0].message.content.strip())
        return Constraint(column=column, datatype=int, value=value)
    except Exception as e:
        return None


def get_comparison_constraint(column: str, query: str, client) -> Constraint:
    try:
        prompt = (
            f"Column: {column}. "
            f"User is searching for hotels. Prompt: '{query}'. "
            "Please respond with two values separated by a comma: "
            "First the comparison operator ('<', '>', '<=', '>=', '=='), "
            "then the reference value (a number). Example response: '<=, 100.0'."
            "Distance is measured in kilometers. "
        )
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "Answer with format: <operator>, <value>. Only this format.",
                },
                {"role": "user", "content": prompt},
            ],
        )
        content = response.choices[0].message.content.strip()
        comparison, value_str = [x.strip() for x in content.split(",")]
        value = float(value_str)
        return Constraint(
            column=column, datatype=float, value=value, comparison=comparison
        )
    except Exception as e:
        return None


def get_value_constraint(
    column: str, query: str, client, possible_values: set[str]
) -> Constraint:
    try:
        possible_values_string = ", ".join(possible_values)

        prompt = (
            f"Column: {column}. "
            f"Possible values: {possible_values_string}. "
            f"User is searching for hotels. Prompt: '{query}'. "
            "From the possible values, select all that match the user's request. "
            "Answer only with a comma-separated list of values from the provided list."
        )

        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "Only answer with a comma-separated list of values from the given list. No explanations.",
                },
                {"role": "user", "content": prompt},
            ],
        )

        content = response.choices[0].message.content.strip()
        selected_values = [val.strip() for val in content.split(",") if val.strip()]

        if selected_values:
            return Constraint(column=column, datatype=list[str], value=selected_values)
        else:
            return None
    except Exception as e:
        return None


def create_constraints(
    hotels: dict[str, dict[str, object]],
    query: str,
    important_fields: list[str],
    client,
) -> list[Constraint]:
    constraints = []
    for field in important_fields:
        # Beispiel: Automatisch Typen erkennen anhand der ersten Hotel-Objekte
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
