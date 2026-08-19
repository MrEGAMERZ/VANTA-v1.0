"""
VANTA - Governance Intelligence Platform (Backend Entry Point)
============================================================
This file initializes the FastAPI application, sets up the SQLite/MongoDB Mock ORM connection, 
mounts all API routers, configures the WebSocket Connection Manager for real-time telemetry, 
and serves static files for the frontend deployment.
"""

import os
from dotenv import load_dotenv
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json

from database import engine, Base, SessionLocal
from seed_data import seed_db

# Import routers
from routes import auth, complaints, officials, map, resolution, escalation, projects, upload, transparency, tenders

# Initialize tables & seed data
Base.metadata.create_all(bind=engine)
seed_db()

app = FastAPI(
    title="VANTA — Governance Intelligence Platform API",
    description="Engineered in the dark. Built to last.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for hackathon simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response, JSONResponse
import time

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *;"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.rate_limits = {}
        self.limit = 100  # requests
        self.window = 60  # seconds

    async def dispatch(self, request, call_next):
        client_ip = request.client.host if request.client else "127.0.0.1"
        current_time = time.time()
        
        # Clean up old entries periodically or just for this IP
        if client_ip not in self.rate_limits:
            self.rate_limits[client_ip] = []
            
        # Filter timestamps within the current window
        self.rate_limits[client_ip] = [t for t in self.rate_limits[client_ip] if current_time - t < self.window]
        
        if len(self.rate_limits[client_ip]) >= self.limit:
            return JSONResponse(status_code=429, content={"detail": "Too Many Requests"})
            
        self.rate_limits[client_ip].append(current_time)
        return await call_next(request)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

# Mount routes
app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(officials.router)
app.include_router(map.router)
app.include_router(resolution.router)
app.include_router(escalation.router)
app.include_router(projects.router)
app.include_router(upload.router)
app.include_router(transparency.router)
app.include_router(tenders.router)

from fastapi.staticfiles import StaticFiles
uploads_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "uploads")
if not os.path.exists(uploads_path):
    os.makedirs(uploads_path, exist_ok=True)
app.mount("/public/uploads", StaticFiles(directory=uploads_path), name="uploads")

# WebSocket Connection Manager for real-time map updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # Connection might be closed
                pass

manager = ConnectionManager()

@app.websocket("/ws/map")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We just keep the connection open, listening for any messages (none expected from client)
            data = await websocket.receive_text()
            # Echo it or ignore
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Helper function to trigger real-time updates from routes
async def notify_clients(event_type: str, data: dict):
    payload = json.dumps({"event": event_type, "data": data})
    await manager.broadcast(payload)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "platform": "VANTA", "epoch": 2026}

# Inject notification helper globally into app state so routes can trigger broadcasts
app.state.notify_clients = notify_clients

# Serve frontend in production
dist_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if os.path.exists(dist_path):
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    # Mount static assets
    assets_path = os.path.join(dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    # Serve other root static files or fallback to index.html for SPA
    @app.get("/{filename:path}")
    async def serve_static_or_spa(filename: str):
        # Check if the requested file exists in dist
        file_path = os.path.join(dist_path, filename)
        if filename and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Don't hijack API or WS routes
        if filename.startswith("api") or filename.startswith("ws"):
            return {"detail": "Not Found"}
            
        # Fallback to index.html for SPA routing
        return FileResponse(os.path.join(dist_path, "index.html"))

@app.on_event("startup")
async def start_escalation_sweep():
    import asyncio
    from services.escalation import check_and_escalate_overdue_complaints
    
    async def sweep_loop():
        # Wait a bit on startup
        await asyncio.sleep(10)
        while True:
            try:
                db_session = SessionLocal()
                # Run the escalation check
                count = check_and_escalate_overdue_complaints(db_session)
                if count > 0:
                    print(f"[Escalation Sweep] Auto-escalated {count} complaints.")
                    # Broadcast the escalation event
                    await notify_clients("ESCALATION_SWEEP", {"count": count})
            except Exception as e:
                print(f"[Escalation Sweep Error] {e}")
            # Sweep every 60 seconds
            await asyncio.sleep(60)
            
    asyncio.create_task(sweep_loop())

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
