"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
const RECONNECT_DELAY = 2000;

export default function WebSocketConnection() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log("Received message:", message);

  useEffect(() => {
    let isMounted = true;
    function setupWebSocket(setMessage: Dispatch<SetStateAction<null>>) {
      const socket = new WebSocket("ws://localhost:8000/socket");

      socket.onopen = () => {
        console.log("WebSocket connection opened");
        if (reconnectTimeoutRef.current !== null) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (isMounted) setMessage(message);
      };

      socket.onclose = (event) => {
        console.log("WebSocket connection closed");
        if (event.code !== 1000 && isMounted) {
          reconnectTimeoutRef.current = setTimeout(() => {
            const newSocket = setupWebSocket(setMessage);
            if (isMounted) setSocket(newSocket);
          }, RECONNECT_DELAY);
        }
      };

      return socket;
    }

    const newSocket = setupWebSocket(setMessage);
    setSocket(newSocket);

    return () => {
      isMounted = false;
      newSocket.close();
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div>
      <button
        onClick={() => {
          const timestamp = new Date().toISOString();
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket?.send(
              JSON.stringify({ type: "timestamp", value: timestamp })
            );
          } else {
            console.log("closed");
          }
        }}
      >
        WebSocket try
      </button>
    </div>
  );
}
