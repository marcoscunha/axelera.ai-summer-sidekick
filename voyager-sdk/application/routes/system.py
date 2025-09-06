import threading
import time

from application.app.application_state import app_state
from application.app.automatic_food_dispenser import automatic_food_dispenser_worker
from application.app.inference import inference_worker
from application.app.logger import logger
from fastapi import APIRouter

router = APIRouter()


@router.post("/start")
async def start_system():
    """Start the inference system"""
    if not app_state.system_running:
        app_state.stop_inference = False

        if app_state.inference_thread is None or not app_state.inference_thread.is_alive():
            logger.info("\033[92mStarting inference thread...\033[0m")
            app_state.inference_thread = threading.Thread(target=inference_worker, daemon=True)
            app_state.inference_thread.start()
        else:
            logger.info("\033[93mInference thread already running.\033[0m")

        if app_state.automatic_food_dispenser_thread is None or not app_state.automatic_food_dispenser_thread.is_alive():
            logger.info("\033[92mStarting automatic food dispenser thread...\033[0m")
            app_state.automatic_food_dispenser_thread = threading.Thread(
                target=automatic_food_dispenser_worker, daemon=True)
            app_state.automatic_food_dispenser_thread.start()
        else:
            logger.info("\033[93mAutomatic food dispenser thread already running.\033[0m")

        # Wait until system_running is True (max 10s)
        for _ in range(20):
            if app_state.system_running:
                break
            time.sleep(1)
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
