require("./config/connectDB.js");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const { setupWebSocket } = require("./services/setupWebSocket");

const product = require("./routes/product");
const review = require("./routes/review");
const order = require("./routes/order");
const faq = require("./routes/faq");
const graph = require("./routes/graph.js");
const ai = require("./routes/ai.js");
const auth = require("./routes/auth");
const admin = require("./routes/admin");

const PORT = 8080;
const app = express();

// Middleware
app.use(cors({
  origin: "*",
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const server = http.createServer(app);
const io = new Server(server);

setupWebSocket(io);

// Health Check
app.get("/", (req, res) => {
  res.send("FarmConnect Server is running");
});

// Routes
app.use("/products", product);
app.use("/reviews", review);
app.use("/order", order);
app.use("/faqs", faq);
app.use("/graph", graph);
app.use("/ai", ai);
app.use("/auth", auth);
app.use("/admin", admin);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query
  });

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.url} not found`
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
});
