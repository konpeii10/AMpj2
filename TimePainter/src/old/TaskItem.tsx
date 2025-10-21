import React from "react";
import { CATEGORY_COLORS } from "../App";
import { Task } from "../App";

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onEdit,
  onDelete,
  onDragStart,
}) => {
  return (
    <div
      className={`flex justify-between items-center p-2 rounded-lg text-white cursor-grab ${CATEGORY_COLORS[task.category]}`}
      draggable
      onDragStart={onDragStart}
    >
      <div>
        <div className="font-semibold">{task.name}</div>
        <div className="text-sm">{task.category}・{task.duration}分</div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={onEdit}
          className="bg-white text-black text-xs px-2 py-1 rounded"
        >
          編集
        </button>
        <button
          onClick={onDelete}
          className="bg-white text-red-600 text-xs px-2 py-1 rounded"
        >
          削除
        </button>
      </div>
    </div>
  );
};
