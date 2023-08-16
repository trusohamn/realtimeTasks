import { useWebSocketContext } from "@/hooks/useWebSocket";
import { v4 as uuid } from "uuid";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Share } from "./Share";
import { MessageNewTask, Task, isMessageNewTask } from "../types";
import { fetchWithUserId } from "@/utils/api";
import ListOfTasks from "../components/ListOfTasks";

export default function ListDetails({ listId }: { listId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sharedWith, setSharedWith] = useState<{ username: string }[]>([]);
  const [listName, setListName] = useState<string>("");
  const [newTaskText, setNewTaskText] = useState("");
  const { message, sendMessage } = useWebSocketContext();

  const fetchListDetails = useCallback(async () => {
    const userId = localStorage.getItem("userid");
    fetchWithUserId(`/lists/${listId}`)
      .then((response) => response.json())
      .then((data) => {
        // TODO add types to response
        setTasks(data.tasks);
        setListName(data.name);
        setSharedWith(
          data.sharedWith.filter(
            (user: { userId: string }) => user.userId !== userId
          )
        );
      })
      .catch((error) => {
        console.error("Error fetching list details:", error);
      });
  }, [listId]);

  useEffect(() => {
    fetchListDetails();
  }, [fetchListDetails]);

  useEffect(() => {
    if (message) {
      if (isMessageNewTask(message)) {
        if (message.listId === listId) {
          const receivedTask = message.data.task;

          setTasks((prevTasks) => [...prevTasks, receivedTask]);
        }
      }
    }
  }, [listId, message]);

  const handleTaskSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTaskText.trim() === "") return;
    const username = localStorage.getItem("username");
    const taskId = uuid();

    if (!username) throw new Error("no username!"); // TODO handle error
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
          <Share listId={listId} onSuccessShare={fetchListDetails} />
          {Boolean(sharedWith.length) && (
            <div>
              shared with: {sharedWith.map(({ username }) => " " + username)}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <ListOfTasks tasks={tasks} />
        </CardContent>
        <CardFooter>
          <form onSubmit={handleTaskSubmit}>
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a new task..."
            />
            <Button type="submit"> +</Button>
          </form>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
