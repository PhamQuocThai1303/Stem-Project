import React, { useRef, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './style.css';

const MachineLearning = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const startCamera = async () => {
    try {
      setIsConnecting(true);
      console.log("Starting camera...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640,
          height: 480,
          frameRate: { ideal: 10 }
        } 
      });
      
      console.log("Camera access granted");
      setStream(stream);
      setIsCameraOn(true);
      
      const connectionId = localStorage.getItem('connection_id');
      if (!connectionId) {
        throw new Error("Không tìm thấy kết nối!");
      }
      
      const encodedConnectionId = encodeURIComponent(connectionId);
      wsRef.current = new WebSocket(`ws://localhost:3000/api/ml/video/${encodedConnectionId}`);
      
      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnecting(false);
        toast.success("Kết nối camera thành công!");
      };
      
      wsRef.current.onclose = (event) => {
        console.log("WebSocket closed with code:", event.code);
        stopCamera();
        if (event.code === 1006) {
          toast.error("Không thể kết nối đến server!");
        } else {
          toast.error("Mất kết nối với server!");
        }
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
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsCameraOn(false);
    setIsConnecting(false);
  };

  const processFrame = () => {
    if (videoRef.current && canvasRef.current && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        try {
          // Vẽ frame từ video lên canvas
          ctx.drawImage(videoRef.current, 0, 0, 640, 480);
          
          // Convert canvas thành base64 image với chất lượng 0.8
          const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
          
          // Gửi frame qua WebSocket
          wsRef.current.send(JSON.stringify({
            type: 'frame',
            data: imageData
          }));
        } catch (error) {
          console.error('Error processing frame:', error);
        }
      }
    }
  };

  const handleWSMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'prediction') {
        console.log('Received prediction:', data.result);
        // TODO: Xử lý kết quả từ server và cập nhật chart
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  // Xử lý video stream
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Xử lý frame processing
  useEffect(() => {
    let frameId: number;
    
    if (isCameraOn && videoRef.current && stream) {
      console.log("Setting up video stream...");
      
      const startFrameProcessing = () => {
        console.log("Video metadata loaded, starting frame processing");
        const animate = () => {
          processFrame();
          frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
      };

      if (videoRef.current.readyState >= 2) {
        // Video is already loaded
        startFrameProcessing();
      } else {
        // Wait for video to load
        videoRef.current.onloadeddata = startFrameProcessing;
      }
    }

    return () => {
      if (frameId) {
        console.log("Stopping frame processing");
        cancelAnimationFrame(frameId);
      }
    };
  }, [isCameraOn, stream]);

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
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="camera-feed"
                    />
                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={480}
                      style={{ display: 'none' }}
                    />
                  </>
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
              <h4>Chart</h4>
              <div className="chart-content">
                {/* Chart sẽ được thêm sau */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineLearning;