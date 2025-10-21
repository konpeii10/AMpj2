import { CATEGORY_BORDERS } from '../utils';
import { Task } from '../types';

interface TaskItemProps {
    task: Task;
    onDragStart: (e: React.DragEvent, task: Task) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDragStart, onEdit, onDelete }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className={`p-3 mb-2 rounded-lg shadow text-white ${task.color} border-b-4 ${CATEGORY_BORDERS[task.category]}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold cursor-grab active:cursor-grabbing">{task.name}</p>
          <p className="text-sm">{task.category} ({task.duration}時間)</p>
        </div>
        <div className="flex-shrink-0">
          <button onClick={() => onEdit(task)} className="p-1 rounded-full hover:bg-white/20 transition-colors mr-1">✏️</button>
          <button onClick={() => onDelete(task.id)} className="p-1 rounded-full hover:bg-white/20 transition-colors">🗑️</button>
        </div>
      </div>
    </div>
  );
};

interface TaskPanelProps {
    tasks: Task[];
    onDragStart: (e: React.DragEvent, task: Task) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
    onAddTask: () => void;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({ tasks, onDragStart, onEdit, onDelete, onAddTask }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-fit">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">タスクリスト</h2>
          <button onClick={onAddTask} className="bg-indigo-500 text-white px-3 py-1 rounded-lg hover:bg-indigo-600 transition-colors text-lg font-bold">+</button>
      </div>
      <div>
        {tasks.length > 0 ? tasks.map(task => (
          <TaskItem key={task.id} task={task} onDragStart={onDragStart} onEdit={onEdit} onDelete={onDelete} />
        )) : (
          <p className="text-gray-500 text-center py-4">タスクがありません。「+」ボタンから追加してください。</p>
        )}
      </div>
    </div>
  );
};
