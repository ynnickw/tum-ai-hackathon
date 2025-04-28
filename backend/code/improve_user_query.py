import os

from dotenv import load_dotenv
from openai import AzureOpenAI

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2025-01-01-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
)


async def improve_user_query(query: str, hotels: dict[str, dict[str, object]]) -> str:
    all_inner_keys = set()
    for inner_dict in hotels.values():
        all_inner_keys.update(inner_dict.keys())

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
        model="gpt-4o-mini-0718-eu",
        temperature=0,
        max_tokens=150,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"User query: {query}"},
        ],
    )

    improved_query = response.choices[0].message.content.strip()
    return improved_query


# Example usage:
if __name__ == "__main__":
    original_query = "I need a minimum 4-star hotel near the city center with free parking and fast Wi-Fi."
    print(improve_user_query(original_query))
