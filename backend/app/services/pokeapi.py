from typing import Dict, List

import httpx
from app.config import settings
from app.services.cache import cache_service
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport


class PokeAPIService:
    def __init__(self):
        self.base_url = settings.POKEAPI_BASE_URL
        self.client = httpx.AsyncClient(base_url=self.base_url)

        # GraphQL client
        transport = RequestsHTTPTransport(url=settings.POKEAPI_GRAPHQL_URL)
        self.gql_client = Client(transport=transport, fetch_schema_from_transport=True)

    async def get_pokemon_list(self, limit: int = 20, offset: int = 0) -> Dict:
        cache_key = f"pokemon_list_{limit}_{offset}"
        cached_data = cache_service.get(cache_key)
        if cached_data:
            return cached_data

        response = await self.client.get(f"/pokemon?limit={limit}&offset={offset}")
        data = response.json()
        cache_service.set(cache_key, data, settings.CACHE_TTL)
        return data

    async def get_pokemon_detail(self, pokemon_id: int) -> Dict:
        response = await self.client.get(f"/pokemon/{pokemon_id}")
        return response.json()

    def get_pokemon_with_details(self, limit: int = 20) -> List[Dict]:
        query = gql("""
            query getPokemonDetails($limit: Int!) {
                pokemon_v2_pokemon(limit: $limit) {
                    id
                    name
                    height
                    weight
                    pokemon_v2_pokemontypes {
                        pokemon_v2_type {
                            name
                        }
                    }
                    pokemon_v2_pokemonstats {
                        base_stat
                        pokemon_v2_stat {
                            name
                        }
                    }
                }
            }
        """)

        result = self.gql_client.execute(query, variable_values={"limit": limit})
        return result["pokemon_v2_pokemon"]

    async def close(self):
        await self.client.aclose()


# Create a singleton instance
pokeapi_service = PokeAPIService()
