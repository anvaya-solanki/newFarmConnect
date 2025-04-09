import React, { useEffect, useState } from "react";
import Heading from "../../components/heading/Heading";
import MultiLineChart from "../../components/graphs/MultiLineChart";
import GraphSkeleton from "../../components/skeleton/GraphSkeleton";
import EmptyStateText from "../../components/empty_state/EmptyStateText";
import axios from "axios";

const AdminDashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSalesData = async () => {
    try {
      console.log("Fetching admin sales data...");
      // Note: update the URL if your backend port or endpoint is different.
      const res = await axios.get("http://localhost:8080/api/admin/sales");
      console.log("Received sales data:", res.data);
      setSalesData(res.data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Heading text="Admin Dashboard: Sales Over Time" textAlign="left" />
      {isLoading ? (
        <GraphSkeleton noOfBoxes={1} />
      ) : salesData.length === 0 ? (
        <EmptyStateText text="No sales data available. Check back later!" />
      ) : (
        <MultiLineChart data={salesData} />
      )}
    </div>
  );
};

export default AdminDashboard;
