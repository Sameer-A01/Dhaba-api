import Inventory from "../models/Inventory.js";
import { Usage } from "../models/Inventory.js";

// Create a new inventory item
export const createInventoryItem = async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    await newItem.save();
    res.status(201).json({ message: "Inventory item created successfully", data: newItem });
  } catch (error) {
    console.error("Create Inventory Error:", error);
    res.status(400).json({ message: "Failed to create inventory item", error: error.message });
  }
};

// Get all inventory items
export const getAllInventoryItems = async (req, res) => {
  try {
    const items = await Inventory.find().populate("supplier", "name");
    res.status(200).json(items);
  } catch (error) {
    console.error("Get All Inventory Error:", error);
    res.status(500).json({ message: "Failed to fetch inventory items" });
  }
};

// Get single inventory item by ID
export const getInventoryItemById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id).populate("supplier", "name");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json(item);
  } catch (error) {
    console.error("Get Item By ID Error:", error);
    res.status(500).json({ message: "Failed to fetch item" });
  }
};

// Update inventory item
export const updateInventoryItem = async (req, res) => {
  try {
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedItem) return res.status(404).json({ message: "Item not found" });
    res.status(200).json({ message: "Item updated successfully", data: updatedItem });
  } catch (error) {
    console.error("Update Item Error:", error);
    res.status(400).json({ message: "Failed to update item", error: error.message });
  }
};

// Delete inventory item
export const deleteInventoryItem = async (req, res) => {
  try {
    const deletedItem = await Inventory.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: "Item not found" });
    await Usage.deleteMany({ inventoryItem: req.params.id });
    res.status(200).json({ message: "Item and related usage history deleted successfully" });
  } catch (error) {
    console.error("Delete Item Error:", error);
    res.status(500).json({ message: "Failed to delete item" });
  }
};

// Get items by category
export const getItemsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const items = await Inventory.find({ category });
    res.status(200).json(items);
  } catch (error) {
    console.error("Get Items By Category Error:", error);
    res.status(500).json({ message: "Failed to fetch items" });
  }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.find({ $expr: { $lt: ["$quantity", "$minStockLevel"] } });
    res.status(200).json(items);
  } catch (error) {
    console.error("Get Low Stock Items Error:", error);
    res.status(500).json({ message: "Failed to fetch low stock items" });
  }
};

// Record inventory usage
export const recordInventoryUsage = async (req, res) => {
  try {
    const { inventoryItem, quantityUsed, purpose, user, notes } = req.body;
    const item = await Inventory.findById(inventoryItem);
    if (!item) return res.status(404).json({ message: "Inventory item not found" });

    if (quantityUsed > item.quantity) {
      return res.status(400).json({ message: "Insufficient stock for usage" });
    }

    // Validate user if provided
    if (user) {
      const userExists = await mongoose.model("User").findById(user);
      if (!userExists) return res.status(400).json({ message: "Invalid user ID" });
    }

    const cost = quantityUsed * item.costPerUnit;
    const usage = new Usage({
      inventoryItem,
      quantityUsed,
      purpose,
      user: user || null, // Allow null user
      cost,
      notes,
    });

    item.quantity -= quantityUsed;
    item.lastUsageDate = new Date();
    await Promise.all([usage.save(), item.save()]);

    res.status(201).json({ message: "Usage recorded successfully", data: usage });
  } catch (error) {
    console.error("Record Usage Error:", error);
    res.status(400).json({ message: "Failed to record usage", error: error.message });
  }
};

// Get usage history for an inventory item
export const getUsageHistory = async (req, res) => {
  try {
    const usages = await Usage.find({ inventoryItem: req.params.id })
      .populate("inventoryItem", "name")
      .populate("user", "username");
    res.status(200).json(usages);
  } catch (error) {
    console.error("Get Usage History Error:", error);
    res.status(500).json({ message: "Failed to fetch usage history" });
  }
};

// Get inventory usage statistics
export const getUsageStatistics = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.usageDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (category) {
      const items = await Inventory.find({ category }).select("_id");
      query.inventoryItem = { $in: items.map(item => item._id) };
    }

    const stats = await Usage.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$inventoryItem",
          totalQuantityUsed: { $sum: "$quantityUsed" },
          totalCost: { $sum: "$cost" },
          usageCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "inventories",
          localField: "_id",
          foreignField: "_id",
          as: "item",
        },
      },
      { $unwind: "$item" },
      {
        $project: {
          itemName: "$item.name",
          category: "$item.category",
          totalQuantityUsed: 1,
          totalCost: 1,
          usageCount: 1,
        },
      },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Get Usage Statistics Error:", error);
    res.status(500).json({ message: "Failed to fetch usage statistics" });
  }
};