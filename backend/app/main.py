from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.config import settings
from app.api.routes import pokemon, types, moves, abilities
from starlette.requests import Request

app = FastAPI(title=settings.APP_NAME)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pokemon.router, prefix="/api/pokemon", tags=["pokemon"])
app.include_router(types.router, prefix="/api/types", tags=["types"])
app.include_router(moves.router, prefix="/api/moves", tags=["moves"])
app.include_router(abilities.router, prefix="/api/abilities", tags=["abilities"])
