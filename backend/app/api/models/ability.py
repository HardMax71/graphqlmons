from typing import List, Optional
from pydantic import BaseModel

class AbilityEffect(BaseModel):
    effect: str
    short_effect: Optional[str]
    language: str

class Ability(BaseModel):
    id: int
    name: str
    is_main_series: bool
    effects: List[AbilityEffect]