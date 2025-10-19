import React from "react";

const MicIcon = ({ muted }) => (
  muted ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M19 11a7 7 0 0 1-12.9 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 3v6a3 3 0 0 0 6 0V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 3l14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 1v11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 11a7 7 0 0 1-14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 21v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
);

const CameraIcon = ({ off }) => (
  off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 7h3l2-2h6l2 2h3v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 7l-6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 7h3l2-2h6l2 2h3v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 7l-6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
);

const ScreenIcon = ({ active }) => (
  active ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
    </svg>
  )
);

const HangupIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12 1.05.37 2.07.73 3.03a2 2 0 0 1-.45 2.11L8.09 10.91" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 1L1 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.0"/>
  </svg>
);

export default function Controls({ isMuted, isCameraOff, isScreenSharing, onToggleMute, onToggleCamera, onToggleScreenShare, onLeave }) {
  return (
    <div className="controls" role="toolbar" aria-label="Call controls">
      <button
        className={`btn-control ${isMuted ? "danger" : "primary"}`}
        onClick={onToggleMute}
        aria-pressed={isMuted}
        aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        title={isMuted ? "Unmute" : "Mute"}
      >
        <span className="icon"><MicIcon muted={isMuted} /></span>
        <span className="label">{isMuted ? "Unmute" : "Mute"}</span>
      </button>

      <button
        className={`btn-control ${isCameraOff ? "danger" : "primary"}`}
        onClick={onToggleCamera}
        aria-pressed={isCameraOff}
        aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
        title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
      >
        <span className="icon"><CameraIcon off={isCameraOff} /></span>
        <span className="label">{isCameraOff ? "Camera On" : "Camera Off"}</span>
      </button>

      <button
        className={`btn-control ${isScreenSharing ? "danger" : "primary"}`}
        onClick={onToggleScreenShare}
        aria-pressed={isScreenSharing}
        aria-label={isScreenSharing ? "Stop screen share" : "Start screen share"}
        title={isScreenSharing ? "Stop screen share" : "Start screen share"}
      >
        <span className="icon"><ScreenIcon active={isScreenSharing} /></span>
        <span className="label">{isScreenSharing ? "Stop Share" : "Share Screen"}</span>
      </button>

      <button
        className="btn-control hangup"
        onClick={onLeave}
        aria-label="Leave call"
        title="Leave"
      >
        <span className="icon"><HangupIcon /></span>
        <span className="label">Hang up</span>
      </button>
    </div>
  );
}