import { CATEGORY_BORDERS } from '../utils';
import { Task } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

interface TaskItemProps {
    task: Task;
    onDragStart: (e: React.DragEvent, task: Task) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
    // --- ▼ onToggleComplete を props に追加 (要求3) ---
    onToggleComplete: (taskId: number) => void;
    // --- ▲ onToggleComplete を props に追加 (要求3) ---
}


const TaskItem: React.FC<TaskItemProps> = ({ task, onDragStart, onEdit, onDelete, onToggleComplete }) => {

  const getDeadlineInfo = () => {
    if (task.taskType === 'one-off' && task.deadline) {
        try {
            const date = new Date(task.deadline);
            return `締切: ${date.toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`;
        } catch (e) {
            return "締切: 日時不正";
        }
    }
    if (task.taskType === 'recurring' && task.recurringDay !== null && task.recurringTime) {
        const days = ["日", "月", "火", "水", "木", "金", "土"];
        return `毎週${days[task.recurringDay]} ${task.recurringTime}`;
    }
    return null;
  };
  const deadlineInfo = getDeadlineInfo();

  return (

    <div
      draggable={!task.isCompleted} // 完了したらドラッグ不可に
      onDragStart={(e) => !task.isCompleted && onDragStart(e, task)}
      // 完了状態に応じてスタイルを変更
      className={`p-3 mb-2 rounded-lg shadow text-white ${task.color} border-b-4 ${CATEGORY_BORDERS[task.category]} ${task.isCompleted ? 'opacity-60' : ''}`}
    >
      
      <div className="flex justify-between items-start">
        {/* --- ▼ 完了チェックボックス (要求3) --- */}
        {task.taskType === 'one-off' && (
            <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={(e) => {
                    e.stopPropagation(); // 親のクリックイベントを発火させない
                    onToggleComplete(task.id);
                }}
                className="form-checkbox h-5 w-5 mr-3 mt-1 rounded text-indigo-600 cursor-pointer"
            />
        )}
        {/* --- ▲ 完了チェックボックス (要求3) --- */}
        <div className="flex-grow">
          <p className={`font-bold cursor-grab active:cursor-grabbing ${task.isCompleted ? 'line-through' : ''}`}>
              {task.name}
          </p>
          <p className="text-sm">
            {task.category} ({task.duration}時間)
            {/* 締め切り情報を表示 (要求2) */}
            {deadlineInfo && <span className="ml-2">({deadlineInfo})</span>}
          </p>
        </div>

        

        <div className="flex-shrink-0">
          <button onClick={() => onEdit(task)} className="p-1 rounded-full hover:bg-white/20 transition-colors mr-1">
            <FontAwesomeIcon icon={faPencil} />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <FontAwesomeIcon icon={faTrash} />
          </button>
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
    // --- ▼ onToggleComplete を props に追加 (要求3) ---
    onToggleComplete: (taskId: number) => void;
    // --- ▲ onToggleComplete を props に追加 (要求3) ---
}

export const TaskPanel: React.FC<TaskPanelProps> = ({ tasks, onDragStart, onEdit, onDelete, onAddTask, onToggleComplete }) => {
  const oneOffTasks = tasks
    .filter(t => t.taskType === 'one-off')
    .sort((a, b) => {
        // 未完了を優先
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
        }
        // 締め切りありを優先
        if (a.deadline && !b.deadline) return -1;
        if (!a.deadline && b.deadline) return 1;
        // 締め切りが早い順
        if (a.deadline && b.deadline) {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        // 締め切りがないタスク同士は ID 順
        return a.id - b.id;
    });

    const recurringTasks = tasks.filter(t => t.taskType === 'recurring');
  // --- ▲ タスクの分類とソート (要求2) ---
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-fit">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">タスクリスト</h2>
          <button onClick={onAddTask} className="bg-indigo-500 text-white px-3 py-1 rounded-lg hover:bg-indigo-600 transition-colors text-lg font-bold">+</button>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {/* --- ▼ 表示を単発と定期に分離 (要求2) --- */}
        <div>
          <h3 className="text-xl font-semibold mb-2 border-b pb-1">単発タスク</h3>
          {oneOffTasks.length > 0 ? oneOffTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onDragStart={onDragStart} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onToggleComplete={onToggleComplete} // 渡す
            />
          )) : (
            <p className="text-gray-500 text-center py-2">単発タスクはありません。</p>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 border-b pb-1">定期タスク</h3>
          {recurringTasks.length > 0 ? recurringTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onDragStart={onDragStart} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onToggleComplete={onToggleComplete} // 渡す
            />
          )) : (
            <p className="text-gray-500 text-center py-2">定期タスクはありません。</p>
          )}
        </div>
      </div>
      {/* --- ▲ 表示を単発と定期に分離 (要求2) --- */}


    </div>
  );
};
