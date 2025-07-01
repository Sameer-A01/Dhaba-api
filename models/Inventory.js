import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
    required: [true, "Inventory item is required"],
  },
  quantityUsed: {
    type: Number,
    required: [true, "Quantity used is required"],
    min: [0, "Quantity used cannot be negative"],
  },
  purpose: {
    type: String,
    required: [true, "Purpose of usage is required"],
    trim: true,
    enum: {
      values: ["Production", "Maintenance", "Testing", "Waste", "Other"],
      message: "{VALUE} is not a valid purpose",
    },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // Removed required constraint to make user optional
  },
  cost: {
    type: Number,
    required: [true, "Cost is required"],
    min: [0, "Cost cannot be negative"],
  },
  usageDate: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  },
});

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
  lastUsageDate: {
    type: Date,
  },
  averageDailyUsage: {
    type: Number,
    default: 0,
  },
  reorderAlert: {
    type: Boolean,
    default: false,
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

// Calculate average daily usage based on usage history
inventorySchema.methods.calculateAverageDailyUsage = async function () {
  const usages = await mongoose.model("Usage").find({ inventoryItem: this._id });
  if (usages.length === 0) return 0;

  const totalQuantity = usages.reduce((sum, usage) => sum + usage.quantityUsed, 0);
  const firstUsageDate = usages[0].usageDate;
  const days = (new Date() - firstUsageDate) / (1000 * 60 * 60 * 24);
  return days > 0 ? totalQuantity / days : totalQuantity;
};

// Check if reorder alert should be triggered
inventorySchema.pre("save", async function (next) {
  if (this.quantity <= this.minStockLevel) {
    this.reorderAlert = true;
  } else {
    this.reorderAlert = false;
  }
  this.averageDailyUsage = await this.calculateAverageDailyUsage();
  next();
});

const Inventory = mongoose.model("Inventory", inventorySchema);
const Usage = mongoose.model("Usage", usageSchema);

export default Inventory;
export { Usage };