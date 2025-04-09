const { formatDate } = require("../helper/formatDate");
const productCategory = require("../constants/productCategory");

const getDateVsSales = (orders) => {
  // Filter out orders with null or undefined productId
  const validOrders = orders.filter(order => order.productId && order.productId.pricePerUnit);
  
  let data = [];
  let i = 0;
  
  // If no valid orders, return empty array
  if (validOrders.length === 0) {
    return data;
  }
  
  while (i < validOrders.length) {
    let date = formatDate(validOrders[i].date);
    let totalSales = 0;
    while (i < validOrders.length && formatDate(validOrders[i].date) === date) {
      totalSales = totalSales + (validOrders[i].productId.pricePerUnit * validOrders[i].orderQty);
      i++;
    }
    data.push({ date: date, totalSales: totalSales });
  }
  
  return data;
};

const getCategoriesVsSales = (orders) => {
  // Filter out orders with null or undefined productId
  const validOrders = orders.filter(order => order.productId && order.productId.pricePerUnit && order.productId.category);
  
  let data = [];

  productCategory.map((item) => {
    data.push({ category: item, totalSales: 0 });
  });
  
  for(let i=0; i < validOrders.length; i++) {
    data.forEach((item) => {
      if(item.category === validOrders[i].productId.category) {
        item.totalSales = item.totalSales + (validOrders[i].orderQty * validOrders[i].productId.pricePerUnit);
      }
    });
  }

  return data;
};

module.exports = { getDateVsSales, getCategoriesVsSales };
