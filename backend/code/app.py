import asyncio
import json
import os
from typing import Optional

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import AzureOpenAI

# Load .env file
load_dotenv()

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2025-01-01-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
)
model = "gpt-4o-0806-eu"

CATEGORY_STRING = """
{
    "metadata": [
        "cancelable",
        "roomcategory",
        "locationtype",
        "locationname"
    ],
    "price_rating": [
        "pricepernight",
        "rating",
        "ratingscount",
        "popular_location_rank",
        "starcategory"
    ],
    "distances": [
        "distancetocity",
        "distancetounderground",
        "distancetobeach",
        "distancetobathing",
        "distancetoairport",
        "distancetotrainstation"
    ],
    "safety_health": [
        "24-Stunden-Rezeption",
        "24-Stunden-Sicherheitspersonal",
        "Bestätigte Corona-Schutzmaßnahmen",
        "Desinfektion von Geschirr",
        "Feuerlöscher",
        "Keine Corona-Schutzmaßnahmen",
        "Kontaktlose Bezahlung",
        "Kontaktloser Check-In/out",
        "Kostenloses Handdesinfektionsmittel",
        "Maskenpflicht",
        "Mitarbeiter tragen Schutzkleidung",
        "Reinigung mit Desinfektionsmittel",
        "Reinigungsmittel gegen Coronaviren",
        "Sicherheitsalarm",
        "Videoüberwachung der Außenbereiche der Unterkunft",
        "Videoüberwachung in Gemeinschaftsräumen"
    ],
    "food_beverage": [
        "Abendessen",
        "Bar",
        "Barrierefrei",
        "Barrierefreie Dusche",
        "Café",
        "Cash (Bargeld)",
        "Einzeln verpackte Essenspakete verfügbar",
        "Frühstück",
        "Frühstücksbuffet",
        "Gemeinschaftsküche",
        "Getränke/Snackautomat",
        "Grillmöglichkeiten",
        "Handschuhe für Gäste verfügbar",
        "Kinderfreundliches Buffet",
        "Kontinentales Frühstück",
        "Küche",
        "Masken für Gäste verfügbar",
        "Minibar",
        "Obere Stockwerke mit Fahrstuhl erreichbar",
        "Picknickbereich",
        "Poolbar",
        "Privates Abendessen",
        "Restaurant",
        "Schutzkleidung für Gäste verfügbar",
        "Snackbar",
        "Strandbar",
        "Strom aus erneuerbaren Energien",
        "Visuelle Hilfe: fühlbare Zeichen",
        "Vollwertiges Frühstück",
        "mealtype"
    ],
    "sport_recreation": [
        "Abenteuer",
        "Aerobic",
        "Billard",
        "Darts",
        "Fahrradstellplatz",
        "Fahrradtouren",
        "Fahrradvermietung",
        "Fitness",
        "Fitnesseinrichtung",
        "Gesicherte Fahrradstellplätze",
        "Golf/Sport",
        "Golfplatz (max. 3 km entfernt)",
        "Golfunterricht",
        "Kanusport",
        "Minigolf",
        "Radfahren",
        "Reiten",
        "Tennisausrüstung",
        "Tennisplatz",
        "Tischtennis",
        "Wandern",
        "Wassersportmöglichkeiten vor Ort",
        "Wasserpark",
        "Wasserrutsche"
    ],
    "room_amenities": [
        "WLAN",
        "LAN",
        "Adapter/Ladegeräte",
        "Aufdeckservice",
        "Babybadewanne",
        "Bademantel",
        "Badewanne oder Dusche",
        "Balkon",
        "Bettwäsche",
        "Dampfbad",
        "Deckenventilator",
        "Dusch-Badewannen Kombination",
        "Eigenes Badezimmer",
        "Essen kann auf das Zimmer geliefert werden",
        "Familienzimmer vorhanden",
        "Flachbild-TV",
        "Fußbad",
        "Föhn",
        "Gast kann Zimmerreinigung abmelden",
        "Gefrierschrank",
        "Gemeinschaftsbad",
        "Gemeinschaftslounge/TV-Bereich",
        "Halboffenes Badezimmer",
        "Heizung",
        "Heizung im Zimmer steuerbar",
        "Hypoallergene Bettware erhältlich",
        "Individuell dekoriert je Zimmer",
        "Individuelle Möbel je Zimmer",
        "Kabel TV",
        "Kinder-/Babybetten auf Anfrage",
        "Kinderbetreuung im Zimmer",
        "Klimaanlage im Zimmer",
        "Klimaanlage im Zimmer steuerbar",
        "Klimaanlage in allen Zimmern",
        "Kühlschrank",
        "Kühlschrank im Gemeinschaftsbereich",
        "Mikrowelle",
        "Mikrowelle im Gemeinschaftsbereich",
        "Mini-Kühlschrank",
        "Nichtraucherzimmer",
        "Niedriges Waschbecken",
        "Niedriges Waschbecken im Bad",
        "Notrufleine im Bad",
        "Premium Bettwaren",
        "Raucher und Nichtraucherzimmer",
        "Raucherzimmer",
        "Safe an der Rezeption",
        "Safe im Zimmer",
        "Safe in Laptopgröße",
        "Satelliten-TV",
        "Schlafsofa",
        "Schlafzimmer",
        "Schrank",
        "Schreibtisch",
        "Schwimmbad",
        "Smart TV",
        "Streaming-Dienste (z.B. Netflix)",
        "Streaming-Service",
        "TV",
        "Tagesbett",
        "Ventilator",
        "Waschsalon/Wäscheservice",
        "Wassereinsparende Badezimmer-Einrichtungen",
        "Wasserkocher",
        "Whirlpool-Badewanne",
        "Wohnzimmer",
        "Wäsche wird nach regionalem Standard gewaschen",
        "Zimmer mit Verbindungstür",
        "Zimmerreinigung",
        "Zimmerreinigung (eingeschränkt)",
        "Zimmerservice",
        "Zimmerservice (eingeschränkt)",
        "Zustellbett auf Anfrage",
        "Zustellbetten",
        "iPod-Dockingstation",
        "Übergroße Badewanne"
    ],
    "payment_methods": [
        "American Express",
        "Diners Club",
        "Discover",
        "Eurocard/Mastercard",
        "JCB",
        "Maestro",
        "Visa"
    ],
    "entertainment": [
        "Animation (Erwachsene)",
        "Karaoke",
        "Live-Musik/Performance",
        "Motto-Dinnerabende",
        "Nachtclub/DJ",
        "Pub Crawl"
    ],
    "style_theme": [
        "Aparthotel",
        "Boutique-/Designhotel",
        "Boutiquen/Läden",
        "Gasthaus",
        "Luxushotel",
        "Panoramahotel",
        "Pension",
        "Resort",
        "Romantik/Flitterwochen",
        "Strandhotel"
    ],
    "languages": [
        "Arabisch",
        "Bosnisch",
        "Deutsch",
        "Englisch",
        "Französisch",
        "Italienisch",
        "Japanisch",
        "Kroatisch",
        "Niederländisch",
        "Polnisch",
        "Portugiesisch",
        "Rumänisch",
        "Russisch",
        "Serbisch",
        "Slowakisch",
        "Thailändisch",
        "Tschechisch",
        "Ungarisch",
        "Spanisch"
    ],
    "business_events": [
        "Arbeitsbereich für Arbeit mit Laptop geeignet",
        "Businesscenter",
        "Businesshotel",
        "Computerarbeitsplatz",
        "Fax/Kopierer",
        "Konferenz- und Veranstaltungsräume"
    ],
    "pets": [
        "Assistenztiere sind von Gebühren/ Restriktionen ausgeschlossen",
        "Budgetorientiert",
        "Haustiere erlaubt",
        "Haustierfreundliches Hotel",
        "Hundeauslaufplatz",
        "Nur Assistenztiere sind erlaubt",
        "Nur Hunde sind erlaubt",
        "Nur Hunde und Katzen sind erlaubt",
        "Portier/Hotelpage",
        "Tierkörbchen"
    ],
    "other_amenity": [
        "Aufzug",
        "Ausflugsinformationen",
        "Ausgewiesene Raucherbereiche",
        "Backofen",
        "Bankettsaal",
        "Besichtigungstouren",
        "Bibliothek",
        "Bidet",
        "Bücher",
        "Bügeleinrichtungen",
        "Bügelservice",
        "Concierge Service",
        "Dachterrasse",
        "Daunenkissen",
        "Dusche",
        "Duschhocker",
        "Espressomaschine",
        "Essbereich",
        "Esstisch",
        "Express-Check-in/-out",
        "Filme",
        "Friseur-/Schönheitssalon",
        "Futternapf",
        "Ganzkörperpackung",
        "Garten",
        "Geldautomat vor Ort",
        "Geldwechsel",
        "Gepäckaufbewahrung",
        "Gesamte Wohneinheit im Erdgeschoß",
        "Geschenkeladen/ Zeitungsstand",
        "Gesichtsbehandlungen",
        "Gäste werden auf Gesundheit kontrolliert",
        "Haarentfernung mit Wachs",
        "Handtücher",
        "Hausschuhe",
        "Heiße Quelle",
        "Hochzeitsservice",
        "Hotel",
        "Kaffee/Tee in Gemeinschaftsräumen",
        "Kapelle/Schrein",
        "Keine oder eingeschränkte Verwendung von Plastik-Artikeln (z.B. Strohhalme",
        "Besteck oder Einweg-Artikel)",
        "Kissenauswahl",
        "Kitchenette",
        "Kochplatten/ Herd",
        "Kochutensilien",
        "Kunstgalerie im Hotel",
        "Körperpeeling",
        "Kühl-Gefrierkombination",
        "LGBT-Freundlich",
        "Lokale Karten",
        "Lunchpakete",
        "Maniküre",
        "Mehrsprachiges Personal",
        "Minimarkt vor Ort",
        "Mitarbeiter folgen Regeln des regionalen Standards",
        "Nichtraucherunterkunft",
        "Nichtschwimmerbereich",
        "Nur für Erwachsene",
        "Pediküre",
        "Pflegeprodukte",
        "Pillow-Top Matratze",
        "Privater Check-in/-out",
        "Privater Strand",
        "Privates Tauchbecken",
        "Privatstrand in der Nähe",
        "Rauchmelder",
        "Regendusche",
        "Reiseführer oder Empfehlungen",
        "Rezeption",
        "Räumliche Trennung von Gästen und Mitarbeitern in Hauptkontaktzonen",
        "Schallisolierung",
        "Schließfächer",
        "Seife",
        "Shampoo",
        "Shopping",
        "Sitzecke",
        "Social Distancing Maßnahmen",
        "Solarium",
        "Sonnenschirme",
        "Sonnenstühle/-liegen",
        "Speisen für spezielle Ernährungsbedürfnisse",
        "Spülmaschine",
        "Strand",
        "Strand Cabana",
        "Städtereise",
        "Tauchbecken",
        "Tee-/Kaffeezubereiter",
        "Telefon",
        "Terrasse",
        "Ticketservice",
        "Toilettenpapier",
        "Touren/Kurse über die örtliche Kultur",
        "Unterkunft wird von professionellem Reinigungsservice gereinigt",
        "Vegan",
        "Vegetarisch",
        "Veranda/Terrasse",
        "Verdunkelungsvorhänge",
        "Versiegelung des Raums nach Reinigung",
        "Wickeltisch",
        "Yoga",
        "Zahnbürste",
        "Zeitlicher Abstand zwischen Aufenthalten von Gästen eingeführt",
        "Zeitung",
        "Zeitungen in der Lobby",
        "ländlich"
    ],
    "transport_parking": [
        "Autovermietung",
        "Flughafenshuttle",
        "Gesicherte Parkplätze",
        "Kostenlos parken vor Ort",
        "Ladestation für Elektro-Autos",
        "Langzeitparken",
        "Parken vor Ort",
        "Parkhaus/Tiefgarage",
        "Parkplatz außerhalb des Hotelgeländes",
        "Parkservice",
        "Shuttle in die Umgebung",
        "Shuttle zum Bahnhof",
        "Shuttle zur Fähre",
        "Shuttleservice"
    ],
    "wellness_spa": [
        "Hydromassage Dusche",
        "Sauna",
        "Spa & Wellnesscenter",
        "Spa-Anwendungen",
        "Spa/Entspannung",
        "Wellness",
        "Wellnessangebote",
        "Wellnessbehandlungsraum/-räume",
        "Wellnesshotel",
        "Wellnesslounge/Ruhebereich",
        "Pool",
        "Massage"
    ],
    "family_kids": [
        "Baby-/ Kinderbetreuung",
        "Betreute Kinderaktivitäten",
        "Brettspiele/Puzzle",
        "Buggys",
        "Familie",
        "Geschirr für Kinder",
        "Kinderbecken",
        "Kinderbücher",
        "Kinderclub",
        "Kinderhochstuhl",
        "Kindermahlzeiten",
        "Kinderspielplatz",
        "Outdoorspielgeräte für Kinder",
        "Spielbereich",
        "Spiele für Kinder",
        "Spielhalle",
        "Spielzeug",
        "Wasserspielzeug für Kinder"
    ],
    "accessibility": [
        "Behindertenfreundlich",
        "Behindertengerechte Parkplätze",
        "Gesamte Wohneinheit ist rollstuhlgerecht",
        "Höheres WC",
        "Hörhilfen",
        "Nicht rollstuhlgerecht",
        "Rollstuhlgerecht",
        "Visuelle Hilfe: Braille",
        "WC mit Haltegriffen",
        "Zugang über außengelegene Gänge",
        "direkter Strandzugang (privater Strand)",
        "Rollstühle verfügbar"
    ],
    "sustainability": [
        "Investitionen in lokale Nachhaltigkeitsprojekte",
        "Lebensmittel aus biologischem Anbau",
        "Lebensmittel aus der Region",
        "Maßnahmen zur Reduzierung des Energieverbrauchs",
        "Nachhaltige Unterkunft",
        "Programm zur Reduzierung von Lebensmittelabfällen",
        "Recycling",
        "Teile des CO²-Ausstoßes werden durch Zertifikate ausgeglichen"
    ]
}
"""

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


