const express = require("express");
const router = express.Router();
const { getSalesData } = require("../controllers/adminController");

console.log('in admin.js')
router.get("/sales", getSalesData);

module.exports = router;
