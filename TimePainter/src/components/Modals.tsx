import { useState, useEffect } from 'react';
import { CATEGORY_COLORS } from '../utils';
import { Task, TaskType } from '../types';

interface AddTaskModalProps {
    isOpen: boolean;
    onSave: (taskData: Omit<Task, 'id' | 'color' | 'isCompleted'>) => void;
    onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onSave, onClose }) => {
    if (!isOpen) return null;

    const [name, setName] = useState("");
    const [category, setCategory] = useState("学習");
    const [duration, setDuration] = useState(1);

    const [taskType, setTaskType] = useState<TaskType>('one-off');
    const [deadline, setDeadline] = useState(""); // datetime-local の値 (YYYY-MM-DDTHH:MM)
    const [recurringDay, setRecurringDay] = useState(0); // 0=日曜
    const [recurringTime, setRecurringTime] = useState("09:00"); // HH:MM

    const handleSave = () => {
        if (!name.trim()) {
            alert("タスク名を入力してください。");
            return;
        }
        if (duration <= 0) {
            alert("時間を正しく入力してください。");
            return;
        }

        const taskData: Omit<Task, 'id' | 'color' | 'isCompleted'> = {
            name,
            category,
            duration,
            taskType,
            deadline: taskType === 'one-off' ? deadline : null,
            recurringDay: taskType === 'recurring' ? recurringDay : null,
            recurringTime: taskType === 'recurring' ? recurringTime : null,
        };
        onSave(taskData);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSave();
    };

    const handleClose = () => {
        setName("");
        setCategory("学習");
        setDuration(1);
        setTaskType('one-off');
        setDeadline("");
        setRecurringDay(0);
        setRecurringTime("09:00");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">新しいタスクを追加</h3>
                <div className="space-y-4">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" placeholder="タスク名" />
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded">
                        {Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input type="number" value={duration} onChange={(e) => setDuration(parseFloat(e.target.value) || 0)} step="0.25" min="0.25" className="w-full p-2 border rounded" placeholder="時間 (例: 1.5)" />

                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input type="radio" value="one-off" checked={taskType === 'one-off'} onChange={() => setTaskType('one-off')} className="mr-2"/>
                            単発
                        </label>
                        <label className="flex items-center">
                            <input type="radio" value="recurring" checked={taskType === 'recurring'} onChange={() => setTaskType('recurring')} className="mr-2"/>
                            定期
                        </label>
                    </div>

                    {/* 単発タスク用の入力 */}
                    {taskType === 'one-off' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">締め切り日時</label>
                            <input 
                                type="datetime-local" 
                                value={deadline} 
                                onChange={(e) => setDeadline(e.target.value)} 
                                className="w-full p-2 border rounded mt-1" 
                            />
                        </div>
                    )}

                    {/* 定期タスク用の入力 */}
                    {taskType === 'recurring' && (
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">曜日</label>
                                <select value={recurringDay} onChange={(e) => setRecurringDay(Number(e.target.value))} className="w-full p-2 border rounded mt-1">
                                    <option value={0}>日曜日</option>
                                    <option value={1}>月曜日</option>
                                    <option value={2}>火曜日</option>
                                    <option value={3}>水曜日</option>
                                    <option value={4}>木曜日</option>
                                    <option value={5}>金曜日</option>
                                    <option value={6}>土曜日</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">時間</label>
                                <input 
                                    type="time" 
                                    value={recurringTime} 
                                    onChange={(e) => setRecurringTime(e.target.value)} 
                                    className="w-full p-2 border rounded mt-1" 
                                />
                            </div>
                        </div>
                    )}





                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={handleClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">キャンセル</button>
                    <button type ="submit" onClick={handleSave} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">追加</button>
                </div>
            </div>
        </div>
    );
};

interface AddAppointmentModalProps {
    isOpen: boolean;
    startHour: number | null;
    onSave: (appointmentData: {name: string, category: string, duration: number, startHour: number, repeatDay: string}) => void;
    onClose: () => void;
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ isOpen, startHour, onSave, onClose }) => {
    if (!isOpen || startHour === null) return null;

    const [name, setName] = useState("");
    const [category, setCategory] = useState("その他");
    const [startH, setStartH] = useState('00');
    const [startM, setStartM] = useState('00');
    const [endH, setEndH] = useState('00');
    const [endM, setEndM] = useState('00');

    const [repeatDay, setRepeatDay] = useState("none"); // "none", "0" (Sun) - "6" (Sat)

    useEffect(() => {
        if (isOpen) {
            setName("");
            setCategory("その他");

            setRepeatDay("none");

            let initialStartH = Math.floor(startHour);
            let initialStartM = Math.round(((startHour % 1) * 60) / 5) * 5;
            if (initialStartM >= 60) {
                initialStartH += 1;
                initialStartM = 0;
            }
            setStartH(String(initialStartH).padStart(2, '0'));
            setStartM(String(initialStartM).padStart(2, '0'));

            const initialEndTime = startHour + 1;
            let initialEndH = Math.floor(initialEndTime);
            let initialEndM = Math.round(((initialEndTime % 1) * 60) / 5) * 5;
            if (initialEndM >= 60) {
                initialEndH += 1;
                initialEndM = 0;
            }
            
            if (initialEndH >= 24) {
                setEndH('24');
                setEndM('00');
            } else {
                setEndH(String(initialEndH).padStart(2, '0'));
                setEndM(String(initialEndM).padStart(2, '0'));
            }
        }
    }, [isOpen, startHour]);

    const handleSave = () => {
        if (!name.trim()) {
            alert("予定名を入力してください。");
            return;
        }

        const startTimeValue = parseInt(startH, 10) + parseInt(startM, 10) / 60;
        const endTimeValue = parseInt(endH, 10) + parseInt(endM, 10) / 60;
        const duration = endTimeValue - startTimeValue;
        
        if (duration <= 0) {
            alert("終了時間は開始時間より後に設定してください。");
            return;
        }
        onSave({ name, category, duration, startHour: startTimeValue, repeatDay });
        onClose();
    };
    
    const handleTimeChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d{0,2}$/.test(value)) {
            setter(value);
        }
    };
    
    const handleTimeBlur = (setter: React.Dispatch<React.SetStateAction<string>>, max: number, isMinute = false) => (e: React.FocusEvent<HTMLInputElement>) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < 0) value = 0;
        if (value > max) value = max;
        
        if (isMinute) {
            value = Math.round(value / 5) * 5;
             if (value >= 60) value = 55;
        }

        setter(String(value).padStart(2, '0'));
    };

    const handleEndHourBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        handleTimeBlur((valStr) => {
            setEndH(valStr);
            if (valStr === '24') {
                setEndM('00');
            }
        }, 24)(e);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">予定の追加</h3>
                <div className="space-y-4">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" placeholder="予定名 (例: チームミーティング)" />
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded">
                        {Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>

                    {/* ▼▼▼ 以下に繰り返し設定の <select> を追加 ▼▼▼ */}
                    <select value={repeatDay} onChange={(e) => setRepeatDay(e.target.value)} className="w-full p-2 border rounded">
                        <option value="none">繰り返さない (この日のみ)</option>
                        <option value="0">毎週日曜日</option>
                        <option value="1">毎週月曜日</option>
                        <option value="2">毎週火曜日</option>
                        <option value="3">毎週水曜日</option>
                        <option value="4">毎週木曜日</option>
                        <option value="5">毎週金曜日</option>
                        <option value="6">毎週土曜日</option>
                    </select>


                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">開始時刻</label>
                            <div className="flex items-center mt-1">
                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={startH} onChange={handleTimeChange(setStartH)} onBlur={handleTimeBlur(setStartH, 23)} className="w-full p-2 border rounded-l text-center"/>
                                <span className="p-2 border-t border-b bg-gray-100">:</span>
                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={startM} onChange={handleTimeChange(setStartM)} onBlur={handleTimeBlur(setStartM, 59, true)} className="w-full p-2 border rounded-r text-center"/>
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">終了時刻</label>
                             <div className="flex items-center mt-1">
                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={endH} onChange={handleTimeChange(setEndH)} onBlur={handleEndHourBlur} className="w-full p-2 border rounded-l text-center"/>
                                <span className="p-2 border-t border-b bg-gray-100">:</span>
                                <input type="text" inputMode="numeric" pattern="[0-9]*" value={endM} onChange={handleTimeChange(setEndM)} onBlur={handleTimeBlur(setEndM, 59, true)} className="w-full p-2 border rounded-r text-center" disabled={endH === '24'}/>
                            </div>
                        </div>
                    </div>
                </div>





                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">キャンセル</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">保存</button>
                </div>
            </div>
        </div>
    );
};

interface EditTaskModalProps {
    isOpen: boolean;
    task: Task | null;
    onSave: (task: Task) => void;
    onClose: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, task, onSave, onClose }) => {
    if (!isOpen || !task) return null;

    const [name, setName] = useState(task.name);
    const [category, setCategory] = useState(task.category);
    const [duration, setDuration] = useState(task.duration);

    useEffect(() => {
        if (task) {
            setName(task.name);
            setCategory(task.category);
            setDuration(task.duration);
        }
    }, [task]);

    const handleSave = () => {
        if (!name.trim()) {
            alert("タスク名を入力してください。");
            return;
        }
        if (duration <= 0) {
            alert("時間を正しく入力してください。");
            return;
        }
        onSave({ ...task, name, category, duration, color: CATEGORY_COLORS[category] });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">タスクの編集</h3>
                <div className="space-y-4">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" placeholder="タスク名" />
                    
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded">
                        {Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input type="number" value={duration} onChange={(e) => setDuration(parseFloat(e.target.value) || 0)} step="0.5" min="0.5" className="w-full p-2 border rounded" placeholder="時間 (例: 1.5)" />
                </div>

                
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">キャンセル</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">保存</button>
                </div>
            </div>
        </div>
    );
};
