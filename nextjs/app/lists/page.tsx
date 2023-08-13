"use client";
import { useState, useEffect, FormEvent } from "react";
import ListDetails from "./ListDetails";
import { WebSocketProvider, useWebSocketContext } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MediumTitle } from "@/components/ui/text/title";

type MessageNewList = {
  type: "NEW_LIST";
  data: { list: { name: string; id: string } };
  username: string;
};

type List = {
  id: string;
};

function Lists() {
  const [lists, setLists] = useState<List[]>([]);
  const { message, sendMessage } = useWebSocketContext();
  const [newListName, setNewListName] = useState("");
  const username = localStorage?.getItem("username");

  const handleCreateList = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    newListName.trim();
    if (newListName === "") return;
    const userId = localStorage?.getItem("userid");
    if (!userId) throw new Error("no userId");

    await fetch("http://localhost:8000/api/lists", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "user-id": userId,
      },
      body: JSON.stringify({ name: newListName }),
    }).then((data) => data.json());

    setNewListName("");
  };

  useEffect(() => {
    if (message) {
      const receivedMessage = message as MessageNewList;
      if (receivedMessage.type === "NEW_LIST") {
        const receivedList = receivedMessage.data.list;

        setLists((prevLists) => [...prevLists, receivedList]);
      }
    }
  }, [message]);

  return (
    <div style={{ padding: 40 }}>
      <MediumTitle>User: {username}</MediumTitle>
      <Card>
        <form onSubmit={handleCreateList}>
          <CardContent>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Enter new list name..."
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">Create List</Button>
          </CardFooter>
        </form>
      </Card>
      <div style={{ padding: 20 }} />
      {lists.map((list: any) => (
        <div key={list.id}>
          <ListDetails listId={list.id} />
        </div>
      ))}
    </div>
  );
}

const ListsWithWebSocket = () => (
  <WebSocketProvider>
    <Lists />
  </WebSocketProvider>
);

export default ListsWithWebSocket;
