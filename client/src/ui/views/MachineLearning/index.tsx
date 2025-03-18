import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './style.css';

interface FaceData {
  x: number;
  y: number;
  width: number;
  height: number;
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
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, 640, 480);

    // Draw face boxes
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#00ff00';

    faces.forEach((face, index) => {
      // Draw rectangle
      ctx.strokeRect(face.x, face.y, face.width, face.height);
      
      // Draw label
      ctx.fillText(`Face ${index + 1}`, face.x, face.y - 5);
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
    if (!isWebcamReady) return;
    
    if (webcamRef.current && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          wsRef.current.send(JSON.stringify({
            type: 'frame',
            data: imageSrc
          }));
        }
      } catch (error) {
        console.error('Error capturing frame:', error);
      }
    }
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
                      width={640}
                      height={480}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineLearning;