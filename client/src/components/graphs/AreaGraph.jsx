import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AreaGraph = ({ lineData = [], color, xKey, yKey, title = "Graph Title" }) => {
  const gradientId = `gradient-1`;
  
  // Check if data is empty or only contains "No Data" entries
  const hasRealData = lineData && lineData.length > 0 && 
    !(lineData.length === 1 && lineData[0].date === "No Data" && lineData[0].totalSales === 0);
  
  if (!hasRealData) {
    return (
      <div className="w-full h-[300px] flex flex-col justify-center items-center border rounded p-4">
        <h2 className="text-center font-semibold mb-4">{title}</h2>
        <p className="text-gray-500">No sales data available to display</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <h2 className="text-center font-semibold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={lineData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="100%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#666666" />
          <XAxis
            dataKey={xKey}
            axisLine={{ stroke: color, strokeWidth: 2 }}
            tick={{ fill: color, fontSize: "12px" }}
          />
          <YAxis
            axisLine={{ stroke: color, strokeWidth: 2 }}
            tick={{ fill: color, fontSize: "12px" }}
            tickFormatter={(tick) => `Rs.${tick}`}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaGraph;
