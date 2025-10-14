import React from "react";
import { PieChart as RechartPieChart, Pie, Cell, Tooltip } from "recharts";
import { ScheduledTask, CATEGORY_COLORS } from "../App";

interface PieChartProps {
  data: ScheduledTask[];
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const aggregated = Object.entries(
    data.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.duration;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  if (aggregated.length === 0)
    return <div className="text-center text-gray-500">データがありません</div>;

  return (
    <div className="flex justify-center">
      <RechartPieChart width={300} height={300}>
        <Pie
          data={aggregated}
          cx="50%"
          cy="50%"
          outerRadius={120}
          dataKey="value"
          label
        >
          {aggregated.map((entry) => (
            <Cell key={entry.name} fill={`var(--${CATEGORY_COLORS[entry.name]})`} />
          ))}
        </Pie>
        <Tooltip />
      </RechartPieChart>
    </div>
  );
};
