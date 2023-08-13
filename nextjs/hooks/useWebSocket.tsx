"use client";
import { wsService } from "@/constants";
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
import { v4 as uuid } from "uuid";
const RECONNECT_DELAY = 2000;

type Handler = (message: object) => void;
export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState(null);
  const [userId, setUserId] = useState<null | string>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageEventHandlers = useRef<Map<string, Handler>>(new Map());

  const subscribe = (handler: Handler) => {
    const id = uuid();
    messageEventHandlers.current.set(id, handler);

    return () => {
      messageEventHandlers.current.delete(id);
    };
  };

  const emitMessage = (message: object) => {
    messageEventHandlers.current.forEach((handler) => handler(message));
  };

  useEffect(() => {
    const newUserId = localStorage.getItem("userid");
    setUserId(newUserId);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let newSocket: WebSocket;

    function setupWebSocket(
      setMessage: Dispatch<SetStateAction<null>>,
      userId: string
    ) {
      const socket = new WebSocket(
        `${wsService}?userid=${encodeURIComponent(userId)}`
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
        emitMessage(message);
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
    }

    return () => {
      isMounted = false;
      newSocket?.close();
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
    subscribe,
  };
}

interface WebSocketContextValue {
  sendMessage?: (data: string) => void;
  message: object | null;
  subscribe: (handler: Handler) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  message: null,
  subscribe: () => {
    return () => {};
  },
});

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { message, sendMessage, subscribe } = useWebSocket();

  const value = { message, sendMessage, subscribe };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}
