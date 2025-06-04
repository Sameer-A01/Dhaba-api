import Supply from "../models/Supply.js";

// Create new supply
const addSupply = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const newSupply = new Supply({ name, email, phone, address });
    const savedSupply = await newSupply.save();

    res.status(201).json({ success: true, message: "Supply added", supply: savedSupply });
  } catch (error) {
    console.error("Add Supply Error:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const getSupplies = async (req, res) => {
  try {
    console.log("🟢 GET /api/supply called");
    const supplies = await Supply.find().sort({ createdAt: -1 });
    console.log("✅ Supplies fetched:", supplies.length);
    res.status(200).json({ success: true, supplies });
  } catch (error) {
    console.error("❌ Get Supplies Error:", error); // log full error
    res.status(500).json({ success: false, error: "Server error: " + error.message });
  }
};

// Update supply
const updateSupply = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const updatedSupply = await Supply.findByIdAndUpdate(
      id,
      { name, email, phone, address },
      { new: true }
    );

    if (!updatedSupply) {
      return res.status(404).json({ success: false, error: "Supply not found" });
    }

    res.status(200).json({ success: true, supply: updatedSupply });
  } catch (error) {
    console.error("Update Supply Error:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete supply
const deleteSupply = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Supply.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Supply not found" });
    }

    res.status(200).json({ success: true, message: "Supply deleted", supply: deleted });
  } catch (error) {
    console.error("Delete Supply Error:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export { addSupply, getSupplies, updateSupply, deleteSupply };
