import { useState } from "react";

interface Task {
  id: number;
  title: string;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  // タスク追加
  const handleAddTask = () => {
    if (newTask.trim() === "") return;
    const newItem: Task = {
      id: Date.now(),
      title: newTask,
    };
    setTasks([...tasks, newItem]);
    setNewTask("");
  };

  // タスク削除
  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-2xl">
      <h2 className="text-xl font-bold mb-4">タスク管理</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="新しいタスクを入力"
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button
          onClick={handleAddTask}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          追加
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex justify-between items-center bg-gray-100 p-2 rounded-lg"
          >
            <span>{task.title}</span>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="text-red-500 hover:text-red-700"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
