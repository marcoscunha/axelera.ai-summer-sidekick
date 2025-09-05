import asyncio
from datetime import datetime
import json

from application.app.application_state import app_state
from application.app.logger import logger
from application.helpers.frames import frame_to_base64
from fastapi import APIRouter
from fastapi import Query
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
                    "fps": {"value": app_state.fps.value,
                            "unit": app_state.fps.unit},
                    "plant_health_status": app_state.plant_health_status,
                    "core_temp": {"value": app_state.core_temp.value,
                                  "unit": app_state.core_temp.unit},
                    "cpu_usage":  {"value": app_state.cpu_usage.value,
                                   "unit": app_state.cpu_usage.unit},
                    "bowl_level": {
                        "label": app_state.bowl_level.label,
                        "score": round(app_state.bowl_level.score, 2),
                        "last_detection_time": app_state.bowl_level.last_detection_time.isoformat(),
                        "first_detection_time": app_state.bowl_level.first_detection_time.isoformat(),
                        "since_first_detection_seconds": (app_state.bowl_level.last_detection_time - app_state.bowl_level.first_detection_time).total_seconds()
                    },
                    "fountain_level": {
                        "label": app_state.fountain_level.label,
                        "score": round(app_state.fountain_level.score, 2),
                        "last_detection_time": app_state.fountain_level.last_detection_time.isoformat(),
                        "first_detection_time": app_state.fountain_level.first_detection_time.isoformat(),
                        "since_first_detection_seconds": (app_state.fountain_level.last_detection_time - app_state.fountain_level.first_detection_time).total_seconds()
                    },
                    "pet_activity": {
                        "active": app_state.pet_activity.active,
                        # "score": round(app_state.pet_activity.score, 2),
                        "last_active_time": app_state.pet_activity.last_active_time.isoformat(),
                        "first_active_time": app_state.pet_activity.first_active_time.isoformat(),
                        "since_first_active_seconds": (app_state.pet_activity.last_active_time - app_state.pet_activity.first_active_time).total_seconds()
                    },
                    "plant_health": {
                        "label": app_state.plant_health.label,
                        "score": round(app_state.plant_health.score, 2),
                        "last_detection_time": app_state.plant_health.last_detection_time.isoformat(),
                        "first_detection_time": app_state.plant_health.first_detection_time.isoformat(),
                        "since_first_detection_seconds": (app_state.plant_health.last_detection_time - app_state.plant_health.first_detection_time).total_seconds()
                    }
                }
            }
            await websocket.send_text(json.dumps(status_data))

            await asyncio.sleep(1)
    except WebSocketDisconnect:
        app_state.connected_clients.discard(websocket)
        logger.info("WebSocket client disconnected (going away)")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        app_state.connected_clients.discard(websocket)


@router.websocket("/camera_stream")
async def websocket_camera_stream(
    websocket: WebSocket,
    fps: int = Query(10, description="Frames per second for camera stream")
):
    await websocket.accept()
    logger.info(f"Camera WebSocket client connected: {websocket.client} (fps={fps})")
    app_state.connected_clients.add(websocket)

    frame_interval = 1.0 / max(fps, 1)

    try:
        while True:
            current_frames = getattr(app_state, "current_frames", {})
            for cam_id, frame_result in current_frames.items():
                img = getattr(frame_result, "image", None)
                if img is not None:
                    img_base64 = frame_to_base64(img)
                    if img_base64:
                        frame_data = {
                            "type": f"frame_update_cam{cam_id}",
                            "data": {
                                "image": img_base64,
                                "timestamp": datetime.now().isoformat()
                            }
                        }
                        await websocket.send_text(json.dumps(frame_data))
            await asyncio.sleep(frame_interval)
    except WebSocketDisconnect:
        app_state.connected_clients.discard(websocket)
        logger.info("Camera WebSocket client disconnected (going away)")
    except Exception as e:
        logger.error(f"Camera WebSocket error: {e}")
        app_state.connected_clients.discard(websocket)
    except Exception as e:
        logger.error(f"Camera WebSocket error: {e}")
        app_state.connected_clients.discard(websocket)
