import React from "react";
import Plot from "react-plotly.js";

const MultiLineChart = ({ data }) => {
  // Group data by sellerName
  const groupedData = data.reduce((acc, cur) => {
    const seller = cur.sellerName;
    if (!acc[seller]) {
      acc[seller] = [];
    }
    acc[seller].push({
      date: cur.date,
      totalSales: cur.totalSales,
    });
    return acc;
  }, {});

  // For each seller, create a trace with the dates on x-axis and sales on y-axis.
  const traces = Object.entries(groupedData).map(([sellerName, records]) => {
    // Sort records by date
    records.sort((a, b) => new Date(a.date) - new Date(b.date));
    return {
      x: records.map((record) => record.date),
      y: records.map((record) => record.totalSales),
      name: sellerName,
      type: "scatter",
      mode: "lines+markers",
    };
  });

  return (
    <Plot
      data={traces}
      layout={{
        title: "Total Sales Over Time by Seller",
        xaxis: { title: "Date" },
        yaxis: { title: "Total Sales" },
        autosize: true,
      }}
      style={{ width: "100%", height: "500px" }}
    />
  );
};

export default MultiLineChart;
