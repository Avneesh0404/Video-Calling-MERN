import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/socket";

export default function useWebRTC(roomId, onLeft = () => {}) {
  const socket = useSocket();
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const originalVideoTrackRef = useRef(null);
  const screenStreamRef = useRef(null);

  const peersRef = useRef(new Map()); // peerId -> RTCPeerConnection
  const [remoteStreams, setRemoteStreams] = useState([]); // [{ peerId, stream }]
  const [status, setStatus] = useState("Initializing...");
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const addRemoteStream = (peerId, stream) => {
    setRemoteStreams((prev) => {
      const others = prev.filter((p) => p.peerId !== peerId);
      return [...others, { peerId, stream }];
    });
  };

  const removeRemoteStream = (peerId) => {
    setRemoteStreams((prev) => prev.filter((p) => p.peerId !== peerId));
  };

  const createPeerConnection = (peerId) => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));
    }

    pc.ontrack = (evt) => {
      const stream = evt.streams?.[0] ?? evt.stream;
      addRemoteStream(peerId, stream);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate, to: peerId });
      }
    };

    pc.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
        try { pc.close(); } catch (e) {}
        peersRef.current.delete(peerId);
        removeRemoteStream(peerId);
      }
    };

    peersRef.current.set(peerId, pc);
    return pc;
  };

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks.length) return;
    const next = !isMuted;
    audioTracks.forEach((t) => (t.enabled = !next ? true : false));
    setIsMuted(next);
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const videoTracks = stream.getVideoTracks();
    if (!videoTracks.length) return;
    const next = !isCameraOff;
    videoTracks.forEach((t) => (t.enabled = !next ? true : false));
    setIsCameraOff(next);
  };

  // --- screen share handling ---
  const startScreenShare = async () => {
    if (isScreenSharing) return;
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (!screenStream) return;

      // store for later
      screenStreamRef.current = screenStream;

      // save original camera track if not saved
      if (!originalVideoTrackRef.current && localStreamRef.current) {
        originalVideoTrackRef.current = localStreamRef.current.getVideoTracks()[0];
      }

      const screenTrack = screenStream.getVideoTracks()[0];

      // replace video sender on each peer connection
      peersRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(screenTrack).catch((e) => console.warn("replaceTrack failed", e));
        }
      });

      // show screen locally
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      setIsScreenSharing(true);

      // stop screen share when user ends it from browser UI
      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error("startScreenShare failed", err);
    }
  };

  const stopScreenShare = () => {
    if (!isScreenSharing) return;

    const cameraTrack = originalVideoTrackRef.current || localStreamRef.current?.getVideoTracks()[0];

    // restore camera track on all peers
    if (cameraTrack) {
      peersRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(cameraTrack).catch((e) => console.warn("replaceTrack restore failed", e));
        }
      });
    }

    // restore local preview to camera stream
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    // stop screen stream tracks
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    setIsScreenSharing(false);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  };
  // --- end screen share ---

  const leaveRoom = () => {
    try {
      socket.emit("leave-room", { roomId });
    } catch (e) {}
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    peersRef.current.forEach((pc) => {
      try {
        pc.getSenders().forEach((s) => { if (s.track) s.track.stop(); });
        pc.close();
      } catch (e) {}
    });
    peersRef.current.clear();
    setRemoteStreams([]);
    onLeft();
  };

  useEffect(() => {
    let mounted = true;
    if (!socket) {
      setStatus("Waiting for signalling connection...");
      return;
    }

    const handleOffer = async ({ offer, from }) => {
      if (!from) return;
      const pc = createPeerConnection(from);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer, to: from });
      } catch (err) {
        console.error("handleOffer error", err);
      }
    };

    const handleAnswer = async ({ answer, from }) => {
      if (!from) return;
      const pc = peersRef.current.get(from);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error("handleAnswer error", err);
      }
    };

    const handleIce = async ({ candidate, from }) => {
      if (!from) return;
      const pc = peersRef.current.get(from);
      if (!pc) return;
      try {
        await pc.addIceCandidate(candidate);
      } catch (err) {
        console.warn("addIceCandidate failed", err);
      }
    };

    const handlePeerJoined = async ({ peerId }) => {
      if (!peerId || peerId === socket.id) return;
      const pc = createPeerConnection(peerId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer, to: peerId });
      } catch (err) {
        console.error("peer-joined error", err);
      }
    };

    const handlePeerLeft = ({ peerId }) => {
      if (!peerId) return;
      const pc = peersRef.current.get(peerId);
      if (pc) {
        try { pc.close(); } catch (e) {}
        peersRef.current.delete(peerId);
      }
      removeRemoteStream(peerId);
    };

    const start = async () => {
      setStatus("Requesting camera/microphone...");
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) return;
        localStreamRef.current = localStream;

        // save original camera track
        originalVideoTrackRef.current = localStream.getVideoTracks()[0];

        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;

        socket.on("offer", handleOffer);
        socket.on("answer", handleAnswer);
        socket.on("ice-candidate", handleIce);
        socket.on("peer-joined", handlePeerJoined);
        socket.on("peer-left", handlePeerLeft);

        socket.emit("join-room", { roomId });

        setStatus("Joined room — waiting for peers...");
      } catch (err) {
        console.error("getUserMedia error", err);
        setError("Unable to access camera/microphone. Grant permissions and reload.");
        setStatus("Failed");
      }
    };

    start();

    return () => {
      mounted = false;
      try {
        socket.off("offer", handleOffer);
        socket.off("answer", handleAnswer);
        socket.off("ice-candidate", handleIce);
        socket.off("peer-joined", handlePeerJoined);
        socket.off("peer-left", handlePeerLeft);
      } catch (e) {}

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }

      peersRef.current.forEach((pc) => {
        try {
          pc.getSenders().forEach((s) => { if (s.track) s.track.stop(); });
          pc.close();
        } catch (e) {}
      });
      peersRef.current.clear();
      setRemoteStreams([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, socket]);

  return {
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
  };
}