from application.app.application_state import app_state
from application.models.system import SystemStatus
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_status() -> SystemStatus:
    """Get current system status"""
    return SystemStatus(
        running=app_state.system_running,
        frame_count=app_state.frame_count,
        fps=app_state.fps,
        pet_activity_level=app_state.pet_activity_level,
        bowl_fill_level=app_state.bowl_fill_level,
        fountain_water_level=app_state.fountain_water_level,
        plant_health_status=app_state.plant_health_status,
        water_solenoid_states=app_state.water_solenoid_states
    )
