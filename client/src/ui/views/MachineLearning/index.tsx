import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './style.css';

interface FaceData {
  bbox: [number, number, number, number];
  emotion: {
    label: string;
    confidence: number;
    color: [number, number, number];
  };
}

const MachineLearning = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [faces, setFaces] = useState<FaceData[]>([]);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const animationFrameId = useRef<number>();

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
    frameRate: { ideal: 30 }
  };

  const drawFaceBoxes = useCallback(() => {
    if (!canvasRef.current || !webcamRef.current?.video) return;

    const canvas = canvasRef.current;
    const video = webcamRef.current.video;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw face boxes and emotions
    faces.forEach(face => {
      const [x, y, x2, y2] = face.bbox;
      const width = x2 - x;
      const height = y2 - y;
      const [r, g, b] = face.emotion.color;

      // Draw rectangle with emotion color
      ctx.strokeStyle = `rgb(${r},${g},${b})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw emotion label with confidence
      ctx.font = '16px Arial';
      const text = `${face.emotion.label} (${(face.emotion.confidence * 100).toFixed(1)}%)`;
      const textWidth = ctx.measureText(text).width;
      
      // Draw background for text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(x, y - 25, textWidth + 10, 20);
      
      // Draw text
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillText(text, x + 5, y - 10);
    });

    // Request next frame
    animationFrameId.current = requestAnimationFrame(drawFaceBoxes);
  }, [faces]);

  const startCamera = async () => {
    try {
      setIsConnecting(true);
      console.log("Starting camera...");
      
      wsRef.current = new WebSocket('ws://localhost:3000/ws/api/ml/video');
      
      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnecting(false);
        setIsCameraOn(true);
        toast.success("Kết nối camera thành công!");
      };
      
      wsRef.current.onclose = () => {
        console.log("WebSocket closed");
        stopCamera();
        toast.error("Mất kết nối với server!");
      };
      
      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("Lỗi kết nối WebSocket!");
        stopCamera();
      };
      
      wsRef.current.onmessage = handleWSMessage;
      
    } catch (error) {
      console.error('Error starting camera:', error);
      toast.error(error instanceof Error ? error.message : "Không thể truy cập camera!");
      setIsConnecting(false);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsCameraOn(false);
    setIsConnecting(false);
    setFaces([]);
    setIsWebcamReady(false);
  };

  const captureFrame = useCallback(() => {
    if (!webcamRef.current || !isWebcamReady || !wsRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    wsRef.current.send(JSON.stringify({
      type: "frame",
      data: imageSrc
    }));
  }, [isWebcamReady]);

  const handleWSMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      // Check for error
      if (data.error) {
        console.error('Server error:', data.error);
        return;
      }
      
      // Update faces data
      if (data.faces) {
        setFaces(data.faces);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  // Start animation when camera is ready
  useEffect(() => {
    if (isCameraOn && isWebcamReady) {
      animationFrameId.current = requestAnimationFrame(drawFaceBoxes);
    }
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isCameraOn, isWebcamReady, drawFaceBoxes]);

  // Handle frame processing
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isCameraOn && isWebcamReady) {
      console.log("Setting up video stream...");
      intervalId = setInterval(captureFrame, 33); // ~30fps
    }

    return () => {
      if (intervalId) {
        console.log("Stopping frame processing");
        clearInterval(intervalId);
      }
    };
  }, [isCameraOn, isWebcamReady, captureFrame]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className='ml-app'>
      <div className='ml-container'>
        <div className="ml-wrapper">
          {/* Left side */}
          <div className="ml-left-panel">
            <div className="camera-section">
              <h4>Camera</h4>
              <div className="camera-content">
                {isCameraOn ? (
                  <div className="camera-container">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      mirrored={true}
                      onUserMedia={() => {
                        console.log("Webcam ready");
                        setIsWebcamReady(true);
                      }}
                      className="camera-feed"
                    />
                    <canvas
                      ref={canvasRef}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                ) : (
                  <div className="camera-off">
                    <p>{isConnecting ? "Đang kết nối camera..." : "Camera đang tắt"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="ml-right-panel">
            <div className="settings-section">
              <h4>Setting</h4>
              <div className="settings-content">
                <Button 
                  variant={isCameraOn ? "danger" : "success"}
                  onClick={() => isCameraOn ? stopCamera() : startCamera()}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Đang kết nối..." : isCameraOn ? "Tắt Camera" : "Bật Camera"}
                </Button>
              </div>
            </div>

            <div className="chart-section">
              <h4>Face Detection</h4>
              <div className="chart-content">
                <p>Đã phát hiện: {faces.length} khuôn mặt</p>
                {faces.map((face, idx) => {
                  const [r, g, b] = face.emotion.color;
                  return (
                    <div key={idx} className="emotion-result" style={{
                      borderLeft: `4px solid rgb(${r},${g},${b})`,
                      padding: '8px',
                      margin: '8px 0',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }}>
                      <span className="emotion-label">Face {idx + 1}:</span>
                      <span className="emotion-confidence" style={{color: `rgb(${r},${g},${b})`}}>
                        {face.emotion.label} ({(face.emotion.confidence * 100).toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineLearning;