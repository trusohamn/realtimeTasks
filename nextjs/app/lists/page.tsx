"use client";
import { useState, useEffect } from "react";
import ListDetails from "./ListDetails";
import { WebSocketProvider, useWebSocketContext } from "@/hooks/useWebSocket";

function Lists() {
  const [lists, setLists] = useState<any>([]);
  const { message, sendMessage } = useWebSocketContext();

  useEffect(() => {
    // get the user lists
    const dummyLists = [
      { id: 1, name: "Groceries" },
      { id: 2, name: "Work Tasks" },
    ];
    setLists(dummyLists);
  }, []);

  return (
    <div>
      <h1>Your Lists</h1>
      <div>
        {lists.map((list: any) => (
          <div key={list.id} style={{ padding: 20 }}>
            {list.name}
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
