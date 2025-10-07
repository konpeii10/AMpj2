import React from "react";
import { ScheduledTask } from "../types";

interface Props {
  scheduledTasks: ScheduledTask[];
  hour: number;
  onDrop: (hour: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onTaskClick: (taskId: number) => void;
}

const TimeSlot: React.FC<Props> = ({ scheduledTasks, hour, onDrop, onDragOver, onTaskClick }) => {
  const tasksInSlot = scheduledTasks.filter(st => {
    const endHour = st.startHour + st.task.duration;
    return hour >= st.startHour && hour < endHour;
  });

  return (
    <div
      onDrop={() => onDrop(hour)}
      onDragOver={onDragOver}
      className="relative border-t border-l border-gray-200 h-16 flex items-start"
    >
      {tasksInSlot.map((scheduledTask) =>
        scheduledTask.startHour === hour ? (
          <div
            key={scheduledTask.id}
            onClick={() => onTaskClick(scheduledTask.id)}
            className={`absolute w-full p-2 text-white rounded-lg opacity-90 shadow-md ${scheduledTask.task.color} z-10 cursor-pointer hover:opacity-100`}
            style={{
              height: `${scheduledTask.task.duration * 4}rem`,
              top: 0,
            }}
          >
            <p className="font-semibold text-sm">{scheduledTask.task.name}</p>
            <p className="text-xs">{scheduledTask.task.category}</p>
          </div>
        ) : null
      )}
    </div>
  );
};

export default TimeSlot;
