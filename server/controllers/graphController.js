const category = require("../constants/productCategory");
const Order = require("../models/orderSchema");
const orderServices = require("../services/orderServices");

const getGraphData = async (req, res) => {
  try {
    // Get orders with populated product data
    let orders = await Order.find({ sellerId: req.sellerId })
      .select("-sellerId -orderLocation -userId")
      .populate({
        path: "productId",
        select: "category pricePerUnit",
      })
      .lean();
    
    // Log information for debugging
    console.log(`Found ${orders.length} orders for seller ID: ${req.sellerId}`);
    
    // Count invalid orders (those with null productId)
    const invalidOrders = orders.filter(order => !order.productId || !order.productId.pricePerUnit).length;
    if (invalidOrders > 0) {
      console.log(`Warning: ${invalidOrders} orders have missing or invalid product references`);
    }
    
    // Process the data with our safeguarded methods
    const dateVsSales = orderServices.getDateVsSales(orders);
    const categoryVsSales = orderServices.getCategoriesVsSales(orders);
    
    // Provide default values if empty
    const responseData = {
      dateVsSales: dateVsSales.length > 0 ? dateVsSales : [{ date: "No Data", totalSales: 0 }],
      categoryVsSales: categoryVsSales.length > 0 ? categoryVsSales : 
        category.map(cat => ({ category: cat, totalSales: 0 }))
    };
    
    res.status(200).send(responseData);
  } catch (error) {
    console.error("Error generating graph data:", error);
    
    // Return empty data rather than an error
    const fallbackData = {
      dateVsSales: [{ date: "No Data", totalSales: 0 }],
      categoryVsSales: category.map(cat => ({ category: cat, totalSales: 0 }))
    };
    
    res.status(200).send(fallbackData);
  }
};

module.exports = { getGraphData };
