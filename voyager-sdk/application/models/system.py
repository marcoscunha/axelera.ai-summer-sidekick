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


class ValueUnit(BaseModel):
    value: float
    unit: str


class SystemStatus(BaseModel):
    running: bool
    frame_count: int
    fps: ValueUnit
    core_temp: ValueUnit
    cpu_usage: ValueUnit
    pet_activity_level: float
    bowl_level: BowlLevel
    fountain_water_level: float
    plant_health_status: str
    water_solenoid_states: Dict[str, bool]
