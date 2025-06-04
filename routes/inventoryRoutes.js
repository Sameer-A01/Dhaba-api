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
} from "../controllers/inventoryController.js";

const router = express.Router();

// Create new inventory item
router.post("/add", authMiddleware, createInventoryItem);

// Get all inventory items
router.get("/", authMiddleware, getAllInventoryItems);

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

export default router;
