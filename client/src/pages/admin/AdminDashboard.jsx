// import React, { useEffect, useState } from "react";
// import Heading from "../../components/heading/Heading";
// import MultiLineChart from "../../components/graphs/MultiLineChart";
// import GraphSkeleton from "../../components/skeleton/GraphSkeleton";
// import EmptyStateText from "../../components/empty_state/EmptyStateText";
// import axios from "axios";

// const AdminDashboard = () => {
//   const [salesData, setSalesData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchSalesData = async () => {
//     try {
//       console.log("Fetching admin sales data...");
//       // Note: update the URL if your backend port or endpoint is different.
//       const res = await axios.get("http://localhost:8080/api/admin/sales");
//       console.log("Received sales data:", res.data);
//       setSalesData(res.data);
//     } catch (error) {
//       console.error("Error fetching sales data:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSalesData();
//   }, []);

//   return (
//     <div style={{ padding: "20px" }}>
//       <Heading text="Admin Dashboard: Sales Over Time" textAlign="left" />
//       {isLoading ? (
//         <GraphSkeleton noOfBoxes={1} />
//       ) : salesData.length === 0 ? (
//         <EmptyStateText text="No sales data available. Check back later!" />
//       ) : (
//         <MultiLineChart data={salesData} />
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;
import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ Simple Heading Component
const Heading = ({ text, textAlign }) => (
  <h2 style={{ textAlign, marginBottom: "10px" }}>{text}</h2>
);

// ✅ Placeholder while loading
const GraphSkeleton = ({ noOfBoxes = 1 }) => (
  <div>
    {Array.from({ length: noOfBoxes }).map((_, i) => (
      <div
        key={i}
        style={{
          height: "300px",
          background: "#eee",
          marginBottom: "20px",
          borderRadius: "8px",
        }}
      />
    ))}
  </div>
);

// ✅ Message when no data is available
const EmptyStateText = ({ text }) => (
  <p style={{ color: "#888", textAlign: "center", marginTop: "20px" }}>{text}</p>
);

// ✅ Multi Line Chart (Sales Over Time)
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// ✅ Reusable MultiLineChart
const MultiLineChart = ({ data }) => {
  const sellers = Array.from(new Set(data.map((d) => d.sellerName)));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        {sellers.map((seller, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={(d) => (d.sellerName === seller ? d.totalSales : null)}
            name={seller}
            stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
            connectNulls
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// ✅ Bar Chart for Top Sellers
const TopSellersBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="sellerName" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="totalSales" fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
);

// ✅ Line Chart for Total Sales Per Day
const LineChartComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="totalSales" stroke="#82ca9d" />
    </LineChart>
  </ResponsiveContainer>
);

// ✅ Main Admin Dashboard Component
const AdminDashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [categoryData, setCategoryData] = useState([]);

  const fetchSalesData = async () => {
    try {
      const res = await axios.get("https://ticket-backend-8.onrender.com/api/admin/sales");
      setSalesData(res.data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryData = async (category) => {
    try {
      if (category === "") return;
      const res = await axios.get(`https://ticket-backend-8.onrender.com/api/admin/sales/${category}`);
      setCategoryData(res.data);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  useEffect(() => {
    fetchCategoryData(category);
  }, [category]);

  // 🔢 Helpers for aggregated charts
  const aggregateTopSellers = (rawData) => {
    const sellerMap = {};
    rawData.forEach((entry) => {
      const name = entry.sellerName;
      if (!sellerMap[name]) {
        sellerMap[name] = 0;
      }
      sellerMap[name] += entry.totalSales;
    });

    return Object.entries(sellerMap).map(([sellerName, totalSales]) => ({
      sellerName,
      totalSales,
    }));
  };

  const aggregateSalesByDate = (rawData) => {
    const dateMap = {};
    rawData.forEach((entry) => {
      const date = entry.date;
      if (!dateMap[date]) {
        dateMap[date] = 0;
      }
      dateMap[date] += entry.totalSales;
    });

    return Object.entries(dateMap).map(([date, totalSales]) => ({
      date,
      totalSales,
    }));
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Sales Over Time */}
      <Heading text="Admin Dashboard: Sales Over Time" textAlign="left" />
      {isLoading ? (
        <GraphSkeleton noOfBoxes={1} />
      ) : salesData.length === 0 ? (
        <EmptyStateText text="No sales data available. Check back later!" />
      ) : (
        <MultiLineChart data={salesData} />
      )}

      {/* Category Select */}
      <select
        style={{ marginTop: "20px" }}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select Category</option>
        <option value="Rice">Rice</option>
        <option value="Vegetables">Vegetables</option>
        <option value="Wheat">Wheat</option>
        <option value="Fruits">Fruits</option>
         <option value="Sugar">Sugar</option>
         <option value="Nuts">Nuts</option>
         <option value="Spices">Spices</option>
         <option value="Pulses">Pulses</option>
      </select>

      {/* Category Graph */}
      <div style={{ marginTop: "20px" }}>
        <Heading text="Sales Data by Category" textAlign="left" />
        {isLoading ? (
          <GraphSkeleton noOfBoxes={1} />
        ) : categoryData.length === 0 ? (
          <EmptyStateText text="No sales data available. Check back later!" />
        ) : (
          <MultiLineChart data={categoryData} />
        )}
      </div>

      {/* Top Sellers Bar Chart */}
      <div style={{ marginTop: "40px" }}>
        <Heading text="Top Sellers" textAlign="left" />
        {isLoading ? (
          <GraphSkeleton noOfBoxes={1} />
        ) : salesData.length === 0 ? (
          <EmptyStateText text="No seller data available." />
        ) : (
          <TopSellersBarChart data={aggregateTopSellers(salesData)} />
        )}
      </div>

      {/* Total Sales Per Day */}
      <div style={{ marginTop: "40px" }}>
        <Heading text="Total Sales Per Day" textAlign="left" />
        {isLoading ? (
          <GraphSkeleton noOfBoxes={1} />
        ) : salesData.length === 0 ? (
          <EmptyStateText text="No sales data available." />
        ) : (
          <LineChartComponent data={aggregateSalesByDate(salesData)} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;