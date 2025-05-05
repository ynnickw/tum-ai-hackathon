from typing import Optional, List, Dict, Any

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
        if self.column == "Massage":
            score = 0
            for column in massage:
                score += hotel_data[column]
            return score > 0
        if self.column == "Pool":
            score = 0
            for column in pool:
                score += hotel_data[column]
            return score > 0
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

# Special amenity lists
massage = [
    "Fußmassage",
    "Ganzkörpermassage",
    "Handmassage",
    "Kopfmassage",
    "Massage",
    "Massagestuhl",
    "Nackenmassage",
    "Paarmassage",
    "Rückenmassage",
    "Massage im Zimmer",
]

pool = [
    "Infinity-Pool",
    "Innenpool",
    "Innenpool (saisonal)",
    "Pool",
    "Pool Cabana",
    "Pool mit Rampe",
    "Pool-/Strandtücher",
    "Außenpool",
    "Außenpool (saisonal)",
    "Beheizter Pool",
    "Whirlpool",
    "Whirlpool/Jacuzzi",
]

class InvalidRequestError(Exception):
    pass 