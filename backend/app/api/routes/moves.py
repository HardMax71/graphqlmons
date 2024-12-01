from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.pokeapi import pokeapi_service
from gql import gql

router = APIRouter()

@router.get("/")
async def get_moves(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get list of moves"""
    try:
        query = gql("""
            query getMoves($limit: Int!, $offset: Int!) {
                pokemon_v2_move(limit: $limit, offset: $offset) {
                    id
                    name
                    power
                    accuracy
                    pp
                    pokemon_v2_type {
                        name
                    }
                    pokemon_v2_movedamageclass {
                        name
                    }
                }
            }
        """)
        return pokeapi_service.gql_client.execute(
            query,
            variable_values={"limit": limit, "offset": offset}
        )["pokemon_v2_move"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{move_id}")
async def get_move_detail(move_id: int):
    """Get details for a specific move"""
    try:
        response = await pokeapi_service.client.get(f"/move/{move_id}")
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))