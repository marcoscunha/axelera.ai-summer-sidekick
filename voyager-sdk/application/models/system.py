from datetime import datetime
from typing import Dict
from typing import Optional

from pydantic import BaseModel


class BowlLevel(BaseModel):
    label: str = "undefined"
    score: float = 0.0
    last_detection_time: datetime = None
    first_detection_time: datetime = None
    since_first_detection_seconds: float = 0.0


class FountainLevel(BaseModel):
    label: str = "undefined"
    score: float = 0.0
    last_detection_time: datetime = None
    first_detection_time: datetime = None
    since_first_detection_seconds: float = 0.0


class PetActivity(BaseModel):
    active: bool = False
    score: float = 0.0
    last_active_time: Optional[datetime] = None
    first_active_time: Optional[datetime] = None
    since_first_active_seconds: float = 0.0


class ValueUnit(BaseModel):
    value: float
    unit: str


class SystemStatus(BaseModel):
    running: bool
    frame_count: int
    fps: ValueUnit
    core_temp: ValueUnit
    cpu_usage: ValueUnit
    pet_activity: PetActivity
    bowl_level: BowlLevel
    fountain_level: FountainLevel
    plant_health_status: str