def find_matching_hotels(
    query: str, hotels: dict[str, dict[str, object]]
) -> list[str] | None:
    """
    Find matching hotels based on the given query.

    Args:
        query (str): The search query from the user.
        hotels (dict[str, dict[str, object]]): Dictionary containing hotel information.
            Format: {
                "hotel_name": {
                    "name": str,
                    "rating": float,
                    "distance_to_beach": float,
                    ...
                },
                ...
            }

    Returns:
        list[str] | None: List of hotel_names that match the query, or None if the query is not hotel related.
    """

    async def runner():
        task0 = asyncio.create_task(improve_user_query(query, hotels))
        task1 = asyncio.create_task(is_valid_request(query))
        task2 = asyncio.create_task(is_unrestricted_request(query))
        return await asyncio.gather(task0, task1, task2)

    improved_query, is_valid, is_unrestricted = asyncio.run(runner())
    if not is_valid:
        return None

    if is_unrestricted:
        return sort_hotels_by_ltr_score(hotels)[:10]

    relevant_columns = asyncio.run(get_relevant_columns(improved_query))

    if (not relevant_columns) or len(relevant_columns) == 0:
        return []

    constraints = create_constraints(hotels, improved_query, relevant_columns, client)
    scores = get_score(constraints, hotels)

    sorted_hotel_names = sort_hotels_by_score(scores, hotels)

    return sorted_hotel_names[:10]


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


