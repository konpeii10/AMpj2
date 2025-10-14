import React, { useState, useEffect } from "react";
import { Task } from "../App";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task: Task | null;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("勉強");
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setCategory(task.category);
      setDuration(task.duration);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = () => {
    onSave({ ...task, name, category, duration });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-80">
        <h2 className="text-lg font-bold mb-4">タスクを編集</h2>
        <input
          className="w-full border p-2 rounded mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="w-full border p-2 rounded mb-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>勉強</option>
          <option>仕事</option>
          <option>運動</option>
          <option>趣味</option>
          <option>その他</option>
        </select>
        <input
          type="number"
          className="w-full border p-2 rounded mb-4"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">
            キャンセル
          </button>
          <button onClick={handleSubmit} className="px-3 py-1 bg-blue-500 text-white rounded">
            更新
          </button>
        </div>
      </div>
    </div>
  );
};
