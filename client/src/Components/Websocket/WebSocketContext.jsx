// WebSocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import io, { Socket } from "socket.io-client";
const WebSocketContext = createContext(null);
export const WebSocketProvider = ({ children }) => {
  const user = useSelector((state) => state.user);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    if (user.token && user.isAuthenticated && user.userInfo && !ws) {
      const socket = io(process.env.REACT_APP_API_URL, {
        auth: {
          token: "Bearer " + user.token,
        },
      });
      socket.on("connect", () => {
        console.log("Connected to server");
      });
      setWs(socket);
    }
    return () => {
      if (ws) {
        ws.disconnect();
        setWs(null);
      }
    };
  }, [user.userInfo]);

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
