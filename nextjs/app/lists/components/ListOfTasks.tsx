import { TransitionGroup, CSSTransition } from "react-transition-group";
import { Task } from "../types";
import "../lists.css";

export default function ListOfTasks({ tasks }: { tasks: Task[] }) {
  return (
    <ul>
      <TransitionGroup
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}
      >
        {tasks.map((task: Task) => {
          return (
            <CSSTransition key={task.id} timeout={500} classNames="item">
              <li>{task.text}</li>
            </CSSTransition>
          );
        })}
      </TransitionGroup>
    </ul>
  );
}
