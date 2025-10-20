# 🎥 Multi-Peer WebRTC Video Calling (React + Socket.IO Client)

A scalable **React frontend** for **WebRTC video calls**, using **Socket.IO client** for signaling.  
Supports **multiple peers**, **video/audio tracks**, **screen sharing**, and **responsive UI**.

---

## ✨ Features

- Multi-peer video conferencing  
- Audio/Video toggle  
- Screen sharing  
- Responsive grid layout  
- Real-time signaling via Socket.IO  

---

## ⚙️ Tech Stack

- **React**  
- **Socket.IO Client** for signaling  
- **WebRTC API** (RTCPeerConnection, MediaStream)  
-  SS modules for responsive UI  

---

## 🚀 Setup

### 1️⃣ Clone and install
```bash
git clone https://github.com/Avneesh0404/Video-Calling-React.git
cd client
npm install
```

###2️⃣ Configure Environment
Create .env in your client directory:

```env
REACT_APP_SOCKET_URL=http://localhost:8000
```
Replace with your deployed signaling server URL in production.

###3️⃣ Start the app
```bash
npm start
```
