"use client";
import { useState, useEffect } from "react";
import ListDetails from "../ListDetails";
import Link from "next/link";
import useWebSocket from "@/app/hooks/useWebSocket";

export default function Lists({
  params: { listId },
}: {
  params: { listId: string };
}) {
  const [lists, setLists] = useState<any>([]);
  const { message, sendMessage } = useWebSocket();

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
      <ul>
        {lists.map((list: any) => (
          <li key={list.id}>
            <Link href={`/lists/${list.id}`}>{list.name}</Link>
          </li>
        ))}
      </ul>
      <ListDetails listId={listId} />
    </div>
  );
}
