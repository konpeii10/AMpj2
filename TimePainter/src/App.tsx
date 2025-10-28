import { useState, useMemo, useCallback, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { TaskPanel } from './components/TaskPanel';
import { Timeline } from './components/Timeline';
import { Report } from './components/Report';
import { AddTaskModal, EditTaskModal, AddAppointmentModal } from './components/Modals';
import { CATEGORY_COLORS, formatDateKey } from './utils';
import { Task, ScheduledTask } from './types';

const App = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('timePainterTasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      { id: 1, name: "Reactの学習", category: "学習", color: CATEGORY_COLORS["学習"], duration: 3 },
      { id: 2, name: "プレゼン資料作成", category: "仕事", color: CATEGORY_COLORS["仕事"], duration: 2 },
      { id: 3, name: "ジムでトレーニング", category: "運動", color: CATEGORY_COLORS["運動"], duration: 1 },
    ];
  });
  
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [isAppointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [newAppointmentHour, setNewAppointmentHour] = useState<number | null>(null);

  const [displayDate, setDisplayDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [scheduledTaskCounts, setScheduledTaskCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timerId);
  }, []);
  
  useEffect(() => {
    localStorage.setItem('timePainterTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const counts: { [key: string]: number } = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('timePainterScheduled-')) {
            const dateKey = key.replace('timePainterScheduled-', '');
            const tasksOnDay: ScheduledTask[] = JSON.parse(localStorage.getItem(key) || '[]');
            if (tasksOnDay.length > 0) {
                counts[dateKey] = tasksOnDay.length;
            }
        }
    }
    setScheduledTaskCounts(counts);
  }, []);
  
  useEffect(() => {
    const dateKey = formatDateKey(displayDate);
    const saved = localStorage.getItem(`timePainterScheduled-${dateKey}`);
    setScheduledTasks(saved ? JSON.parse(saved) : []);
  }, [displayDate]);

  useEffect(() => {
    const dateKey = formatDateKey(displayDate);
    if (scheduledTasks.length > 0) {
        localStorage.setItem(`timePainterScheduled-${dateKey}`, JSON.stringify(scheduledTasks));
        setScheduledTaskCounts(prev => ({...prev, [dateKey]: scheduledTasks.length }));
    } else {
        localStorage.removeItem(`timePainterScheduled-${dateKey}`);
        setScheduledTaskCounts(prev => {
            const newCounts = {...prev};
            delete newCounts[dateKey];
            return newCounts;
        });
    }
  }, [scheduledTasks, displayDate]);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'color'>) => {
    const newTask: Task = {
        id: Date.now(),
        name: taskData.name,
        category: taskData.category,
        color: CATEGORY_COLORS[taskData.category],
        duration: taskData.duration,
    };
    setTasks(prev => [...prev, newTask]);
  };
  
  const handleAddAppointment = (appointmentData: {name: string, category: string, duration: number, startHour: number}) => {
    const { name, category, duration, startHour } = appointmentData;
    
    const appointmentAsTask: Task = {
        id: Date.now(),
        name,
        category,
        color: CATEGORY_COLORS[category],
        duration,
    };
    
    const newScheduledTask: ScheduledTask = {
        id: Date.now() + 1,
        task: appointmentAsTask,
        startHour,
    };

    const endHour = startHour + duration;
    if (endHour > 24) {
        alert("予定が24:00を超えています。");
        return;
    }
    
    const isCollision = scheduledTasks.some(st => {
      const stEndHour = st.startHour + st.task.duration;
      return (startHour < stEndHour && endHour > st.startHour);
    });

    if (isCollision) {
      alert("指定された時間にはすでに別の予定があります。");
      return;
    }

    setScheduledTasks(prev => [...prev, newScheduledTask].sort((a, b) => a.startHour - b.startHour));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
    setScheduledTasks(prev => prev.map(st => {
        if (st.task.id === updatedTask.id) {
            return { ...st, task: updatedTask };
        }
        return st;
    }));
  };
  
  const handleDeleteTask = (taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setScheduledTasks(prev => prev.filter(st => st.task.id !== taskId));
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  };
  
  const handleTimeSlotClick = useCallback((hour: number) => {
    const isOccupied = scheduledTasks.some(st => hour >= st.startHour && hour < st.startHour + st.task.duration);
    if (!isOccupied) {
        setNewAppointmentHour(hour);
        setAppointmentModalOpen(true);
    }
  }, [scheduledTasks]);

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  }, []);
  
  const handleScheduledTaskClick = useCallback((taskId: number) => {
      setScheduledTasks(prev => prev.filter(st => st.id !== taskId));
  }, []);

  

  return (
    <div className="bg-gray-100 min-h-screen font-sans p-4 md:p-8">
      <AddTaskModal isOpen={isAddModalOpen} onSave={handleAddTask} onClose={() => setAddModalOpen(false)} />
      <EditTaskModal isOpen={isEditModalOpen} task={editingTask} onSave={handleUpdateTask} onClose={() => setEditModalOpen(false)} />
      <AddAppointmentModal 
        isOpen={isAppointmentModalOpen}
        startHour={newAppointmentHour}
        onSave={handleAddAppointment}
        onClose={() => setAppointmentModalOpen(false)}
      />
      
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">🎨 Time Painter</h1>
        <p className="text-lg text-gray-600">時間を"塗って"、一日をデザインしよう。</p>
      </header>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Calendar 
            displayDate={displayDate} 
            setDisplayDate={setDisplayDate} 
            scheduledTaskCounts={scheduledTaskCounts} 
          />
          <TaskPanel 
            tasks={tasks}
            onDragStart={handleDragStart}
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            onAddTask={() => setAddModalOpen(true)}
          />
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg flex flex-col">
          <Timeline
            displayDate={displayDate}
            setDisplayDate={setDisplayDate}
            currentTime={currentTime}
            scheduledTasks={scheduledTasks}
            draggedTask={draggedTask}
            setDraggedTask={setDraggedTask}
            setScheduledTasks={setScheduledTasks}
            onScheduledTaskClick={handleScheduledTaskClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        </div>
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg mt-4">
            <Report scheduledTasks={scheduledTasks} />
        </div>
      </div>
    </div>
  );
};

export default App;
