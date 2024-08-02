import { ServerMessage } from "@/app/actions";
import { DataMeeting, Task } from "@/utils/interfaces";
import { getMutableAIState } from "ai/rsc";

interface TaskItemProps {
  task: DataMeeting;
  history: ReturnType<typeof getMutableAIState>;
}

const TaskItem = ({ task, history }: TaskItemProps) => {
  /*history.done((messages: ServerMessage[]) => [
    ...messages,
    {
      role: "assistant",
      content: `Showing information`,
    },
  ]);*/
  return (
    <div className="task-item">
      <div>--------------------</div>
      <div>{task.message ? `Mensaje: ${task.message}` : ""}</div>
      <div>{task.what ? `Qué: ${task.what.join(", ")}` : ""}</div>
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

