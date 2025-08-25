
from application.app.application_state import app_state
from fastapi import APIRouter

router = APIRouter()


@router.get("/recent")
async def get_recent_detections():
    """Get recent detection results"""
    return {"detections": app_state.detections_history[-10:]}  # Last 10 detections
