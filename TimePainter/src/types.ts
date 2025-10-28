export type TaskType = 'one-off' | 'recurring';
export interface Task {
  id: number;
  name: string;
  category: string;
  color: string;
  duration: number; // in hours

  taskType: TaskType;
  
  // 単発タスク用
  deadline: string | null; // ISO 8601 形式 (例: "2025-10-28T14:30")
  isCompleted: boolean;

  // 定期タスク用
  recurringDay: number | null; // 0 (日曜) 〜 6 (土曜)
  recurringTime: string | null; // "HH:MM" 形式 (例: "14:30")
  // --- ▲ 追加する項目 ---
}

export interface ScheduledTask {
  id: number; // unique id for the scheduled instance
  task: Task;
  startHour: number;
}
