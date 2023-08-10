import { useEffect, useState } from "react";

export default function ListDetails({ listId }: { listId: string }) {
  const [tasks, setTasks] = useState<any>([]);

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
    </div>
  );
}