async def get_relevant_columns(query: str) -> list[str] | None:
    all_inner_keys = set()

    categories = load_grouped_columns_from_json_string(CATEGORY_STRING)
    for category in categories.values():
        all_inner_keys.update(category)
    keys_string = ",".join(all_inner_keys)

    try:
        response = client.chat.completions.create(
            model=model,
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a strict extraction assistant for a hotel search system.\n\n"
                        "Given a user prompt, your job is to select exactly the matching column names from the following list:\n\n"
                        f"{keys_string}\n\n"
                        "Important:\n"
                        "- Information about included meals (e.g., breakfast included, all-inclusive) is found in the column named **mealtype**.\n"
                        "- Information about room types (e.g., Deluxe Double Room, Suite) is found in the column named **roomcategory**.\n\n"
                        "Instructions:\n"
                        "- Only select from the provided column names. Do not invent new ones.\n"
                        "- Only include columns that directly match or are clearly implied by the user prompt.\n"
                        "- Use a **single line**, comma-separated, **no spaces**.\n"
                        "- Do not include any explanations, words, or extra characters.\n"
                        "- If no relevant columns are found, return an **empty string**.\n\n"
                        "Example Output:\n"
                        "distancetotrainstation,Innenpool,rating\n"
                        "or\n"
                        "'' (empty quotes if no match)"
                    ),
                },
                {
                    "role": "user",
                    "content": f"User prompt: {query}",
                },
            ],
        )

        if len(response.choices[0].message.content) < 3:
            return []
        return [
            part.strip()
            for part in response.choices[0].message.content.split(",")
            if part.strip()
        ]
    except Exception as e:
        return None


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


