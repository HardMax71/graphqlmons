from typing import List, Optional
from pydantic import BaseModel

class PokemonType(BaseModel):
    id: int
    name: str

class PokemonAbility(BaseModel):
    id: int
    name: str
    is_hidden: bool

class PokemonStat(BaseModel):
    name: str
    base_stat: int
    effort: int

class PokemonMove(BaseModel):
    name: str
    level_learned_at: int
    move_learn_method: str

class Pokemon(BaseModel):
    id: int
    name: str
    height: int
    weight: int
    base_experience: int
    types: List[PokemonType]
    abilities: List[PokemonAbility]
    stats: List[PokemonStat]
    moves: List[PokemonMove]