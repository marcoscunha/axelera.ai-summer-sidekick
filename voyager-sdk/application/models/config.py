from typing import Dict
from typing import Optional

from pydantic import BaseModel


class EvaluationTime(BaseModel):
    type: str
    from_: Optional[str] = None  # use from_ to avoid Python keyword conflict
    to: Optional[str] = None


class Trigger(BaseModel):
    label: str
    hold_label_in_seconds: int


class PetActivityConfig(BaseModel):
    evaluation_time: EvaluationTime
    trigger: Trigger


class FoodDispenserConfig(BaseModel):
    portions: int
    evaluation_time: EvaluationTime
    trigger: Trigger


class FountainConfig(BaseModel):
    dispenser_time_in_seconds: int
    evaluation_time: EvaluationTime
    trigger: Trigger


class SystemConfig(BaseModel):
    pet_activity: PetActivityConfig
    food_dispenser: FoodDispenserConfig
    fountain: FountainConfig

# Example usage:
# import json
# with open("config.json") as f:
#     config_dict = json.load(f)
# config = SystemConfig.parse_obj(config_dict)# with open("config.json") as f:
#     config_dict = json.load(f)
# config = SystemConfig.parse_obj(config_dict)
