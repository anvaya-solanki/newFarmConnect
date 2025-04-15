const express = require("express");
const router = express.Router();
const { getSalesData, getSalesDataCategory } = require("../controllers/adminController");

router.get("/sales", getSalesData);
router.get("/sales/:category", getSalesDataCategory);

module.exports = router;
