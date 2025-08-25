from application.routes.detections import router as DetectionsRoutes
from application.routes.root import router as RootRoutes
from application.routes.status import router as StatusRoutes
from application.routes.stream import router as StreamRoutes
from application.routes.system import router as SystemRoutes
from application.routes.websocket import router as WebSocketRoutes
from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# FastAPI app
app = FastAPI(title="Pet Monitoring System", version="1.0.0")

# Import routes
app.include_router(DetectionsRoutes, tags=["Detections"], prefix="/api/detections")
# app.include_router(RootRoutes, tags=["Root"], prefix="/")
app.include_router(StatusRoutes, tags=["Status"], prefix="/api/status")
app.include_router(SystemRoutes, tags=["System"], prefix="/api/system")
app.include_router(StreamRoutes, tags=["Stream"], prefix="/api/stream")
app.include_router(WebSocketRoutes, tags=["WebSocket"], prefix="/ws")

# Mount static files and templates
app.mount("/static", StaticFiles(directory="application/static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Serve the main web interface"""
    return templates.TemplateResponse("index.html", {"request": request})

if __name__ == "__main__":
    pass
