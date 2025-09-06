import json

from application.models.config import SystemConfig
from application.routes.detections import router as DetectionsRoutes
from application.routes.root import router as RootRoutes
from application.routes.status import router as StatusRoutes
from application.routes.stream import router as StreamRoutes
from application.routes.system import router as SystemRoutes
from application.routes.websocket import router as WebSocketRoutes
from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# FastAPI app
app = FastAPI(title="Summer Sidekick - Axelera AI", version="1.0.0")

# Load configuration at boot time
with open("application/config.json") as f:
    config_dict = json.load(f)
app.state.config = SystemConfig.parse_obj(config_dict)

# Import routes
app.include_router(DetectionsRoutes, tags=["Detections"], prefix="/api/detections")
# app.include_router(RootRoutes, tags=["Root"], prefix="/")
app.include_router(StatusRoutes, tags=["Status"], prefix="/api/status")
app.include_router(SystemRoutes, tags=["System"], prefix="/api/system")
app.include_router(StreamRoutes, tags=["Stream"], prefix="/api/stream")
app.include_router(WebSocketRoutes, tags=["WebSocket"], prefix="/ws")

# Mount static files and templates
app.mount("/static", StaticFiles(directory="application/static"), name="static")
app.mount("/assets", StaticFiles(directory="application/static/assets"), name="assets")
# If vite.svg is in static, it will be served at /static/vite.svg
templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_class=FileResponse)
async def root():
    """Serve the static site index.html"""
    return FileResponse("application/static/index.html")

if __name__ == "__main__":
    pass
    pass
    pass
