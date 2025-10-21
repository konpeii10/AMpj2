import { useState, useEffect } from 'react';
import { CATEGORY_COLORS } from '../utils';
import { Task } from '../types';

interface AddTaskModalProps {
    isOpen: boolean;
    onSave: (taskData: Omit<Task, 'id' | 'color'>) => void;
    onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onSave, onClose }) => {
    if (!isOpen) return null;

    const [name, setName] = useState("");
    const [category, setCategory] = useState("学習");
    const [duration, setDuration] = useState(1);

    const handleSave = () => {
        if (!name.trim()) {
            alert("タスク名を入力してください。");
            return;
        }
        if (duration <= 0) {
            alert("時間を正しく入力してください。");
            return;
        }
        onSave({ name, category, duration });
        onClose();
    };

    const handleClose = () => {
        setName("");
        setCategory("学習");
        setDuration(1);
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
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={handleClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">キャンセル</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">追加</button>
                </div>
            </div>
        </div>
    );
};

interface AddAppointmentModalProps {
    isOpen: boolean;
    startHour: number | null;
    onSave: (appointmentData: {name: string, category: string, duration: number, startHour: number}) => void;
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

    useEffect(() => {
        if (isOpen) {
            setName("");
            setCategory("その他");

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
        onSave({ name, category, duration, startHour: startTimeValue });
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
