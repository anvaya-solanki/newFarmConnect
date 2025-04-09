import React from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { captializeFirstLetter } from "../../utils/helper/captializeFirstLetter";

const BarGraph = ({ data = [], color, xKey, yKey, title = "Graph Title" }) => {
  // Check if data is empty or all values are zero
  const hasRealData = data && data.length > 0 && 
    data.some(item => item[yKey] > 0);
  
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
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            axisLine={{ stroke: color, strokeWidth: 2 }}
            tick={{ fill: color, fontSize: "12px" }}
            tickFormatter={(tick) => captializeFirstLetter(tick)}
          />
          <YAxis
            axisLine={{ stroke: color, strokeWidth: 2 }}
            tick={{ fill: color, fontSize: "12px" }}
            tickFormatter={(tick) => `Rs.${tick}`}
          />
          <Tooltip formatter={(value) => [`Rs.${value}`, "Sales"]} />
          <Bar
            dataKey={yKey}
            fill={color}
            //   activeBar={<Rectangle fill="pink" stroke="blue" />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraph;
