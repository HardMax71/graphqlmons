from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.pokeapi import pokeapi_service
from gql import gql

router = APIRouter()

@router.get("/")
async def get_abilities(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get list of abilities"""
    try:
        query = gql("""
            query getAbilities($limit: Int!, $offset: Int!) {
                pokemon_v2_ability(limit: $limit, offset: $offset) {
                    id
                    name
                    pokemon_v2_abilityeffecttexts(where: {language_id: {_eq: 9}}) {
                        effect
                        short_effect
                    }
                }
            }
        """)
        return pokeapi_service.gql_client.execute(
            query,
            variable_values={"limit": limit, "offset": offset}
        )["pokemon_v2_ability"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ability_id}")
async def get_ability_detail(ability_id: int):
    """Get details for a specific ability"""
    try:
        response = await pokeapi_service.client.get(f"/ability/{ability_id}")
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))