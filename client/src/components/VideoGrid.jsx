import React from "react";

export default function VideoGrid({ localVideoRef, remoteStreams = [] }) {
  return (
    <div className="videos">
      <div className="box">
        <label>Local</label>
        <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
      </div>

      {remoteStreams.length === 0 ? (
        <div className="box placeholder">No remote participants yet</div>
      ) : (
        remoteStreams.map(({ peerId, stream }) => (
          <div className="box" key={peerId}>
            <label>Remote: {peerId}</label>
            <video
              autoPlay
              playsInline
              className="remote-video"
              ref={(el) => {
                if (el) el.srcObject = stream;
              }}
            />
          </div>
        ))
      )}
    </div>
  );
}