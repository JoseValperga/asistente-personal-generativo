import TaskItem from "./TaskItem";
import { DataMeeting } from "@/utils/interfaces";
import { getMutableAIState } from "ai/rsc";
import { ServerMessage } from "@/app/actions";
interface TaskListProps {
  tasks: DataMeeting[];
}

const TaskList = ({ tasks = []}: TaskListProps) => {
 
  return (
    <div>
      {tasks.map((task, index) => (
        <TaskItem key={index} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
