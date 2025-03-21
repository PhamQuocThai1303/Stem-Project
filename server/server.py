# server.py
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
import asyncio
from datetime import datetime
from ssh_manager import SSHManager
import os
from pathlib import Path
import base64
import numpy as np
import cv2
from fastapi import WebSocketDisconnect
from emotion_detector import detector, EmotionDetector
import logging
import urllib.parse
import json
from websockets.server import serve
from websockets.exceptions import ConnectionClosedOK
from concurrent.futures import ThreadPoolExecutor
from ml_utils import ModelTrainer
import shutil

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SSHConnectionInfo(BaseModel):
    host: str
    username: str
    password: str
    port: int = 22

class CommandRequest(BaseModel):
    command: str

class FileUploadInfo(BaseModel):
    path: str
    content: str

class CodeUploadRequest(BaseModel):
    code: str

class WifiCredentials(BaseModel):
    ssid: str
    password: str

class ClassData(BaseModel):
    name: str
    images: List[str]

class TrainingRequest(BaseModel):
    classes: List[ClassData]
    epochs: int = 10

# Global state
ssh_managers: Dict[str, SSHManager] = {}
active_connections: Dict[str, dict] = {}

# Create data directory if not exists
data_dir = Path(__file__).parent / "data"
data_dir.mkdir(exist_ok=True)
FILE_PATH = data_dir / "data.txt"

# Initialize emotion detection
emotion_detector = EmotionDetector()

model_trainer = ModelTrainer()
# Create thread pool for processing frames
thread_pool = ThreadPoolExecutor(max_workers=2)

