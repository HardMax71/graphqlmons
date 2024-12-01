from typing import List
from pydantic import BaseModel

class TypeRelation(BaseModel):
    damage_factor: int
    target_type_id: int

class Type(BaseModel):
    id: int
    name: str
    damage_relations: List[TypeRelation]