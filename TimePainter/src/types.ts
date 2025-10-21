export interface Task {
  id: number;
  name: string;
  category: string;
  color: string;
  duration: number; // in hours
}

export interface ScheduledTask {
  id: number; // unique id for the scheduled instance
  task: Task;
  startHour: number;
}
