from datetime import datetime

from application.app.application_state import app_state
from application.helpers.frames import frame_to_base64
from fastapi import APIRouter

router = APIRouter()


@router.get("/current_frame")
async def get_current_frame():
    """Get the current frame as base64 encoded image"""
    if app_state.current_frame:
        img_base64 = frame_to_base64(app_state.current_frame)
        if img_base64:
            return {"image": img_base64, "timestamp": datetime.now()}

    return {"image": None, "timestamp": datetime.now()}
