"use client";
import { useState, useEffect, FormEvent } from "react";
import ListDetails from "./ListDetails";
import { WebSocketProvider, useWebSocketContext } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MediumTitle } from "@/components/ui/text/title";
import { apiService } from "@/constants";
import { List, MessageNewList } from "./types";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

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
    const userId = localStorage?.getItem("userid");
    if (!userId) redirect("/login");
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
  }, [message, lists]);

  return (
    <div className="w-full max-w-md py-20">
      <MediumTitle>User: {username}</MediumTitle>
      <div style={{ padding: 20 }} />
      <Card style={{ backgroundColor: "lightgrey" }}>
        <CardContent>
          <form onSubmit={handleCreateList}>
            <CardHeader>
              <CardTitle>Create new list</CardTitle>
            </CardHeader>

            <CardFooter>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter new list name..."
              />
              <Button type="submit">Create List</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      <div style={{ padding: 50 }} />
      {lists.map((list: List) => (
        <div key={list.listId} style={{ padding: 10 }}>
          <ListDetails listId={list.listId} />
        </div>
      ))}
      <Toaster />
    </div>
  );
}

const ListsWithWebSocket = () => (
  <WebSocketProvider>
    <Lists />
  </WebSocketProvider>
);

export default ListsWithWebSocket;