@app.post("/api/connect")
async def connect(connection_info: SSHConnectionInfo):
    try:
        connection_id = f"{connection_info.username}@{connection_info.host}"
        
        # Create new SSH manager
        ssh_manager = SSHManager()
        ssh_manager.connect(
            host=connection_info.host,
            username=connection_info.username,
            password=connection_info.password,
            port=connection_info.port
        )
        
        # Store connection
        ssh_managers[connection_id] = ssh_manager
        active_connections[connection_id] = {
            "host": connection_info.host,
            "username": connection_info.username,
            "connected_time": datetime.now().isoformat()
        }
        
        return {"message": "Connected successfully", "connection_id": connection_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/disconnect/{connection_id}")
async def disconnect(connection_id: str):
    if connection_id in ssh_managers:
        ssh_manager = ssh_managers[connection_id]
        ssh_manager.disconnect()
        del ssh_managers[connection_id]
        del active_connections[connection_id]
        return {"message": "Disconnected successfully"}
    raise HTTPException(status_code=404, detail="Connection not found")

# Dont use this function
@app.post("/api/execute/{connection_id}")
async def execute_command(connection_id: str, command_req: CommandRequest):
    if connection_id not in ssh_managers:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    try:
        ssh_manager = ssh_managers[connection_id]
        output, error = ssh_manager.execute_command(command_req.command)
        
        return {
            "output": output,
            "error": error,
            "command": command_req.command
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/connections")
async def get_connections():
    return list(active_connections.values())

@app.post("/api/upload/{connection_id}")
async def upload_file(connection_id: str, code_req: CodeUploadRequest):
    if connection_id not in ssh_managers:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    try:
        # Write code to local file first
        with open(FILE_PATH, "w", encoding="utf-8") as f:
            f.write(code_req.code)
        print(f"File written successfully: {FILE_PATH}")
        
        ssh_manager = ssh_managers[connection_id]
        connection_info = active_connections[connection_id]
        
        # Upload code to remote file
        remote_path = f"/home/{connection_info['username']}/Documents/code/data.txt"
        ssh_manager.upload_file(remote_path, code_req.code)
        print(f"File uploaded to Raspberry Pi: {remote_path}")
        
        # Execute the uploaded code
        command = f"cd /home/{connection_info['username']}/Documents/code && sudo python data.txt"
        output, error = ssh_manager.execute_command(command)
        print(f"Command output: {output}")
        
        if error:
            raise Exception(error)
            
        return {"message": "File đã chạy xong!", "output": output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/execute/{connection_id}/stop")
async def stop_execution(connection_id: str):
    if connection_id not in ssh_managers:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    try:
        ssh_manager = ssh_managers[connection_id]
        
        # Find Python process
        output, error = ssh_manager.execute_command('pgrep -f "python data.txt"')
        if error:
            raise Exception(error)
            
        pids = output.strip().split("\n")
        if not pids or not pids[0]:
            return {"message": "Không tìm thấy tiến trình đang chạy"}
            
        # Kill the process
        pid = pids[0]
        _, error = ssh_manager.execute_command(f"sudo kill -SIGINT {pid}")
        if error:
            raise Exception(error)
            
        return {"message": "Tiến trình đã dừng an toàn"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/{connection_id}")
async def websocket_endpoint(websocket: WebSocket, connection_id: str):
    await websocket.accept()
    
    if connection_id not in ssh_managers:
        await websocket.close(code=4000)
        return
    
    try:
        ssh_manager = ssh_managers[connection_id]
        channel = ssh_manager.create_shell()
        
        async def send_output():
            while True:
                if channel.recv_ready():
                    output = channel.recv(1024).decode()
                    await websocket.send_text(output)
                await asyncio.sleep(0.1)
        
        async def receive_input():
            while True:
                data = await websocket.receive_text()
                if channel.send_ready():
                    channel.send(data)
                await asyncio.sleep(0.1)
        
        receive_task = asyncio.create_task(receive_input())
        send_task = asyncio.create_task(send_output())
        
        await asyncio.gather(receive_task, send_task)
    except Exception as e:
        await websocket.close(code=4000)

@app.get("/api/wifi/list/{connection_id}")
async def get_wifi_list(connection_id: str):
    if connection_id not in ssh_managers:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    try:
        ssh_manager = ssh_managers[connection_id]
        output, error = ssh_manager.execute_command("nmcli -t -f ssid,signal dev wifi list")
        if error:
            raise Exception(error)
            
        networks = []
        for line in output.strip().split("\n"):
            if line:
                ssid, signal = line.split(":")
                if ssid:  # Bỏ qua kết quả trống
                    networks.append({
                        "ssid": ssid,
                        "signal": int(signal)
                    })
                    
        if not networks:
            return {
                "success": True,
                "message": "Không tìm thấy mạng Wi-Fi nào.",
                "networks": []
            }
            
        return {
            "success": True,
            "networks": networks
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Không thể quét mạng Wi-Fi: {str(e)}"
        )

@app.post("/api/wifi/connect/{connection_id}")
async def connect_wifi(connection_id: str, wifi: WifiCredentials):
    if connection_id not in ssh_managers:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    if not wifi.ssid or not wifi.password:
        raise HTTPException(
            status_code=400,
            detail="Thiếu tên mạng hoặc mật khẩu"
        )
    
    try:
        ssh_manager = ssh_managers[connection_id]
        command = f'sudo nmcli device wifi connect "{wifi.ssid}" password "{wifi.password}"'
        output, error = ssh_manager.execute_command(command)
        
        if error:
            raise Exception(error)
            
        return {
            "success": True,
            "message": f"Đã kết nối tới mạng Wi-Fi: {wifi.ssid}"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Kết nối Wi-Fi thất bại: {str(e)}"
        )

@app.post("/api/wifi/disconnect/{connection_id}")
async def disconnect_wifi(connection_id: str, wifi: WifiCredentials):
    if connection_id not in ssh_managers:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    try:
        ssh_manager = ssh_managers[connection_id]
        command = f'sudo nmcli connection delete "{wifi.ssid}"'
        output, error = ssh_manager.execute_command(command)
        
        if error:
            raise Exception(error)
            
        return {
            "success": True,
            "message": "Đã hủy kết nối Wi-Fi"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Không thể hủy kết nối Wi-Fi: {str(e)}"
        )

@app.get("/api/wifi/status/{connection_id}")
async def check_network(connection_id: str):
    if connection_id not in ssh_managers:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    try:
        ssh_manager = ssh_managers[connection_id]
        
        # Lấy tên mạng Wi-Fi (SSID)
        wifi_output, wifi_error = ssh_manager.execute_command(
            "nmcli -t -f active,ssid dev wifi | grep '^yes' | cut -d: -f2"
        )
        wifi_name = wifi_output.strip() if not wifi_error else None
        
        # Lấy địa chỉ IP từ cổng Ethernet (eth0)
        eth_output, eth_error = ssh_manager.execute_command(
            "ip -o -4 addr show eth0 | awk '{print $4}'"
        )
        eth_info = eth_output.strip() if not eth_error else None
        
        # Kiểm tra kết nối internet
        internet_output, _ = ssh_manager.execute_command("ping -c 1 google.com")
        has_internet = bool(internet_output)
        
        network_status = {
            "wifi": wifi_name,
            "ethernet": eth_info,
            "internet": has_internet
        }
        
        if not network_status["wifi"] and not network_status["ethernet"]:
            return {
                "connected": False,
                "message": "Không có mạng nào được kết nối.",
                "network": network_status
            }
            
        return {
            "connected": True,
            "message": "Đã kết nối mạng.",
            "network": network_status
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi kiểm tra kết nối mạng: {str(e)}"
        )
    
def process_frame(frame_data):
    try:
        # Decode base64 image
        encoded_data = frame_data.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise ValueError("Failed to decode image")

        # Get emotion predictions
        results = detector.detect_emotion(frame)
        
        return {
            "faces": results
        }
        
    except Exception as e:
        logger.error(f"Error processing frame: {str(e)}")
        return {"error": str(e)}

@app.websocket("/ws/api/ml/video")
async def video_stream_handler(websocket: WebSocket):
    await websocket.accept()
    processing = False
    
    try:
        while True:
            # Only receive new frame if not processing
            if not processing:
                try:
                    message = await asyncio.wait_for(websocket.receive_json(), timeout=0.1)
                except asyncio.TimeoutError:
                    continue
                
                if message.get("type") != "frame":
                    continue
                    
                frame_data = message.get("data")
                if not frame_data:
                    continue
                
                processing = True
                
                # Process frame in thread pool
                loop = asyncio.get_event_loop()
                try:
                    results = await loop.run_in_executor(thread_pool, process_frame, frame_data)
                    await websocket.send_json(results)
                except Exception as e:
                    logger.error(f"Error processing frame: {str(e)}")
                    await websocket.send_json({"error": str(e)})
                finally:
                    processing = False
            
            # Small delay to prevent CPU overload
            await asyncio.sleep(0.01)
            
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        await websocket.close()

@app.post("/api/train")
async def train_model(request: TrainingRequest):
    try:
        # Convert Pydantic models to dictionaries
        class_data = [
            {"name": cls.name, "images": cls.images}
            for cls in request.classes
        ]
        history = model_trainer.train(class_data, request.epochs)
        return {"status": "success", "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.websocket("/ws/predict")
async def predict_stream(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            image_data = await websocket.receive_text()
            predictions = model_trainer.predict(image_data)
            await websocket.send_json(predictions)
    except Exception as e:
        await websocket.close(code=1000)

@app.get("/api/export-model")
async def export_model():
    try:
        export_path = model_trainer.export_model()
        
        # Zip the exported model
        shutil.make_archive(export_path, 'zip', export_path)
        
        # Return the zip file
        return FileResponse(
            f"{export_path}.zip",
            media_type="application/zip",
            filename="model.zip"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
                
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)