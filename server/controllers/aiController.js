const OpenAI = require("openai");
const cropPredictorServices = require("../services/cropPredictorServices");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test OpenAI Connection
const testOpenAI = async (req, res) => {
  try {
    console.log("=== OpenAI Test Started ===");
    console.log("Request received at:", new Date().toISOString());
    console.log("API Key exists:", !!process.env.OPENAI_API_KEY);
    console.log("API Key prefix:", process.env.OPENAI_API_KEY?.substring(0, 3));

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not set in environment variables");
    }

    console.log("Making OpenAI API call...");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Hello, this is a test message. Please respond with 'OK' if you receive this."
        }
      ],
      max_tokens: 5,
      temperature: 0.7,
    });

    console.log("OpenAI API call successful");
    console.log("Response received:", completion);

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error("No response choices received from OpenAI");
    }

    const response = completion.choices[0].message.content;
    console.log("Final response:", response);

    res.status(200).json({
      status: "success",
      message: "OpenAI connection successful",
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("=== OpenAI Test Failed ===");
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

    // Send a more detailed error response
    res.status(500).json({
      status: "error",
      message: "OpenAI connection failed",
      error: {
        name: error.name,
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.response?.data : undefined
      },
      timestamp: new Date().toISOString()
    });
  } finally {
    console.log("=== OpenAI Test Completed ===");
  }
};

// Crop Predictor Controller
const cropPredictor = async (req, res) => {
  try {
    console.log("=== Crop Prediction Started ===");
    console.log("Request received at:", new Date().toISOString());
    console.log("Query parameters:", req.query);

    const { soil, altitude, temperature, humidity, rainfall } = req.query;

    // Validate input parameters
    if (!soil || !altitude || !temperature || !humidity || !rainfall) {
      console.error("Missing parameters:", { soil, altitude, temperature, humidity, rainfall });
      return res.status(400).json({
        status: "error",
        message: "Missing required parameters",
        timestamp: new Date().toISOString()
      });
    }

    console.log("Making prediction request...");
    const prediction = await cropPredictorServices(soil, altitude, temperature, humidity, rainfall);
    console.log("Prediction received:", prediction);

    res.status(200).json({
      status: "success",
      prediction: prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("=== Crop Prediction Failed ===");
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
      error: {
        name: error.name,
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.response?.data : undefined
      },
      timestamp: new Date().toISOString()
    });
  } finally {
    console.log("=== Crop Prediction Completed ===");
  }
};

// Seller Chatbot Controller
const sellerChatbot = async (req, res) => {
  try {
    console.log("=== Chatbot Request Started ===");
    console.log("Request received at:", new Date().toISOString());
    console.log("Request body:", req.body);

    const { message } = req.body;

    // Validate input
    if (!message) {
      console.error("Missing message in request body");
      return res.status(400).json({
        status: "error",
        message: "Message is required",
        timestamp: new Date().toISOString()
      });
    }

    console.log("Processing chat request:", { message });

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not set in environment variables");
    }

    console.log("Making OpenAI API call...");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant for farmers and sellers on FarmConnect. 
          The user is a seller on the platform. Please provide helpful, accurate, and concise responses 
          about selling products, managing orders, handling customer queries, and general farming advice. 
          Focus on being practical and actionable and provide a detailed response. Note: Ensure the following conditions are met: - Altitude should be a numerical value between 0 and 10 (kilometers). - Temperature should be a numerical value between -50 and 50 (degree Celsius). - Humidity should be a numerical value between 0 and 100 (%). - Rainfall should be a numerical value between 0 and 1000 (mm). Ensure that the response contains text only no special characters like asterisks or your conversation in it only the information must be displayed`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    console.log("OpenAI API call successful");
    console.log("Response received:", completion);

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error("No response choices received from OpenAI");
    }

    const response = completion.choices[0].message.content;
    console.log("Final response:", response);

    res.status(200).json({
      status: "success",
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("=== Chatbot Request Failed ===");
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
      error: {
        name: error.name,
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.response?.data : undefined
      },
      timestamp: new Date().toISOString()
    });
  } finally {
    console.log("=== Chatbot Request Completed ===");
  }
};

module.exports = {
  cropPredictor,
  sellerChatbot,
  testOpenAI
};
