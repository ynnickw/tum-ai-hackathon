import os
from typing import Optional
from openai import OpenAI
from dotenv import load_dotenv
from models import Constraint
from constants import CATEGORY_STRING, load_grouped_columns_from_json_string

# Load .env file
load_dotenv()

MODEL = "gpt-4"  # or "gpt-3.5-turbo" depending on your needs

def get_openai_client() -> OpenAI:
    try:
        client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
        )
        return client
    except Exception as e:
        raise InvalidRequestError(f"Failed to initialize OpenAI client: {str(e)}")

def _ask_llm(system_prompt: str, user_prompt: str, client):
    resp = client.chat.completions.create(
        temperature=0,
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return resp.choices[0].message.content.strip()

def get_boolean_constraint(column: str, query: str, client) -> Optional[Constraint]:
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

def get_comparison_constraint(column: str, query: str, client) -> Optional[Constraint]:
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

def get_value_constraint(
    column: str, query: str, client, possible_values: set[str]
) -> Optional[Constraint]:
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

    client = get_openai_client()
    response = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"User query: {query}"},
        ],
    )

    improved_query = response.choices[0].message.content.strip()
    return improved_query

async def is_valid_request(request: str) -> bool:
    try:
        return not await check_invalid_request(request)
    except InvalidRequestError as e:
        return False
    except Exception as e:
        return False

async def check_invalid_request(request: str) -> bool:
    if not request or not isinstance(request, str):
        return True

    try:
        client = get_openai_client()

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
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a hotel search request validator.",
                },
                {"role": "user", "content": prompt},
            ],
        )

        print(response)

        result = response.choices[0].message.content.strip().lower()
        return result == "invalid"

    except Exception as e:
        raise InvalidRequestError(f"Error validating request: {str(e)}")

async def is_unrestricted_request(request: str) -> bool:
    """
    Returns True  → the prompt contains no concrete restrictions / filters.
    Returns False → at least one specific requirement is stated.
    """

    if not request or not isinstance(request, str):
        return True  # empty => unrestricted by definition

    try:
        client = get_openai_client()

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
            model=MODEL,
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

async def get_relevant_columns(query: str) -> Optional[list[str]]:
    all_inner_keys = set()

    categories = load_grouped_columns_from_json_string(CATEGORY_STRING)
    for category in categories.values():
        all_inner_keys.update(category)
    keys_string = ",".join(all_inner_keys)

    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model=MODEL,
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

if __name__ == "__main__":
    import asyncio
    client = get_openai_client()
    result = asyncio.run(get_relevant_columns("I want a hotel with a pool and a gym"))
    print(result)