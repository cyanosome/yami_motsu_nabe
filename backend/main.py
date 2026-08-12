import os
import json
import logging
from typing import Dict, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as redis

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("yami-motsu-backend")

app = FastAPI(title="闇もつ鍋 Backend API")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

# Redis非同期クライアントの初期化
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

# ルームWebSocket管理マネージャー
class RoomConnectionManager:
    def __init__(self):
        # room_id -> Dict[player_name, WebSocket]
        self.active_rooms: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, room_id: str, player_name: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = {}
        self.active_rooms[room_id][player_name] = websocket

        # Redisにルーム参加状態を記録 (オプション)
        try:
            await redis_client.sadd(f"room:{room_id}:players", player_name)
        except Exception as e:
            logger.warning(f"Redis sadd failed: {e}")

    def disconnect(self, room_id: str, player_name: str):
        if room_id in self.active_rooms and player_name in self.active_rooms[room_id]:
            del self.active_rooms[room_id][player_name]
            if not self.active_rooms[room_id]:
                del self.active_rooms[room_id]

    async def broadcast(self, room_id: str, message: dict):
        if room_id in self.active_rooms:
            payload = json.dumps(message, ensure_ascii=False)
            for ws in list(self.active_rooms[room_id].values()):
                try:
                    await ws.send_text(payload)
                except Exception as e:
                    logger.error(f"Error sending message: {e}")

manager = RoomConnectionManager()

@app.get("/")
async def root():
    return {"status": "ok", "app": "闇もつ鍋 Backend API"}

@app.get("/health")
async def health_check():
    redis_ok = False
    try:
        redis_ok = await redis_client.ping()
    except Exception as e:
        logger.warning(f"Redis ping failed: {e}")
    return {
        "status": "healthy",
        "redis_connected": redis_ok
    }

@app.websocket("/ws/room/{room_id}/{player_name}")
async def websocket_room_endpoint(websocket: WebSocket, room_id: str, player_name: str):
    await manager.connect(room_id, player_name, websocket)
    
    # 参加完了イベントの放送
    await manager.broadcast(room_id, {
        "type": "PLAYER_JOINED",
        "player_name": player_name,
        "room_id": room_id,
        "active_players": list(manager.active_rooms.get(room_id, {}).keys()),
        "message": f"【通知】{player_name} がルーム [{room_id}] に参加しました"
    })

    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                data = json.loads(data_text)
            except Exception:
                data = {"type": "RAW_MSG", "content": data_text}

            # 受信したアクションを同じルーム全員にエコー/ブロードキャスト
            await manager.broadcast(room_id, {
                "type": "ROOM_EVENT",
                "sender": player_name,
                "data": data,
                "message": f"{player_name}: {data.get('content', data_text)}"
            })

    except WebSocketDisconnect:
        manager.disconnect(room_id, player_name)
        await manager.broadcast(room_id, {
            "type": "PLAYER_LEFT",
            "player_name": player_name,
            "room_id": room_id,
            "message": f"【通知】{player_name} が切断しました"
        })
