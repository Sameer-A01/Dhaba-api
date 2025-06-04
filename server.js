import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables

// Routers
import authRouter from "./routes/auth.js";
import categoryRouter from "./routes/category.js";
import supplierRouter from "./routes/supplier.js";
import productRouter from "./routes/product.js";
import userRouter from "./routes/user.js";
import orderRouter from "./routes/order.js";
import dashboardRouter from "./routes/dashboard.js";
import supplyRoutes from './routes/supplyRoutes.js';
import staffRoutes from "./routes/staffRoutes.js"; // ✅ Import staff routes
import inventoryRoutes from "./routes/inventoryRoutes.js";
import expenseRoutes from './routes/expenseRoutes.js';
import roomRoutes from './routes/roomRoutes.js';





// DB connection
import connectToMongoDB from "./db/connectToMongoDB.js";

const app = express();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

// Simple GET route for browser access
app.get("/api", (req, res) => {
  res.send("Welcome to the API. Server is running successfully.");
});

// API routes
app.use("/api/dashboard", dashboardRouter);
app.use("/api/auth", authRouter);
app.use("/api/supplier", supplierRouter);
app.use("/api/category", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/order", orderRouter);
app.use('/api/supply', supplyRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/rooms', roomRoutes);
import "./utils/stockResetJob.js";
// Start server
app.listen(process.env.PORT, () => {
  connectToMongoDB();
  console.log(`🚀 Server Running on port ${process.env.PORT}`);
});
