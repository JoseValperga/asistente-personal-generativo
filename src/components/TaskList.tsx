import TaskItem from "./TaskItem";
import { DataMeeting } from "@/utils/interfaces";
import { getMutableAIState } from "ai/rsc";
import { ServerMessage } from "@/app/actions";
interface TaskListProps {
  tasks: DataMeeting[];
  history: ReturnType<typeof getMutableAIState>;
  //messages: ServerMessage[];
}

const TaskList = ({ tasks = [], history }: TaskListProps) => {
  // Puedes usar history aquí según lo necesites
  /*history.done((messages: ServerMessage[]) => [
    ...messages,
    {
      role: "assistant",
      content: `Showing information`,
    },
  ]);*/
  return (
    <div>
      {tasks.map((task, index) => (
        <TaskItem key={index} task={task} history={history} />
      ))}
    </div>
  );
};

export default TaskList;
