import Inventory from "../models/Inventory.js";

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
    res.status(200).json({ message: "Item deleted successfully" });
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
