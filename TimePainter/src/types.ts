export interface Task {
  id: number;
  name: string;
  category: string;
  color: string;
  duration: number; // 時間（例: 1.5）
}

export interface ScheduledTask {
  id: number;
  task: Task;
  startHour: number;
}
