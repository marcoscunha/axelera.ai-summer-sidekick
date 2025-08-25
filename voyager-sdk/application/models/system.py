from typing import Dict

from pydantic import BaseModel


class SystemStatus(BaseModel):
    running: bool
    frame_count: int
    fps: float
    pet_activity_level: float
    bowl_fill_level: float
    fountain_water_level: float
    plant_health_status: str
    water_solenoid_states: Dict[str, bool]
    water_solenoid_states: Dict[str, bool]
    water_solenoid_states: Dict[str, bool]
