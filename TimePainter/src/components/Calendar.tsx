import { useState, useMemo, useEffect } from 'react';
import { areDatesEqual, isToday, formatDateKey } from '../utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarDay } from '@fortawesome/free-solid-svg-icons';

interface CalendarProps {
    displayDate: Date;
    setDisplayDate: (date: Date) => void;
    scheduledTaskCounts: { [key: string]: number };
}

export const Calendar: React.FC<CalendarProps> = ({ displayDate, setDisplayDate, scheduledTaskCounts }) => {
    const [calendarDate, setCalendarDate] = useState(new Date(displayDate));

    useEffect(() => {
        setCalendarDate(new Date(displayDate));
    }, [displayDate]);

    const handlePrevMonth = () => {
        setCalendarDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCalendarDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };
    
    const handleGoToToday = () => {
      const today = new Date();
      setDisplayDate(today);
      setCalendarDate(today);
    }
    //色指定
    const getHeatmapColor = (count: number) => {
        if (count >= 7) return 'bg-red-500 text-white';
        if (count >= 4) return 'bg-yellow-400 text-white';
        if (count >= 2) return 'bg-green-600 text-white';
        if (count === 1) return 'bg-blue-500 text-white';
        return '';
    };

    const calendarGrid = useMemo(() => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const grid: (Date | null)[][] = [];
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const week: (Date | null)[] = [];
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDayOfMonth) {
                    week.push(null);
                } else if (day > daysInMonth) {
                    week.push(null);
                } else {
                    week.push(new Date(year, month, day));
                    day++;
                }
            }
            grid.push(week);
            if (day > daysInMonth) break;
        }
        return grid;
    }, [calendarDate]);

    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-fit mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{calendarDate.getFullYear()}年 {calendarDate.getMonth() + 1}月</h3>
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button onClick={handleGoToToday} className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                        今日
                    </button>
                    <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {weekdays.map(day => <div key={day} className="font-bold text-sm text-gray-500">{day}</div>)}
                {calendarGrid.flat().map((date, index) => {
                    if (!date) return <div key={`empty-${index}`} />;
                    
                    const isSelected = areDatesEqual(date, displayDate);
                    const isTodayDate = isToday(date);
                    const dateKey = formatDateKey(date);
                    const count = scheduledTaskCounts[dateKey] || 0;
                    const heatmapClass = getHeatmapColor(count);


                    //色の条件分岐
                    return (
                        <div key={date.toString()} onClick={() => setDisplayDate(date)} className="relative p-1 cursor-pointer">
                            <span className={`
                                flex items-center justify-center rounded-full w-8 h-8 mx-auto transition-colors
                                ${isSelected ? 'bg-red-600 text-white' : heatmapClass}
                                ${!isSelected && isTodayDate ? 'border-2 border-red-500' : ''}
                                ${!isSelected && !heatmapClass ? 'hover:bg-gray-200' : ''}
                                ${!isSelected && heatmapClass ? 'hover:opacity-80' : ''}
                            `}>
                                {date.getDate()}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