async def improve_user_query(query: str, hotels: dict[str, dict[str, object]]) -> str:
    all_inner_keys = set()

    categories = load_grouped_columns_from_json_string(CATEGORY_STRING)
    for category in categories.values():
        all_inner_keys.update(category)
    keys_string = ",".join(all_inner_keys)

    system_prompt = f"""
            You are a travel assistant that improves hotel search queries.

            Your job is to strictly rewrite the user's hotel search prompt to make it:
            - More structured and specific
            - Explicitly aligned with the following hotel database fields:
            {keys_string}

            Important Rules:
            - Do NOT add any information that is not clearly stated in the original request.
            - Do NOT assume or guess additional needs.
            - ONLY rephrase or clarify what the user already asked for.
            - Preserve the original intent exactly.
            - Keep the language natural and friendly, as if a real user wrote it.

            Response Format:
            - Respond only with the improved query text.
            - Do not add any explanations or extra text outside the query.

            Example:
            Original: "Need hotel with pool and breakfast."
            Improved: "I'm looking for a hotel that offers a pool and provides breakfast."

            Now, improve the following hotel search request:

            \"\"\"{query}\"\"\"
            """

    response = client.chat.completions.create(
        model=model,
        temperature=0,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"User query: {query}"},
        ],
    )

    improved_query = response.choices[0].message.content.strip()
    return improved_query


