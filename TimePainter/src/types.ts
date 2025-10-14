export type Task = {
  id: string;
  name: string;
  category: string;
  color: string;
  duration: number;
};

export type ScheduledTask = {
  id: string;
  task: Task;
  startHour: number;
};
