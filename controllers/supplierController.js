import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Import fileURLToPath
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";

// Get the current directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route to add a new Chef (Supplier)
const addSupplier = async (req, res) => {
  try {
    const {
      name,
      specialization,
      experienceYears,
      availability,
      notes,
    } = req.body;

    const profilePicture = req.file ? req.file.filename : null;

    const newSupplier = new Supplier({
      name,
      specialization,
      experienceYears,
      availability: availability ? JSON.parse(availability) : [],
      notes,
      profilePicture: profilePicture || undefined
    });

    const supplier = await newSupplier.save();

    res.status(201).json({
      success: true,
      message: "Chef created successfully",
      supplier,
    });
  } catch (error) {
    console.error("Add Supplier Error:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all Chefs
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json({ success: true, suppliers });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error " + error.message });
  }
};

// Update Chef details
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      specialization,
      experienceYears,
      availability,
      notes,
    } = req.body;

    const profilePicture = req.file ? req.file.filename : null;

    const updatedFields = {
      name,
      specialization,
      experienceYears,
      notes,
    };

    if (availability) {
      updatedFields.availability = JSON.parse(availability);
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ success: false, error: "Supplier not found" });
    }

    // If a new profile picture is uploaded, delete the old one
    if (profilePicture) {
      updatedFields.profilePicture = profilePicture;

      // Delete old image if it exists
      if (supplier.profilePicture) {
        const oldImagePath = path.join(__dirname, "../uploads", supplier.profilePicture);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Error deleting old image:", err);
            return res.status(500).json({ success: false, error: "Error deleting old image" });
          }
        });
      }
    }

    // If removeImage is true, delete the current image and set profilePicture to null
    if (req.body.removeImage === "true") {
      if (supplier.profilePicture) {
        const oldImagePath = path.join(__dirname, "../uploads", supplier.profilePicture);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Error deleting removed image:", err);
            return res.status(500).json({ success: false, error: "Error deleting removed image" });
          }
        });
      }
      updatedFields.profilePicture = null;
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!updatedSupplier) {
      return res.status(404).json({ success: false, error: "Chef not found" });
    }

    res.status(200).json({ success: true, updatedSupplier });
  } catch (error) {
    console.error("Update Supplier Error:", error.message);
    res.status(500).json({ success: false, error: "Server error: " + error.message });
  }
};

// Delete Chef
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const productCount = await Product.countDocuments({ supplier: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete chef with associated products",
      });
    }

    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      return res.status(404).json({ success: false, error: "Chef not found" });
    }

    res.status(200).json({ success: true, supplier });
  } catch (error) {
    console.error("Delete Supplier Error:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export { addSupplier, getSuppliers, updateSupplier, deleteSupplier };
