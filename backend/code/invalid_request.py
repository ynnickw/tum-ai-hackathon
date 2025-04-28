import os
from typing import Optional

from dotenv import load_dotenv
from openai import AzureOpenAI

# Load environment variables
load_dotenv()

model = "o3-mini-0131-eu"


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
            model="o3-mini-0131-eu",
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
        is_invalid = check_invalid_request(request)
        if is_invalid:
            return False
        return True
    except InvalidRequestError as e:
        return False
    except Exception as e:
        return False


if __name__ == "__main__":
    # Example usage
    test_request = "I want to book a hotel in Paris"
    result = is_valid_request(test_request)
    print(f"Request: {test_request}")
    print(f"isValid: {result}")
