import TaskItem from "./TaskItem";
import { DataMeeting} from "@/utils/interfaces";

interface TaskListProps {
  tasks: DataMeeting[];
}

const TaskList = ({ tasks = [] }: TaskListProps) => {
  console.log("Tasks", tasks);

  return (
    <div className="task-list">
      {tasks.map((task, index) => (
        <TaskItem key={index} task={task} />
      ))}
    </div>
  );
};
export default TaskList;
