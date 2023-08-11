import { useWebSocketContext } from "@/hooks/useWebSocket";
import { FormEvent, useEffect, useState } from "react";

export default function ListDetails({ listId }: { listId: string }) {
  const [tasks, setTasks] = useState<any>([]);
  const [newTask, setNewTask] = useState("");
  const { message, sendMessage } = useWebSocketContext();

  const handleTaskSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTask.trim() === "") return;
    const username = localStorage.getItem("username") ?? "unknown";

    const task = {
      type: "task",
      text: newTask,
      listId,
      username,
    };

    sendMessage?.(JSON.stringify(task));

    setNewTask("");
  };

  useEffect(() => {
    const dummyTasks = [
      { id: 1, name: "Buy milk" },
      { id: 2, name: "Finish report" },
    ];
    setTasks(dummyTasks);
  }, [listId]);

  return (
    <div>
      <h1>List Details</h1>
      <h2>List ID: {listId}</h2>
      <ul>
        {tasks.map((task: any) => (
          <li key={task.id}>{task.name}</li>
        ))}
      </ul>
      <form onSubmit={handleTaskSubmit}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
        />
        <button type="submit"> +</button>
      </form>
    </div>
  );
}
