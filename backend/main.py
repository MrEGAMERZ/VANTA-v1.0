import os
from dotenv import load_dotenv
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

import asyncio
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List
import json

from database import engine, Base, SessionLocal
from seed_data import seed_db

from routes import auth, complaints, officials, map, resolution, escalation, projects

Base.metadata.create_all(bind=engine)
seed_db()

app = FastAPI(
    title="SAMADHAN — Governance Intelligence Platform API",
    description="Engineered in the dark. Built to last.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(officials.router)
app.include_router(map.router)
app.include_router(resolution.router)
app.include_router(escalation.router)
app.include_router(projects.router)


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
        stale: List[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                stale.append(connection)
        for ws in stale:
            self.active_connections.remove(ws)


manager = ConnectionManager()


@app.websocket("/ws/map")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def notify_clients(event_type: str, data: dict):
    payload = json.dumps({"event": event_type, "data": data})
    await manager.broadcast(payload)


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "platform": "SAMADHAN", "epoch": 2026}


app.state.notify_clients = notify_clients

_ESCALATION_RUNNING = False


@app.on_event("startup")
async def start_escalation_sweep():
    from services.escalation import check_and_escalate_overdue_complaints

    async def sweep_loop():
        global _ESCALATION_RUNNING
        await asyncio.sleep(10)
        while True:
            if not _ESCALATION_RUNNING:
                _ESCALATION_RUNNING = True
                try:
                    db_session = SessionLocal()
                    try:
                        count = check_and_escalate_overdue_complaints(db_session)
                        if count > 0:
                            await notify_clients(
                                "ESCALATION_SWEEP", {"count": count}
                            )
                    finally:
                        db_session.close()
                except Exception as e:
                    print(f"[Escalation Sweep Error] {e}")
                finally:
                    _ESCALATION_RUNNING = False
            await asyncio.sleep(60)

    asyncio.create_task(sweep_loop())


dist_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if os.path.exists(dist_path):
    assets_path = os.path.join(dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{filename:path}")
    async def serve_static_or_spa(filename: str):
        if filename.startswith("api") or filename.startswith("ws"):
            return {"detail": "Not Found"}

        file_path = os.path.join(dist_path, filename)
        if filename and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        return FileResponse(os.path.join(dist_path, "index.html"))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
