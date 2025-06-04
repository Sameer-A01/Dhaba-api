import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Item name is required"],
    trim: true,
    minlength: [2, "Item name must be at least 2 characters"],
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
    enum: {
      values: [
        "Ingredient",
        "Beverage",
        "Equipment",
        "Cleaning",
        "Packaging",
        "Storage",
        "Other",
      ],
      message: "{VALUE} is not a valid category",
    },
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"],
  },
  unit: {
    type: String,
    required: [true, "Unit is required"],
    trim: true,
    enum: {
      values: [
        "kg",
        "g",
        "l",
        "ml",
        "unit",
        "pack",
        "box",
        "bottle",
        "can",
        "bag",
        "other",
      ],
      message: "{VALUE} is not a valid unit",
    },
  },
  minStockLevel: {
    type: Number,
    required: [true, "Minimum stock level is required"],
    min: [0, "Minimum stock level cannot be negative"],
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supply",
    required: [true, "Supplier is required"],
  },
  costPerUnit: {
    type: Number,
    required: [true, "Cost per unit is required"],
    min: [0, "Cost per unit cannot be negative"],
  },
  expiryDate: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
  reorderFrequency: {
    type: String,
    enum: ["Daily", "Weekly", "Monthly", "As Needed"],
    default: "As Needed",
  },
  storageConditions: {
    type: String,
    enum: ["Refrigerated", "Frozen", "Dry", "Ambient"],
  },
  stockResetDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value >= new Date();
      },
      message: "Stock reset date must be in the future",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the updatedAt field
inventorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
