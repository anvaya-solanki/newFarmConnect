const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const verifyAccessToken = require('../middlewares/verifyAccessToken');

// Test OpenAI Connection
router.get("/test", aiController.testOpenAI);

// Crop Predictor - Public endpoint
router.get("/crops", aiController.cropPredictor);

// Seller Chatbot - Protected endpoint
router.post("/seller-chat", verifyAccessToken, aiController.sellerChatbot);

module.exports = router;