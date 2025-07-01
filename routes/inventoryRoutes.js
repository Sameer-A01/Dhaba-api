import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createInventoryItem,
  getAllInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  getItemsByCategory,
  getLowStockItems,
  recordInventoryUsage,
  getUsageHistory,
  getUsageStatistics,
} from "../controllers/inventoryController.js";

const router = express.Router();

// Create new inventory item
router.post("/add", authMiddleware, createInventoryItem);

// Get all inventory items
router.get("/", authMiddleware, getAllInventoryItems);

// Get usage statistics (moved before /:id)
router.get("/usage-statistics", authMiddleware, getUsageStatistics);

// Get usage history for an item
router.get("/usage/:id", authMiddleware, getUsageHistory);

// Get inventory item by ID
router.get("/:id", authMiddleware, getInventoryItemById);

// Update inventory item by ID
router.put("/:id", authMiddleware, updateInventoryItem);

// Delete inventory item by ID
router.delete("/:id", authMiddleware, deleteInventoryItem);

// Get inventory items by category
router.get("/category/:category", authMiddleware, getItemsByCategory);

// Get low-stock items
router.get("/low-stock/items", authMiddleware, getLowStockItems);

// Record inventory usage
router.post("/usage", authMiddleware, recordInventoryUsage);

export default router;