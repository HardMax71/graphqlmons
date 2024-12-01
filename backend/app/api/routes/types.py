from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.pokeapi import pokeapi_service
from gql import gql

router = APIRouter()

@router.get("/")
async def get_types():
    """Get all Pokemon types"""
    try:
        query = gql("""
            query getTypes {
                pokemon_v2_type {
                    id
                    name
                    pokemon_v2_typeefficacies {
                        damage_factor
                        target_type_id
                    }
                }
            }
        """)
        return pokeapi_service.gql_client.execute(query)["pokemon_v2_type"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{type_id}")
async def get_type_detail(type_id: int):
    """Get details for a specific type"""
    try:
        response = await pokeapi_service.client.get(f"/type/{type_id}")
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))