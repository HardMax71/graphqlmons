from app.services.pokeapi import pokeapi_service
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()


@router.get("/")
async def get_pokemon_list(
        limit: int = Query(20, ge=1, le=100),
        offset: int = Query(0, ge=0)
):
    try:
        return await pokeapi_service.get_pokemon_list(limit, offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/detailed")
async def get_detailed_pokemon(limit: int = Query(20, ge=1, le=200)):
    try:
        return pokeapi_service.get_pokemon_with_details(limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{pokemon_id}")
async def get_pokemon(pokemon_id: int):
    try:
        return await pokeapi_service.get_pokemon_detail(pokemon_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
