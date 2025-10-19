import React, { createContext, useContext, useMemo, useEffect } from "react";
import { io } from "socket.io-client";
export const socketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(socketContext);
  return socket;
};
const url = process.env.REACT_APP_SOCKET_URL
export const SocketProvider = (props) => {
  // ensure protocol + proper URL and add any options you need
  const socket = useMemo(
    () =>
      io(url, {
        transports: ["websocket"],
        autoConnect: true,
      }),
    []
  );

  // clean up on unmount to avoid dangling connections
  useEffect(() => {
    return () => {
      if (socket && socket.connected) socket.disconnect();
    };
  }, [socket]);

  return (
    <socketContext.Provider value={socket}>
      {props.children}
    </socketContext.Provider>
  );
};

