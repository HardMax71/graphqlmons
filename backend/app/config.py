from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Pokemon Website"
    DEBUG: bool = True
    POKEAPI_BASE_URL: str = "https://pokeapi.co/api/v2"
    POKEAPI_GRAPHQL_URL: str = "https://beta.pokeapi.co/graphql/v1beta"
    CACHE_TTL: int = 3600  # 1 hour cache

    class Config:
        env_file = ".env"


settings = Settings()