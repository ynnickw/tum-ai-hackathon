import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from hotel_utils import (
    parse_hotels_from_parquet,
    create_constraints,
    get_score,
    sort_hotels_by_score,
    sort_hotels_by_ltr_score,
)
from llm_utils import (
    improve_user_query,
    is_valid_request,
    is_unrestricted_request,
    get_relevant_columns,
    get_openai_client,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def find_matching_hotels(query: str, hotels: dict[str, dict[str, object]]) -> list[str] | None:
    """
    Main pipeline: improves query, validates, checks restriction, extracts columns,
    builds constraints, scores, and returns top 10 hotel names.
    """
    improved_query, is_valid, is_unrestricted = await asyncio.gather(
        improve_user_query(query, hotels),
        is_valid_request(query),
        is_unrestricted_request(query)
    )

    print(improved_query, is_valid, is_unrestricted)
    if not is_valid:
        return None
    if is_unrestricted:
        return sort_hotels_by_ltr_score(hotels)[:10]

    relevant_columns = await get_relevant_columns(improved_query)
    print(relevant_columns)
    if not relevant_columns:
        return None

    client = get_openai_client()
    constraints = create_constraints(hotels, improved_query, relevant_columns, client)
    scores = get_score(constraints, hotels)
    sorted_hotel_names = sort_hotels_by_score(scores, hotels)
    return sorted_hotel_names[:10]

@app.get("/hotels")
async def get_hotels(city: str = "Mallorca", query: str = "") -> dict[str, object]:
    """
    API endpoint: returns top 10 matching hotels for a city and user query.
    """
    filepaths = {
        "New York": "../data/hotels/resultlist_New York.parquet",
        "Mallorca": "../data/hotels/resultlist_Mallorca.parquet",
        "Kopenhagen": "../data/hotels/resultlist_Kopenhagen.parquet",
    }

    if city not in filepaths:
        raise HTTPException(
            status_code=404, detail="Could not find hotel file for this city."
        )

    file = filepaths["Mallorca"]

    try:
        all_hotels = parse_hotels_from_parquet(file)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error parsing hotel file: {str(e)}"
        )

    print(all_hotels)
    top_ten_hotels = await find_matching_hotels(query, all_hotels)

    if top_ten_hotels is None:
        raise HTTPException(status_code=400, detail="Invalid request.")

    if not top_ten_hotels:  # This will handle both None and empty list cases
        raise HTTPException(status_code=404, detail="No matching hotels found.")

    hotels_with_description = {hotel: all_hotels[hotel] for hotel in top_ten_hotels}

    return hotels_with_description