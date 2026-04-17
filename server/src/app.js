const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(",") 
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const inquiryRouter = require("./routes/inquiryRoutes");
const productRouter = require("./routes/productRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const orderRouter = require("./routes/orderRoutes");
const uploadRouter = require("./routes/uploadRoutes");
const sliderRouter = require("./routes/sliderRoutes");
const blogRouter = require("./routes/blogRoutes");
const couponRouter = require("./routes/couponRoutes");
const configRouter = require("./routes/configRoutes");

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/inquiries", inquiryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/uploads", uploadRouter);
app.use("/api/v1/sliders", sliderRouter);
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/config", configRouter);

// Basic Route
app.get("/", (req, res) => {
  res.send("Meili Product Showcase API is running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
