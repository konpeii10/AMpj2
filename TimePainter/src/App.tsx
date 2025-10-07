import React, { useState, useMemo, useCallback } from "react";
import TaskItem from "./components/TaskItem";
import TimeSlot from "./components/TimeSlot";
import PieChart from "./components/PieChart";
import { Task, ScheduledTask } from "./types";
import { CATEGORY_COLORS } from "./constants";
import TaskManager from "./components/TaskManager";


const generateHours = () => Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

const App: React.FC = () => {
  const [tasks] = useState<Task[]>([
    { id: 1, name: "Reactの学習", category: "学習", color: CATEGORY_COLORS["学習"], duration: 3 },
    { id: 2, name: "プレゼン資料作成", category: "仕事", color: CATEGORY_COLORS["仕事"], duration: 2 },
    { id: 3, name: "ジムでトレーニング", category: "運動", color: CATEGORY_COLORS["運動"], duration: 1 },
    { id: 4, name: "読書", category: "趣味", color: CATEGORY_COLORS["趣味"], duration: 1.5 },
    { id: 5, name: "ランチ休憩", category: "休憩", color: CATEGORY_COLORS["休憩"], duration: 1 },
  ]);

  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const hours = useMemo(() => generateHours(), []);

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDrop = useCallback((hour: number) => {
    if (!draggedTask) return;
    const endHour = hour + draggedTask.duration;

    if (endHour > 24) return;

    const isCollision = scheduledTasks.some(st => {
      const stEnd = st.startHour + st.task.duration;
      return hour < stEnd && endHour > st.startHour;
    });

    if (isCollision) return;

    const newTask: ScheduledTask = { id: Date.now(), task: draggedTask, startHour: hour };
    setScheduledTasks(prev => [...prev, newTask].sort((a, b) => a.startHour - b.startHour));
    setDraggedTask(null);
  }, [draggedTask, scheduledTasks]);

  const handleTaskClick = useCallback((id: number) => {
    setScheduledTasks(prev => prev.filter(st => st.id !== id));
  }, []);

  const reportData = useMemo(() => {
    const summary: Record<string, { name: string; value: number; color: string }> = {};
    scheduledTasks.forEach(st => {
      const { category, duration, color } = st.task;
      if (!summary[category]) summary[category] = { name: category, value: 0, color };
      summary[category].value += duration;
    });
    return Object.values(summary);
  }, [scheduledTasks]);

  

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">🎨 Time Painter</h1>
        <p className="text-lg text-gray-600">時間を“塗って”、一日をデザインしよう。</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg h-fit">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">タスクリスト</h2>
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} onDragStart={handleDragStart} />
          ))}
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">タイムライン (Today)</h2>
          <div>
            {hours.map((time, index) => (
              <div key={time} className="flex">
                <div className="w-16 text-right pr-2 text-sm text-gray-500 -mt-2">{time}</div>
                <div className="flex-1">
                  <TimeSlot
                    hour={index}
                    scheduledTasks={scheduledTasks}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onTaskClick={handleTaskClick}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-screen bg-gray-50 p-6">
          <TaskManager />
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg mt-4">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">実績レポート</h2>
          <PieChart data={reportData} />
        </div>
        
      </div>
    </div>
  );
};


export default App;
