import threading

from application.app.application_state import app_state
from application.app.inference import inference_worker
from fastapi import APIRouter

router = APIRouter()


@router.post("/start")
async def start_system():
    """Start the inference system"""
    if not app_state.system_running:
        app_state.stop_inference = False
        app_state.inference_thread = threading.Thread(target=inference_worker, daemon=True)
        app_state.inference_thread.start()
        return {"status": "started"}
    return {"status": "already_running"}


@router.post("/stop")
async def stop_system():
    """Stop the inference system"""
    if app_state.system_running:
        app_state.stop_inference = True
        if app_state.stream:
            app_state.stream.stop()
        return {"status": "stopped"}
    return {"status": "already_stopped"}
