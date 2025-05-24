# STEM Project

A comprehensive educational platform integrating STEM learning, Machine Learning, and IoT capabilities, built with modern web technologies and edge computing support.

## 🌟 Features

### 🔧 STEM Module

- Visual block-based programming interface (similar to Scratch)
- Real-time code execution on edge devices (Raspberry Pi/Jetson Nano)
- Support for various sensors and components:
  - LED, 7-Segment Display
  - DHT (Temperature/Humidity)
  - Sonar, Buzzer
  - Servo Motors
  - Buttons and Switches
  - LCD Display
  - RGB LED
  - Keypad
- Automatic WiFi management and device discovery
- Secure SSH connection handling

### 🤖 Machine Learning Module

- Real-time image classification using MobileNetV2
- Custom model training with data augmentation
- Model optimization for edge devices:
  - TensorFlow Lite conversion
  - FP16 quantization (for Jetson Nano)
  - Performance monitoring and optimization
- Support for multiple model export formats:
  - SavedModel for production
  - H5 for development
  - TFLite for edge devices
- Real-time inference on edge devices:
  - 2-5 FPS on Raspberry Pi
  - 15-30 FPS on Jetson Nano

### 💬 ChatBot Module

- Integration with Google's Gemini AI
- Support for multimodal inputs (text, images, audio)
- Session management and conversation history
- Real-time response streaming
- State management using Redux

## 🛠 Technology Stack

### Frontend

- Electron + React + TypeScript
- Vite for build optimization
- React Router for navigation
- Redux for state management
- WebSocket for real-time communication
- i18next for internationalization

### Backend

- FastAPI for high-performance API
- TensorFlow/Keras for ML models
- WebSocket for real-time data streaming
- SSH/SFTP for device management
- Paramiko for SSH communications

### Edge Computing

- TensorFlow Lite for model optimization
- OpenCV for image processing
- CUDA optimization for Jetson Nano
- Custom Python libraries for hardware control

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- Python 3.8+
- TensorFlow 2.x
- Raspberry Pi or Jetson Nano
- Required Python packages:

```bash
pip install -r server/requirements.txt
```

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd Stem-Project
```

2. Install frontend dependencies:

```bash
cd client
npm install
```

3. Start the development server:

```bash
# Terminal 1 - Frontend
cd client
npm run dev

# Terminal 2 - Backend
cd server
python server.py
```

## 📁 Project Structure

```
.
├── client/                 # Frontend application
│   ├── src/
│   │   ├── ui/            # React components
│   │   ├── electron/      # Electron main process
│   │   └── configs/       # Configuration files
│   └── public/            # Static assets
├── server/                # Backend server
│   ├── ml_utils.py       # ML utilities
│   ├── ssh_manager.py    # SSH connection manager
│   ├── server.py         # Main FastAPI server
│   └── requirements.txt  # Python dependencies
└── ĐATN/                 # Documentation
```

## 📝 License

MIT

## 👥 Contributors

- Mai Trọng Nhân
