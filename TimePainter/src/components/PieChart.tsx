import React, { useMemo } from "react";

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: DataItem[];
}

const PieChart: React.FC<Props> = ({ data }) => {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  if (total === 0) {
    return <div className="text-center text-gray-500">スケジュールを登録すると、ここにレポートが表示されます。</div>;
  }

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  const segments = data.map((item, index) => {
    const percentage = item.value / total;
    const rotation = accumulatedAngle * 360;
    accumulatedAngle += percentage;

    return (
      <circle
        key={index}
        cx="60"
        cy="60"
        r={radius}
        fill="transparent"
        stroke="currentColor"
        strokeWidth="20"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={`${circumference * (1 - percentage)}`}
        transform={`rotate(${rotation - 90} 60 60)`}
        className={item.color}
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

export default PieChart;
