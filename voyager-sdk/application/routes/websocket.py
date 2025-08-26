import asyncio
from datetime import datetime
import json

from application.app.application_state import app_state
from application.app.logger import logger
from application.helpers.frames import frame_to_base64
from fastapi import APIRouter
from fastapi import WebSocket
from fastapi import WebSocketDisconnect

router = APIRouter()


@router.websocket("/status")
async def websocket_status(websocket: WebSocket):
    await websocket.accept()
    logger.info(f"WebSocket client connected: {websocket.client}")
    app_state.connected_clients.add(websocket)

    try:
        while True:
            # Send status update
            status_data = {
                "type": "status_update",
                "data": {
                    "running": app_state.system_running,
                    "frame_count": app_state.frame_count,
                    "fps": round(app_state.fps, 2),
                    "pet_activity_level": round(app_state.pet_activity_level, 2),
                    "bowl_fill_level": round(app_state.bowl_fill_level, 2),
                    "fountain_water_level": round(app_state.fountain_water_level, 2),
                    "plant_health_status": app_state.plant_health_status,
                    # "water_solenoid_states": app_state.water_solenoid_states
                }
            }
            await websocket.send_text(json.dumps(status_data))

            # Send frame update if available
            if app_state.current_frame:
                img_base64 = frame_to_base64(app_state.current_frame)
                if img_base64:
                    frame_data = {
                        "type": "frame_update",
                        "data": {
                            "image": img_base64,
                            "timestamp": datetime.now().isoformat()
                        }
                    }
                    await websocket.send_text(json.dumps(frame_data))

            await asyncio.sleep(1)
    except WebSocketDisconnect:
        app_state.connected_clients.discard(websocket)
        logger.info("WebSocket client disconnected (going away)")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        app_state.connected_clients.discard(websocket)
