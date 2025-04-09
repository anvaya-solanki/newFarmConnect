const Order = require("../models/orderSchema"); // Adjust model import as needed

// Sample implementation: Aggregates sales (sum of order totals) per seller
const getSalesData = async (req, res) => {
    try {
        console.log("inside admin controller")
        console.log("getSalesData called with query params:", req.query);
        console.log("Received route parameters:", req.params);
        const salesData = await Order.aggregate([
            {
              $group: {
                _id: {
                    sellerId: "$sellerId",
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                  
                },
                totalSales: { $sum: "$orderQty" }
              }
            },
            {
              $lookup: {
                from: "sellers",
                localField: "_id.sellerId",
                foreignField: "_id",
                as: "sellerDetails"
              }
            },
            { $unwind: "$sellerDetails" },
            {
              $project: {
                date: "$_id.date",
                sellerId: "$_id.sellerId",
                sellerName: "$sellerDetails.name",
                totalSales: 1
              }
            },
            {
              $sort: { date: 1, sellerName: 1 }
            }
          ]);          
        res.status(200).json(salesData);
    } catch (error) {
        console.error("Error fetching sales data:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getSalesData };