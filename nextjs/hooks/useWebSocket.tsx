"use client";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";
const RECONNECT_DELAY = 2000;

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log("Received message:", message);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    let isMounted = true;
    let newSocket: WebSocket;

    function setupWebSocket(
      setMessage: Dispatch<SetStateAction<null>>,
      userId: string
    ) {
      const socket = new WebSocket(
        `ws://localhost:8000/socket?userid=${encodeURIComponent(userId)}`
      );

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
            newSocket = setupWebSocket(setMessage, userId);
            if (isMounted) setSocket(newSocket);
          }, RECONNECT_DELAY);
        }
      };

      return socket;
    }

    if (userId) {
      newSocket = setupWebSocket(setMessage, userId);
      setSocket(newSocket);
    } else {
      throw new Error("no userid");
    }

    return () => {
      isMounted = false;
      newSocket.close();
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userId]);

  return {
    sendMessage: (message: string) => {
      socket?.send(message);
    },
    message,
  };
}

interface WebSocketContextValue {
  sendMessage?: (data: string) => void;
  message: object | null;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  message: null,
});

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { message, sendMessage } = useWebSocket();

  const value = { message, sendMessage };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}
