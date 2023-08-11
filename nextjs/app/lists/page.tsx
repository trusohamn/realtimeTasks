"use client";
import { useState, useEffect } from "react";
import ListDetails from "./ListDetails";
import { WebSocketProvider, useWebSocketContext } from "@/hooks/useWebSocket";

function Lists() {
  const [lists, setLists] = useState<any>([]);
  const { message, sendMessage } = useWebSocketContext();

  useEffect(() => {
    // get the user lists
    const dummyLists = [{ id: 1 }, { id: 2 }];
    setLists(dummyLists);
  }, []);

  return (
    <div>
      <div>
        {lists.map((list: any) => (
          <div key={list.id} style={{ padding: 20 }}>
            <ListDetails listId={list.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

const ListsWithWebSocket = () => (
  <WebSocketProvider>
    <Lists />
  </WebSocketProvider>
);

export default ListsWithWebSocket;
