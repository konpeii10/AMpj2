import React, { useState, useEffect, useMemo, useCallback } from "react";
import { TaskItem } from "./components/TaskItem";
import { TimeSlot } from "./components/TimeSlot";
import { PieChart } from "./components/PieChart";
import { AddTaskModal } from "./components/AddTaskModal";
import { EditTaskModal } from "./components/EditTaskModal";
import { AddAppointmentModal } from "./components/AddAppointmentModal";
import { CurrentTimeIndicator } from "./components/CurrentTimeIndicator";

// カテゴリごとの色設定
export const CATEGORY_COLORS: Record<string, string> = {
  勉強: "bg-blue-500",
  仕事: "bg-green-500",
  運動: "bg-red-500",
  趣味: "bg-yellow-500",
  その他: "bg-gray-400",
};

export const CATEGORY_BORDERS: Record<string, string> = {
  勉強: "border-blue-500",
  仕事: "border-green-500",
  運動: "border-red-500",
  趣味: "border-yellow-500",
  その他: "border-gray-400",
};

export interface Task {
  id: string;
  name: string;
  category: string;
  duration: number;
}

export interface ScheduledTask extends Task {
  startTime: string;
}

const generateHours = () =>
  Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

const formatDateKey = (date: Date) =>
  date.toISOString().split("T")[0];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<Record<string, ScheduledTask[]>>({});
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [displayDate, setDisplayDate] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [clickedTime, setClickedTime] = useState<string | null>(null);

  // 時間更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // localStorage読み込み
  useEffect(() => {
    const savedTasks = localStorage.getItem("timePainterTasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    const key = `timePainterScheduled-${formatDateKey(displayDate)}`;
    const savedScheduled = localStorage.getItem(key);
    if (savedScheduled)
      setScheduledTasks((prev) => ({ ...prev, [key]: JSON.parse(savedScheduled) }));
  }, [displayDate]);

  // 保存
  useEffect(() => {
    localStorage.setItem("timePainterTasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const key = `timePainterScheduled-${formatDateKey(displayDate)}`;
    localStorage.setItem(key, JSON.stringify(scheduledTasks[key] || []));
  }, [scheduledTasks, displayDate]);

  const hours = useMemo(() => generateHours(), []);

  const handleAddTask = (task: Task) => {
    setTasks((prev) => [...prev, { ...task, id: crypto.randomUUID() }]);
    setIsAddModalOpen(false);
  };

  const handleAddAppointment = (task: ScheduledTask) => {
    const key = `timePainterScheduled-${formatDateKey(displayDate)}`;
    setScheduledTasks((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { ...task, id: crypto.randomUUID() }],
    }));
    setIsAppointmentModalOpen(false);
  };

  const handleUpdateTask = (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    setIsEditModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDrop = (hour: string) => {
    if (!draggedTask) return;
    const key = `timePainterScheduled-${formatDateKey(displayDate)}`;
    setScheduledTasks((prev) => ({
      ...prev,
      [key]: [
        ...(prev[key] || []),
        { ...draggedTask, startTime: hour, id: crypto.randomUUID() },
      ],
    }));
    setDraggedTask(null);
  };

  const handlePrevDay = () =>
    setDisplayDate((d) => new Date(d.getTime() - 86400000));

  const handleNextDay = () =>
    setDisplayDate((d) => new Date(d.getTime() + 86400000));

  const handleGoToToday = () => setDisplayDate(new Date());

  const dayKey = formatDateKey(displayDate);
  const todayKey = formatDateKey(new Date());
  const today = dayKey === todayKey;

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">🕒 TimePainter</h1>

      <div className="flex gap-4 mb-6">
        <div className="px-4 py-1 bg-white rounded shadow">{dayKey}</div>
        <button onClick={handlePrevDay} className="px-3 py-1 bg-gray-300 rounded">← 前日</button>
        <button onClick={handleGoToToday} className="px-3 py-1 bg-blue-500 text-white rounded">今日</button>
        <button onClick={handleNextDay} className="px-3 py-1 bg-gray-300 rounded">翌日 →</button>
        
      </div>

      <div className="grid grid-cols-3 gap-8 w-full max-w-6xl">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">タスク一覧</h2>
            <button onClick={() => setIsAddModalOpen(true)} className="px-2 py-1 bg-blue-500 text-white rounded">
              ＋追加
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-3 space-y-2">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={() => { setEditTask(task); setIsEditModalOpen(true); }}
                onDelete={() => handleDeleteTask(task.id)}
                onDragStart={() => setDraggedTask(task)}
              />
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-lg shadow relative">
          {today && <CurrentTimeIndicator currentTime={currentTime} />}
          <div className="divide-y">
            {hours.map((hour) => (
              <TimeSlot
                key={hour}
                hour={hour}
                onDrop={() => handleDrop(hour)}
                onClick={() => { setClickedTime(hour); setIsAppointmentModalOpen(true); }}
                scheduledTasks={scheduledTasks[dayKey]?.filter((t) => t.startTime === hour) || []}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 w-full max-w-3xl bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">カテゴリ別時間配分</h2>
        <PieChart data={scheduledTasks[dayKey] || []} />
      </div>

      <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddTask} />
      <EditTaskModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} task={editTask} onSave={handleUpdateTask} />
      <AddAppointmentModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} onSave={handleAddAppointment} clickedTime={clickedTime} />
    </div>
  );
}
