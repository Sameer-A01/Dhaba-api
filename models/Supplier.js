import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Chef name is required"],
      trim: true,
    },

    specialization: {
      type: String,
      trim: true,
      enum: {
        values: ["Head Chef", "Sous Chef", "Pastry Chef", "Grill Chef", "Prep Chef", "Other"],
        message: "{VALUE} is not a valid specialization",
      },
    },

    experienceYears: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      default: 0,
    },

    availability: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        },
        status: {
          type: String,
          enum: {
            values: ["Active", "On Leave", "Terminated"],
            message: "{VALUE} is not a valid status",
          },
          default: "Active",
        },
      },
    ],

    profilePicture: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema); // Still using 'Supplier' model name
export default Supplier;
