import { useMemo, useCallback } from 'react';
import { generateHours, isToday } from '../utils';
import { Task, ScheduledTask } from '../types';

interface TimeSlotProps {
    scheduledTasks: ScheduledTask[];
    hour: number;
    onDrop: (hour: number) => void;
    onDragOver: (e: React.DragEvent) => void;
    onTaskClick: (taskId: number) => void;
    onTimeSlotClick: (hour: number) => void;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ scheduledTasks, hour, onDrop, onDragOver, onTaskClick, onTimeSlotClick }) => {
  const handleSlotClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
        onTimeSlotClick(hour);
    }
  }

  return (
    <div
      onDrop={() => onDrop(hour)}
      onDragOver={onDragOver}
      onClick={handleSlotClick}
      className="relative border-t border-l border-gray-200 h-16 flex items-start cursor-pointer hover:bg-gray-50 transition-colors"
      data-hour={hour}
    >
      {scheduledTasks.map((scheduledTask) => {
        const startH = Math.floor(scheduledTask.startHour);
        if (startH === hour) {
          return (
            <div
              key={scheduledTask.id}
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick(scheduledTask.id);
              }}
              className={`absolute w-full p-2 text-white rounded-lg opacity-90 shadow-md ${scheduledTask.task.color} z-10 cursor-pointer hover:opacity-100`}
              style={{
                height: `${scheduledTask.task.duration * 4}rem`,
                top: `${(scheduledTask.startHour % 1) * 4}rem`,
              }}
            >
              <p className="font-semibold text-sm">{scheduledTask.task.name}</p>
              <p className="text-xs">{scheduledTask.task.category}</p>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

const CurrentTimeIndicator: React.FC<{ date: Date }> = ({ date }) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const topPosition = (hours + minutes / 60) * 4;

  return (
    <div
      className="absolute left-16 right-0 flex items-center z-20"
      style={{ top: `${topPosition}rem`, transform: 'translateY(-50%)' }}
      aria-hidden="true"
    >
      <div className="text-xs font-bold text-red-500 whitespace-nowrap bg-white pr-1">
        {date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="w-full h-0.5 bg-red-500"></div>
    </div>
  );
};

interface TimelineProps {
    displayDate: Date;
    setDisplayDate: (date: Date) => void;
    currentTime: Date;
    scheduledTasks: ScheduledTask[];
    draggedTask: Task | null;
    setDraggedTask: (task: Task | null) => void;
    setScheduledTasks: (tasks: ScheduledTask[] | ((prev: ScheduledTask[]) => ScheduledTask[])) => void;
    onScheduledTaskClick: (taskId: number) => void;
    onTimeSlotClick: (hour: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ displayDate, setDisplayDate, currentTime, scheduledTasks, draggedTask, setDraggedTask, setScheduledTasks, onScheduledTaskClick, onTimeSlotClick }) => {
  const hours = useMemo(() => generateHours(), []);
  
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    }).format(displayDate);
  }, [displayDate]);

  const handlePrevDay = () => {
    setDisplayDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() - 1);
        return newDate;
    });
  };

  const handleNextDay = () => {
    setDisplayDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + 1);
        return newDate;
    });
  };

  const handleGoToToday = () => {
    setDisplayDate(new Date());
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((hour: number) => {
    if (!draggedTask) return;
    
    const endHour = hour + draggedTask.duration;
    if (endHour > 24) {
        console.warn("Task cannot extend beyond 24:00.");
        return;
    }
    const isCollision = scheduledTasks.some(st => {
      const stEndHour = st.startHour + st.task.duration;
      return (hour < stEndHour && endHour > st.startHour);
    });

    if (isCollision) {
      console.warn("Collision detected! Cannot schedule task here.");
      return;
    }
    
    const newScheduledTask: ScheduledTask = {
      id: Date.now(),
      task: draggedTask,
      startHour: hour,
    };
    setScheduledTasks(prev => [...prev, newScheduledTask].sort((a, b) => a.startHour - b.startHour));
    setDraggedTask(null);
  }, [draggedTask, scheduledTasks, setScheduledTasks, setDraggedTask]);

  return (
    <>
      <div className="flex justify-between items-center mb-4 border-b pb-2 flex-shrink-0">
        <h2 className="text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis">タイムライン ({formattedDate})</h2>
        <div className="flex items-center space-x-2 flex-shrink-0">
            <button onClick={handlePrevDay} className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">&lt;</button>
            <button onClick={handleGoToToday} className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">今日</button>
            <button onClick={handleNextDay} className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">&gt;</button>
        </div>
      </div>
      <div className="relative overflow-y-auto h-[75vh]">
         {isToday(displayDate) && <CurrentTimeIndicator date={currentTime} />}
         <div className="grid" style={{ gridTemplateRows: `repeat(${hours.length}, 4rem)` }}>
           {hours.map((time, index) => (
             <div key={time} className="flex">
               <div className="w-16 text-right pr-2 text-sm text-gray-500 -mt-2">{time}</div>
               <div className="flex-1">
                 <TimeSlot
                   hour={index}
                   scheduledTasks={scheduledTasks}
                   onDrop={handleDrop}
                   onDragOver={handleDragOver}
                   onTaskClick={onScheduledTaskClick}
                   onTimeSlotClick={onTimeSlotClick}
                 />
               </div>
             </div>
           ))}
         </div>
      </div>
    </>
  );
};
