import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import useWebRTC from "../hooks/useWebRTC";
import VideoGrid from "../components/VideoGrid";
import Controls from "../components/Controls";
import "./Room.css";

export default function Room() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();

  const {
    localVideoRef,
    remoteStreams,
    isMuted,
    isCameraOff,
    isScreenSharing,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    leaveRoom,
    status,
    error,
  } = useWebRTC(roomId, () => navigate("/"));

  return (
    <div className="room-page">
      <h2>Room: {roomId}</h2>

      <VideoGrid localVideoRef={localVideoRef} remoteStreams={remoteStreams} />

      <Controls
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        isScreenSharing={isScreenSharing}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={toggleScreenShare}
        onLeave={leaveRoom}
      />

      <div className="status">
        <div>{status}</div>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}