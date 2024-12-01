from typing import List, Optional
from pydantic import BaseModel

class MoveEffect(BaseModel):
    effect: str
    short_effect: Optional[str]
    language: str

class Move(BaseModel):
    id: int
    name: str
    accuracy: Optional[int]
    power: Optional[int]
    pp: Optional[int]
    priority: int
    type_name: str
    damage_class: str
    effects: List[MoveEffect]