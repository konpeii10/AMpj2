import React from "react";
import { CATEGORY_COLORS } from "../App";
import { ScheduledTask } from "../App";

interface TimeSlotProps {
  hour: string;
  onDrop: () => void;
  onClick: () => void;
  scheduledTasks: ScheduledTask[];
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  hour,
  onDrop,
  onClick,
  scheduledTasks,
}) => {
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div
      onDrop={onDrop}
      onDragOver={handleDragOver}
      onClick={onClick}
      className="relative h-16 border-b border-gray-300 hover:bg-gray-50 cursor-pointer"
    >
      <div className="absolute left-2 top-1 text-sm text-gray-500">{hour}</div>
      {scheduledTasks.map((task) => (
        <div
          key={task.id}
          className={`absolute left-20 right-2 top-1 bottom-1 rounded-lg text-white flex items-center px-2 text-sm ${CATEGORY_COLORS[task.category]}`}
        >
          {task.name}（{task.category}）
        </div>
      ))}
    </div>
  );
};
