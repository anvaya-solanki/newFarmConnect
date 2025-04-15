// const Order = require("../models/orderSchema"); // Adjust model import as needed

// // Sample implementation: Aggregates sales (sum of order totals) per seller
// const getSalesData = async (req, res) => {
//     try {
//         console.log("inside admin controller")
//         console.log("getSalesData called with query params:", req.query);
//         console.log("Received route parameters:", req.params);
//         const salesData = await Order.aggregate([
//             {
//               $group: {
//                 _id: {
//                     sellerId: "$sellerId",
//                   date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                  
//                 },
//                 totalSales: { $sum: "$orderQty" }
//               }
//             },
//             {
//               $lookup: {
//                 from: "sellers",
//                 localField: "_id.sellerId",
//                 foreignField: "_id",
//                 as: "sellerDetails"
//               }
//             },
//             { $unwind: "$sellerDetails" },
//             {
//               $project: {
//                 date: "$_id.date",
//                 sellerId: "$_id.sellerId",
//                 sellerName: "$sellerDetails.name",
//                 totalSales: 1
//               }
//             },
//             {
//               $sort: { date: 1, sellerName: 1 }
//             }
//           ]);          
//         res.status(200).json(salesData);
//     } catch (error) {
//         console.error("Error fetching sales data:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

// module.exports = { getSalesData };
const Order = require("../models/orderSchema"); // Adjust model import as needed
const Product = require("../models/productSchema");
const Seller = require("../models/sellerSchema")

// Aggregates sales (sum of order totals) per seller
const getSalesData = async (req, res) => {
    try {
        console.log("inside admin controller");
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

const getSalesDataCategory = async (req, res) => {
    try {
        console.log("inside admin controller");
        console.log("getSalesDataCategory called with query params:", req.query);
        console.log("Received route parameters:", req.params);

        const salesData = await Order.aggregate([
            // Lookup product to get the category
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },

            // Group by sellerId, product.category, and date
            {
                $group: {
                    _id: {
                        sellerId: "$sellerId",
                        category: "$product.category", // Fixed: Get category from product
                        date: {
                            $dateToString: { format: "%Y-%m-%d", date: "$date" }
                        }
                    },
                    totalSales: { $sum: "$orderQty" }
                }
            },

            // Lookup seller details
            {
                $lookup: {
                    from: "sellers",
                    localField: "_id.sellerId",
                    foreignField: "_id",
                    as: "sellerDetails"
                }
            },
            { $unwind: "$sellerDetails" },

            // Format the final output
            {
                $project: {
                    _id: 0, // Don't include _id in output
                    date: "$_id.date",
                    category: "$product.category",
                    sellerId: "$sellerId",
                    sellerName: "$sellerDetails.name",
                    totalSales: 1
                }
            },

            { $sort: { date: 1, sellerName: 1, category: 1 } }
        ]);

        res.status(200).json(salesData);
    } catch (error) {
        console.error("Error fetching sales data by category:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getSalesData, getSalesDataCategory };