class InvalidRequestError(Exception):
    pass


def get_azure_client() -> AzureOpenAI:
    try:
        client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version="2025-01-01-preview",
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        )
        return client
    except Exception as e:
        raise InvalidRequestError(f"Failed to initialize Azure OpenAI client: {str(e)}")


def check_invalid_request(request: str) -> bool:
    if not request or not isinstance(request, str):
        return True

    try:
        client = get_azure_client()

        # Prepare the prompt for validation
        prompt = f"""
        You are an assistant that checks whether a user request is suitable for a hotel search.

        A request is **valid** if it expresses specific needs, wishes, preferences, or requirements related to a hotel stay — for example, amenities, location, price, type of hotel, accessibility, nearby attractions, food options, etc.

        A request is **invalid** if it:
        - Asks unrelated questions (e.g., about games, finance, travel tips, etc.)
        - Mentions no hotel-related features, amenities, or booking intent
        - Is purely general (e.g., 'Tell me something funny') or about other travel aspects (e.g., flights, car rentals)

        Now analyze the following user request:

        \"\"\"{request}\"\"\"

        Respond with exactly one word: **'valid'** or **'invalid'**.
        """

        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a hotel search request validator.",
                },
                {"role": "user", "content": prompt},
            ],
        )

        result = response.choices[0].message.content.strip().lower()
        return result == "invalid"

    except Exception as e:
        raise InvalidRequestError(f"Error validating request: {str(e)}")


