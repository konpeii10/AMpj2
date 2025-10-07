import React from "react";
import { Task } from "../types";
import { CATEGORY_BORDERS } from "../constants";

interface Props {
  task: Task;
  onDragStart: (e: React.DragEvent, task: Task) => void;
}

const TaskItem: React.FC<Props> = ({ task, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className={`p-3 mb-2 rounded-lg shadow cursor-grab active:cursor-grabbing text-white ${task.color} border-b-4 ${CATEGORY_BORDERS[task.category]}`}
    >
      <p className="font-bold">{task.name}</p>
      <p className="text-sm">{task.category} ({task.duration}時間)</p>
    </div>
  );
};

export default TaskItem;
