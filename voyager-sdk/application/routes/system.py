import threading
import time

from application.app.application_state import app_state
from application.app.inference import inference_worker
from application.app.logger import logger
from fastapi import APIRouter

router = APIRouter()


@router.post("/start")
async def start_system():
    """Start the inference system"""
    if not app_state.system_running:
        app_state.stop_inference = False

        app_state.inference_thread = threading.Thread(target=inference_worker, daemon=True)
        app_state.inference_thread.start()
        # Wait until system_running is True (max 10s)
        for _ in range(100):
            if app_state.system_running:
                break
            time.sleep(0.1)
            logger.info("Waiting for system to start...")
        if app_state.system_running:
            return {"status": "started"}
        else:
            return {"status": "failed_to_start"}
    return {"status": "already_running"}


@router.post("/stop")
async def stop_system():
    """Stop the inference system"""
    if app_state.system_running:
        app_state.stop_inference = True
        # Wait until system_running is False (max 10s)
        for _ in range(100):
            if not app_state.system_running:
                break
            time.sleep(0.1)
            logger.info("Waiting for system to stop...")
        if not app_state.system_running:
            return {"status": "stopped"}
        else:
            return {"status": "failed_to_stop"}
    return {"status": "already_stopped"}
    return {"status": "already_stopped"}
