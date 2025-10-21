import { useMemo } from 'react';
import { CATEGORY_HEX_COLORS } from '../utils';
import { ScheduledTask } from '../types';

interface PieChartData {
    name: string;
    value: number;
    color: string;
}

const PieChart: React.FC<{ data: PieChartData[] }> = ({ data }) => {
    const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
    if (total === 0) {
        return <div className="text-center text-gray-500">スケジュールを登録すると、ここにレポートが表示されます。</div>;
    }
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    const segments = data.map((item, index) => {
        const percentage = (item.value / total);
        const dashArray = circumference;
        const dashOffset = circumference * (1 - percentage);
        const rotation = accumulatedAngle * 360;
        accumulatedAngle += percentage;
        
        return (
            <circle
                key={index}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={CATEGORY_HEX_COLORS[item.name] || 'gray'}
                strokeWidth="20"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                transform={`rotate(${rotation - 90} 60 60)`}
            />
        );
    });

    return (
        <div className="flex flex-col md:flex-row items-center justify-center p-4">
            <svg viewBox="0 0 120 120" className="w-48 h-48">
                {segments}
            </svg>
            <div className="mt-4 md:mt-0 md:ml-8">
                <h3 className="font-bold mb-2">時間の使い方</h3>
                <ul>
                    {data.map((item, index) => (
                        <li key={index} className="flex items-center mb-1">
                            <span className={`w-4 h-4 rounded-full mr-2 ${item.color}`}></span>
                            <span>{item.name}: {item.value}時間 ({((item.value / total) * 100).toFixed(1)}%)</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


export const Report: React.FC<{ scheduledTasks: ScheduledTask[] }> = ({ scheduledTasks }) => {
  const reportData = useMemo(() => {
    const summary: { [key: string]: PieChartData } = {};
    scheduledTasks.forEach(st => {
      const { category, duration, color } = st.task;
      if (!summary[category]) {
        summary[category] = { name: category, value: 0, color: color };
      }
      summary[category].value += duration;
    });
    return Object.values(summary);
  }, [scheduledTasks]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">実績レポート</h2>
      <PieChart data={reportData} />
    </>
  );
};
