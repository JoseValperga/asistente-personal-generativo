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
      <div>{`Participantes: ${task.who.join(", ")}`}</div>
      <div>{`Cuándo: ${task.when}`}</div>
      <div>{`Desde: ${task.since}`}</div>
      <div>{`Hasta: ${task.until}`}</div>
      <div>{`Acerca de: ${task.about.join(", ")}`}</div>
      <div>{`Duración: ${task.duration}`}</div>
    </div>
  );
};

export default TaskItem;

/*
<div>{task.message ? `Mensaje: ${task.message}` : ""}</div>
      <div>{task.what ? `Qué: ${task.what.join(", ")}` : ""}</div>
      */