async def is_valid_request(request: str) -> bool:
    try:
        return not check_invalid_request(request)
    except InvalidRequestError as e:
        return False
    except Exception as e:
        return False


async def is_unrestricted_request(request: str) -> bool:
    """
    Returns True  → the prompt contains no concrete restrictions / filters.
    Returns False → at least one specific requirement is stated.
    """

    if not request or not isinstance(request, str):
        return True  # empty => unrestricted by definition

    try:
        client = get_azure_client()

        system_msg = (
            "You are a hotel-query classifier.\n"
            "Respond with ONE word only:\n"
            "  UNRESTRICTED – if the user gives NO explicit filters beyond a general "
            "wish to see hotels (number of guests alone does NOT count as a filter).\n"
            "  RESTRICTED   – if the user mentions ANY concrete preference or "
            "constraint, including but not limited to:\n"
            "      • price, budget, or currency amounts\n"
            "      • star rating or review score\n"
            "      • amenities (pool, spa, parking, pets, breakfast, etc.)\n"
            "      • distance or location modifiers (near beach, city centre, …)\n"
            "      • dates, duration, check-in or check-out\n"
            "      • room type (suite, apartment, etc.)\n"
            "      • accessibility, pet policy, view, theme, etc.\n"
            "No additional words or punctuation."
        )

        user_msg = f'User prompt: """{request}"""'

        resp = client.chat.completions.create(
            model=model,
            temperature=0,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg},
            ],
        )

        verdict = resp.choices[0].message.content.strip().upper()
        return verdict == "UNRESTRICTED"

    except Exception as e:
        raise InvalidRequestError(f"Error classifying restriction level: {str(e)}")


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


