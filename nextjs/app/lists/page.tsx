"use client";
import { useState, useEffect, FormEvent } from "react";
import ListDetails from "./ListDetails";
import { WebSocketProvider, useWebSocketContext } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MediumTitle } from "@/components/ui/text/title";
import { apiService } from "@/constants";

type MessageNewList = {
  type: "NEW_LIST";
  data: { list: { name: string; listId: string } };
  username: string;
};

type List = {
  listId: string;
};

function Lists() {
  const [lists, setLists] = useState<List[]>([]);
  const { message } = useWebSocketContext();
  const [newListName, setNewListName] = useState("");
  const [username, setUsername] = useState<null | string>(null);

  const handleCreateList = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    newListName.trim();
    if (newListName === "") return;
    const userId = localStorage?.getItem("userid");
    if (!userId) throw new Error("no userId");

    await fetch(apiService + "/lists", {
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
    const newUserName = localStorage?.getItem("username");
    setUsername(newUserName);
  }, []);

  useEffect(() => {
    if (message) {
      const receivedMessage = message as MessageNewList;
      if (receivedMessage.type === "NEW_LIST") {
        const receivedList = receivedMessage.data.list;

        const listExists = lists.some(
          (list) => list.listId === receivedList.listId
        );
        if (!listExists) setLists((prevLists) => [...prevLists, receivedList]);
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
      {lists.map((list: List) => (
        <div key={list.listId}>
          <ListDetails listId={list.listId} />
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
