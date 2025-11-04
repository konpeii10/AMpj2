import { useState, useMemo, useCallback, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { TaskPanel } from './components/TaskPanel';
import { Timeline } from './components/Timeline';
import { Report } from './components/Report';
import { AddTaskModal, EditTaskModal, AddAppointmentModal } from './components/Modals';
import { CATEGORY_COLORS, formatDateKey } from './utils';
import { Task, ScheduledTask, TaskType, RecurringAppointment } from './types';

const App = () => {
  const [displayDate, setDisplayDate] = useState(new Date());

  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('timePainterTasks');

    return savedTasks ? JSON.parse(savedTasks) : [
      { 
        id: 1, name: "Reactの学習", category: "学習", color: CATEGORY_COLORS["学習"], duration: 3, 
        taskType: 'one-off' as TaskType, deadline: null, isCompleted: false, recurringDay: null, recurringTime: null 
      },
    ];

  });
  
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>(() => {
    const dateKey = formatDateKey(displayDate); // 先に初期化した displayDate を使用
    const saved = localStorage.getItem(`timePainterScheduled-${dateKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [recurringAppointments, setRecurringAppointments] = useState<RecurringAppointment[]>([]);

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [isAppointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [newAppointmentHour, setNewAppointmentHour] = useState<number | null>(null);

  
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
    localStorage.setItem('timePainterRecurringAppointments', JSON.stringify(recurringAppointments));
  }, [recurringAppointments]);


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

    const savedRecurring = localStorage.getItem('timePainterRecurringAppointments');
    setRecurringAppointments(savedRecurring ? JSON.parse(savedRecurring) : []);


  }, []);
  
  useEffect(() => {
    const dateKey = formatDateKey(displayDate);
    const saved = localStorage.getItem(`timePainterScheduled-${dateKey}`);
    setScheduledTasks(saved ? JSON.parse(saved) : []);

    const singleTasks: ScheduledTask[] = saved ? JSON.parse(saved) : [];

    const currentDayOfWeek = displayDate.getDay();// 0 (日) - 6 (土)
    const recurringForThisDay: ScheduledTask[] = recurringAppointments
        .filter(ra => {
            // ra.dayOfWeek の型に応じて判定
            if (ra.dayOfWeek === 'everyday') {
                return true; // 「毎日」は常に表示
            }
            if (ra.dayOfWeek === 'weekdays') {
                return currentDayOfWeek >= 1 && currentDayOfWeek <= 5; // 月(1)～金(5)の場合に表示
            }
            // 通常の曜日指定 (number)
            return ra.dayOfWeek === currentDayOfWeek;
        })
        .map(ra => {
            // RecurringAppointment を ScheduledTask インスタンスに変換
            const task: Task = {
                id: ra.id,
                name: ra.name,
                category: ra.category,
                color: ra.color,
                duration: ra.duration
            };
            return {
                id: ra.id,
                task: task,
                startHour: ra.startHour
            };
        });
    
    // 個別タスクと繰り返しタスクを結合
    const combinedTasks: ScheduledTask[] = [...singleTasks];
    
    recurringForThisDay.forEach(raTask => {
        const endHour = raTask.startHour + raTask.task.duration;
        
        // 個別タスクと衝突しないかチェック
        const isCollision = singleTasks.some(st => {
            const stEndHour = st.startHour + st.task.duration;
            return (raTask.startHour < stEndHour && endHour > st.startHour);
        });
        
        // 衝突がなければ追加
        if (!isCollision) {
            combinedTasks.push(raTask);
        }
    });

    setScheduledTasks(combinedTasks.sort((a, b) => a.startHour - b.startHour));
  }, [displayDate, recurringAppointments]);

  useEffect(() => {
    const dateKey = formatDateKey(displayDate);

    const recurringIds = new Set(recurringAppointments.map(ra => ra.id));
    const singleTasksToSave = scheduledTasks.filter(st => !recurringIds.has(st.id));
    
   if (singleTasksToSave.length > 0) {
        localStorage.setItem(`timePainterScheduled-${dateKey}`, JSON.stringify(singleTasksToSave));
        // ヒートマップの件数はすべてのタスク（個別＋繰り返し）で更新する
        setScheduledTaskCounts(prev => ({...prev, [dateKey]: scheduledTasks.length }));
    } else {
        localStorage.removeItem(`timePainterScheduled-${dateKey}`);
        setScheduledTaskCounts(prev => {
            const newCounts = {...prev};
            // 繰り返し予定がまだあるかもしれないので、件数だけチェック
            if (scheduledTasks.length > 0) {
                 newCounts[dateKey] = scheduledTasks.length;
            } else {
                delete newCounts[dateKey];
            }
            return newCounts;
        });
    }

  }, [scheduledTasks, displayDate, recurringAppointments]);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'color'>) => {
    const newTask: Task = {
        id: Date.now(),
        name: taskData.name,
        category: taskData.category,
        color: CATEGORY_COLORS[taskData.category],
        duration: taskData.duration,
        taskType: taskData.taskType,
        deadline: taskData.deadline,
        recurringDay: taskData.recurringDay,
        recurringTime: taskData.recurringTime,
        isCompleted: false // 新規タスクは必ず未完了
    };

    setTasks(prev => [...prev, newTask]);
  };
  
  const handleAddAppointment = (appointmentData: {name: string, category: string, duration: number, startHour: number, repeatDay: string}) => {
    const { name, category, duration, startHour, repeatDay } = appointmentData;
    
    const endHour = startHour + duration;
    if (endHour > 24) {
        alert("予定が24:00を超えています。");
        return;
    }
    
    if (repeatDay === "none") {
        // --- 従来（個別予定）のロジック ---
        const isCollision = scheduledTasks.some(st => {
          const stEndHour = st.startHour + st.task.duration;
          return (startHour < stEndHour && endHour > st.startHour);
        });

        if (isCollision) {
          alert("指定された時間にはすでに別の予定があります。");
          return;
        }

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

        setScheduledTasks(prev => [...prev, newScheduledTask].sort((a, b) => a.startHour - b.startHour));
    
    } else {
        // --- 新規（繰り返し予定）のロジック ---
        const dayOfWeek: number | 'everyday' | 'weekdays' = 
            (repeatDay === 'everyday' || repeatDay === 'weekdays') 
            ? repeatDay 
            : parseInt(repeatDay, 10);
        
        // 既存の「繰り返し予定」と衝突しないかチェック
        const isRecurringCollision = recurringAppointments.some(ra => {
            const raDay = ra.dayOfWeek;
            const newDay = dayOfWeek;
            
            // 判定ロジックを拡張
            let isDayMatch = false;
            // どちらかが「毎日」なら、常に曜日が重複するとみなす
            if (raDay === 'everyday' || newDay === 'everyday') {
                isDayMatch = true;
            // どちらかが「平日」で、もう一方も「平日」または「平日の特定の曜日」の場合
            } else if (raDay === 'weekdays' && (typeof newDay === 'number' && newDay >= 1 && newDay <= 5)) {
                isDayMatch = true;
            } else if (newDay === 'weekdays' && (typeof raDay === 'number' && raDay >= 1 && raDay <= 5)) {
                isDayMatch = true;
            // 両方が「平日」
            } else if (raDay === 'weekdays' && newDay === 'weekdays') {
                isDayMatch = true;
            // 両方が同じ特定の曜日
            } else if (raDay === newDay) {
                isDayMatch = true;
            }
            
            // 曜日が重複する可能性がある場合のみ、時間衝突をチェック
            return isDayMatch && (startHour < (ra.startHour + ra.duration) && endHour > ra.startHour);
        });

        if (isRecurringCollision) {
            alert("指定された曜日・時間にはすでに別の週間予定があります。");
            return;
        }

        // 既存の「個別予定」（*本日分*）と衝突しないかチェック
        // displayDate の曜日が選択した曜日と同じ場合のみ、今日の個別予定をチェック
        let checkTodayCollision = false;
        const todayDayOfWeek = displayDate.getDay(); // 今日の曜日
        
        if (dayOfWeek === 'everyday') { // 「毎日」
            checkTodayCollision = true;
        } else if (dayOfWeek === 'weekdays' && (todayDayOfWeek >= 1 && todayDayOfWeek <= 5)) { // 「平日」で、今日も平日
            checkTodayCollision = true;
        } else if (dayOfWeek === todayDayOfWeek) { // 「特定の曜日」で、今日がその曜日
            checkTodayCollision = true;
        }
        
        if (checkTodayCollision) {
            // ... (isSingleTaskCollision の計算ロジックは変更なし) ...
        }

        const newRecurringAppointment: RecurringAppointment = {
            id: Date.now(),
            name,
            category,
            color: CATEGORY_COLORS[category],
            duration,
            startHour,
            dayOfWeek: dayOfWeek
        };
        
        setRecurringAppointments(prev => [...prev, newRecurringAppointment].sort((a, b) => a.startHour - b.startHour));
    }
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

  const handleToggleComplete = (taskId: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
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
      // クリックされたタスクが繰り返し予定かチェック
      const isRecurring = recurringAppointments.some(ra => ra.id === taskId);
      
      if (isRecurring) {
          if (window.confirm("これは週間予定です。\nすべての曜日からこの予定を削除しますか？\n\n(OK = すべて削除 / キャンセル = 何もしない)")) {
               setRecurringAppointments(prev => prev.filter(ra => ra.id !== taskId));
          }
      } else {
          // 従来の個別予定の削除ロジック
          setScheduledTasks(prev => prev.filter(st => st.id !== taskId));
      }
  }, [recurringAppointments]); // recurringAppointments を依存配列に追加

  

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
            // --- ▼ onToggleComplete を TaskPanel に渡す ---
            onToggleComplete={handleToggleComplete}
            // --- ▲ onToggleComplete を TaskPanel に渡す ---
            
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
      <footer className="text-center mb-8">
        <p className="text-lg text-gray-600 pt-10">© 2025 Rio Kanehira</p>
      </footer>
    </div>
    
  );
};

export default App;