# -------------------------------------------------------------
# Helper: one deterministic LLM call that ALWAYS returns
# exactly the allowed format (single line, no explanations).
# -------------------------------------------------------------
def _ask_llm(system_prompt: str, user_prompt: str, client):
    resp = client.chat.completions.create(
        temperature=0,
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return resp.choices[0].message.content.strip()


# -------------------------------------------------------------
# 1) Boolean constraint   (returns 1 / 0  or  REMOVE_CONSTRAINT)
# -------------------------------------------------------------
def get_boolean_constraint(column: str, query: str, client) -> Constraint | None:
    """
    Returns Constraint(value=0|1) or None (if not relevant).
    """
    system_prompt = (
        "You are a column filter for hotel data.\n"
        "Respond **only** with:\n"
        "  • 1   – if the column must be 1 (True)\n"
        "  • 0   – if the column must be 0 (False)\n"
        "  • REMOVE_CONSTRAINT – if this column is irrelevant to the query\n"
        "No other words, spaces or explanations."
    )

    user_prompt = (
        f"Column: {column}\n"
        f"User query: {query}\n"
        "If the column is relevant return the appropriate boolean value."
    )

    try:
        content = _ask_llm(system_prompt, user_prompt, client)
        if content == "REMOVE_CONSTRAINT":
            return None
        value = int(content)  # 0 or 1
        return Constraint(column=column, datatype=int, value=value)
    except Exception:
        return None


# -------------------------------------------------------------
# 2) Numeric comparison constraint
#    (<,>,<=,>=,==) or REMOVE_CONSTRAINT
# -------------------------------------------------------------
def get_comparison_constraint(column: str, query: str, client) -> Constraint | None:
    """
    Returns Constraint(comparison, value) or None.
    """
    system_prompt = (
        "You are a column filter for hotel data.\n"
        "Allowed response format (single line, NO spaces):\n"
        "  <operator>,<number>\n"
        "Where <operator> is one of < > <= >= ==\n"
        "OR exactly: REMOVE_CONSTRAINT if the column is not relevant.\n"
        "Do not add explanations.\n\n"
        "Additional rules:\n"
        "- Distances are measured in kilometers.\n"
        "- Star ratings (starcategory) are on a scale of 1 to 5.\n"
        "- If the user specifies a location preference (e.g., 'near the beach', 'close to city center') but does not give an explicit number, you must reasonably estimate a suitable threshold based on typical expectations.\n"
        "- Choose thresholds that make sense in context (e.g., walking distance to downtown might imply 1 km or less).\n"
        "- You must still return the answer strictly in the defined format.\n"
    )

    user_prompt = (
        f"Column: {column}\n"
        f"User query: {query}\n"
        "If relevant, return the appropriate numeric comparison."
    )
    try:
        content = _ask_llm(system_prompt, user_prompt, client)
        if content == "REMOVE_CONSTRAINT":
            return None
        op, val = content.split(",", 1)
        return Constraint(
            column=column, datatype=float, comparison=op, value=float(val)
        )
    except Exception:
        return None


# -------------------------------------------------------------
# 3) Value-set constraint (categorical columns)
#    comma-separated list or REMOVE_CONSTRAINT
# -------------------------------------------------------------
def get_value_constraint(
    column: str, query: str, client, possible_values: set[str]
) -> Constraint | None:
    """
    Returns Constraint(value=[…]) or None.
    """
    choices = ", ".join(sorted(possible_values))

    system_prompt = (
        "You are a column filter for hotel data.\n"
        "Return ONLY a comma-separated list of values from the provided list,\n"
        "OR exactly REMOVE_CONSTRAINT if none of them apply.\n"
        "No extra words or explanations."
    )

    user_prompt = (
        f"Column: {column}\n"
        f"Possible values: {choices}\n"
        f"User query: {query}\n"
        "Select all matching values."
    )
    try:
        content = _ask_llm(system_prompt, user_prompt, client)
        if content == "REMOVE_CONSTRAINT":
            return None
        selected = [v.strip() for v in content.split(",") if v.strip()]
        return (
            Constraint(column=column, datatype=list[str], value=selected)
            if selected
            else None
        )
    except Exception:
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


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/hotels")
def get_hotels(city: str = "Mallorca", query: str = "") -> dict[str, object]:
    filepaths = {
        "New York": "../data/hotels/resultlist_New York.parquet",
        "Mallorca": "../data/hotels/resultlist_Mallorca.parquet",
        "Kopenhagen": "../data/hotels/resultlist_Kopenhagen.parquet",
    }

    if city not in filepaths:
        raise HTTPException(
            status_code=404, detail="Could not find hotel file for this city."
        )

    file = filepaths[city]

    try:
        all_hotels = parse_hotels_from_parquet(file)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error parsing hotel file: {str(e)}"
        )

    top_ten_hotels = find_matching_hotels(query, all_hotels)

    if top_ten_hotels is None:
        raise HTTPException(status_code=400, detail="Invalid request.")

    if len(top_ten_hotels) == 0:
        raise HTTPException(status_code=404, detail="No matching hotels found.")

    hotels_with_description = {hotel: all_hotels[hotel] for hotel in top_ten_hotels}

    return hotels_with_description


if __name__ == "__main__":
    hotel_file = parse_hotels_from_parquet("../data/hotels/resultlist_Mallorca.parquet")
    prompts = [
        "I want a hotel near to the city, but also near to the beach with a sauna. It should cost less than 100 euros per night. I want a luxury suite with a pool.",
    ]
    for prompt in prompts:
        hotels = find_matching_hotels(prompt, hotel_file)
        print(hotels)
        print("\n")
