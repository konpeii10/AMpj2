import React, { useState } from "react";
import { Task } from "../App";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("勉強");
  const [duration, setDuration] = useState(60);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name) return;
    onSave({ id: "", name, category, duration });
    setName("");
    setDuration(60);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-80">
        <h2 className="text-lg font-bold mb-4">新しいタスク</h2>
        <input
          className="w-full border p-2 rounded mb-2"
          placeholder="タスク名"
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
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
