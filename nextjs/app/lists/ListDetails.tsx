import { useWebSocketContext } from "@/hooks/useWebSocket";
import { v4 as uuid } from "uuid";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Share } from "./Share";
import { MessageNewTask, Task } from "./types";
import { apiService } from "@/constants";

export default function ListDetails({ listId }: { listId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [listName, setListName] = useState<string>("");
  const [newTaskText, setNewTaskText] = useState("");
  const { message, sendMessage } = useWebSocketContext();

  useEffect(() => {
    fetch(`${apiService}/lists/${listId}`)
      .then((response) => response.json())
      .then((data) => {
        setTasks(data.tasks);
        setListName(data.name);
      })
      .catch((error) => {
        console.error("Error fetching list details:", error);
      });
  }, [listId]);

  useEffect(() => {
    if (message) {
      const receivedMessage = message as MessageNewTask;
      if (
        receivedMessage.type === "NEW_TASK" &&
        receivedMessage.listId === listId
      ) {
        const receivedTask = receivedMessage.data.task;

        setTasks((prevTasks) => [...prevTasks, receivedTask]);
      }
    }
  }, [listId, message]);

  const handleTaskSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTaskText.trim() === "") return;
    const username = localStorage.getItem("username") ?? "unknown";
    const taskId = uuid();

    const message: MessageNewTask = {
      type: "NEW_TASK",
      data: {
        task: { id: taskId, text: newTaskText },
      },
      listId,
      username,
    };

    sendMessage?.(JSON.stringify(message));

    setNewTaskText("");
  };

  return (
    <Card>
      <CardContent>
        <CardHeader>
          <CardTitle>{listName}</CardTitle>
          <CardDescription>List ID: {listId}</CardDescription>
          <Share listId={listId} />
        </CardHeader>
        <ul>
          {tasks.map((task: Task) => (
            <li key={task.id}>{task.text}</li>
          ))}
        </ul>
        <form onSubmit={handleTaskSubmit}>
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
          />
          <Button type="submit"> +</Button>
        </form>
      </CardContent>
    </Card>
  );
}
