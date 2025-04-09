import { useState } from "react";
import axios from "axios";

const useAdminGraph = () => {
  const [isLoading, setIsLoading] = useState(false);

  // This function calls the backend API to fetch aggregated sales for all sellers.
  // It expects your backend endpoint (e.g., /api/admin/sales) to return an array of objects:
  // [
  //   { sellerName: "Seller A", totalSales: 1200 },
  //   { sellerName: "Seller B", totalSales: 2300 },
  //   ...
  // ]
  const visualizeAdminSalesData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/admin/sales");
      setIsLoading(false);
      return response.data;
    } catch (error) {
      console.error("Error fetching admin sales data:", error);
      setIsLoading(false);
      return [];
    }
  };

  return { visualizeAdminSalesData, isLoading };
};

export default useAdminGraph;
