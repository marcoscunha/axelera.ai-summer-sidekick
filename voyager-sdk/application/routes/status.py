from application.app.application_state import app_state
from application.models.system import BowlLevel
from application.models.system import SystemStatus
from application.models.system import ValueUnit
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_status() -> SystemStatus:
    """Get current system status"""
    return SystemStatus(
        running=app_state.system_running,
        frame_count=app_state.frame_count,
        fps=ValueUnit(**{"value": app_state.fps.value,
                         "unit": app_state.fps.unit}),
        core_temp=ValueUnit(**{"value": app_state.core_temp.value,
                               "unit": app_state.core_temp.unit}),
        cpu_usage=ValueUnit(**{"value": app_state.cpu_usage.value,
                               "unit": app_state.cpu_usage.unit}),
        pet_activity_level=app_state.pet_activity_level,
        bowl_level=BowlLevel(**{
            "label": app_state.bowl_level.label,
            "score": round(app_state.bowl_level.score, 2),
            "last_detection_time": app_state.bowl_level.last_detection_time.isoformat(),
            "first_detection_time": app_state.bowl_level.first_detection_time.isoformat(),
            "since_first_detection_seconds": (app_state.bowl_level.last_detection_time - app_state.bowl_level.first_detection_time).total_seconds()
        }),
        fountain_water_level=app_state.fountain_water_level,
        plant_health_status=app_state.plant_health_status,
        water_solenoid_states=app_state.water_solenoid_states
    )
