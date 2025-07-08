import { ServerMessage } from "@/app/actions";
import { DataMeeting, Task } from "@/utils/interfaces";
import { getMutableAIState } from "ai/rsc";

interface TaskItemProps {
  task: DataMeeting;
}

const TaskItem = ({ task }: TaskItemProps) => {
  return (
    <div className="border border-black rounded-xl m-3 p-2">
      <div>{task.message ? `${task.message}` : ""}</div>
      <div>{task.who ? `Con quien: ${task.who}` : ""}</div>
      <div>{task.when ? `Cuándo: ${task.when}` : ""}</div>
      <div>{task.since ? `Desde: ${task.since}` : ""}</div>
      <div>{task.until ? `Hasta: ${task.until}` : ""}</div>
      <div>{task.about ? `Acerca de: ${task.about}` : ""}</div>
      <div>{task.duration ? `Duración: ${task.duration}` : ""}</div>
    </div>
  );
};

export default TaskItem;


