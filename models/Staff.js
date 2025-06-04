import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Staff name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please enter a valid email"],
  },
  phone: {
    type: String,
    trim: true,

  },
  address: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  role: {
    type: String,
    enum: [
      "Chef",
      "Waiter",
      "Manager",
      "Cleaner",
      "Cashier",
      "Receptionist",
      "Delivery",
      "Kitchen Assistant",
    ],
    default: "Waiter",
  },
  department: {
    type: String,
    enum: [
      "Kitchen",
      "Service",
      "Billing",
      "Cleaning",
      "Reception",
      "Delivery",
      "Management",
    ],
    default: "Service",
  },
  salary: {
    type: Number,
    min: [0, "Salary cannot be negative"],
    default: 0,
  },
  salaryDueDate: {
    type: Date,
    required: [true, "Salary due date is required"],
  },

  status: {
    type: String,
    required: [true, "Status is required"],
    enum: {
      values: ["Active", "On Leave", "Terminated"],
      message: "{VALUE} is not a valid status",
    },
    default: "Active",
  },
  shiftSchedule: [
    {
      day: {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        required: true,
      },
      timeSlots: [
        {
          start: { type: String, required: true }, // e.g., "09:00"
          end: { type: String, required: true },   // e.g., "17:00"
        },
      ],
    },
  ],
  image: {
    type: String, // profile picture URL or filename
    default: null,
  },
  notes: {
    type: String,
    trim: true,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
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

staffSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
