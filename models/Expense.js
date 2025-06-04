import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Expense title is required"],
    trim: true,
    minlength: [2, "Title must be at least 2 characters"],
  },
  category: {
    type: String,
    required: [true, "Expense category is required"],
    enum: {
      values: [
        "Rent",
        "Salaries",
        "Ingredients",
        "Utilities",
        "Maintenance",
        "Marketing",
        "Equipment",
        "Licensing",
        "Cleaning Supplies",
        "Taxes",
        "Other",
      ],
      message: "{VALUE} is not a valid expense category",
    },
  },
  amount: {
    type: Number,
    required: [true, "Expense amount is required"],
    min: [0, "Amount cannot be negative"],
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Card", "Bank Transfer", "UPI", "Cheque", "Other"],
    default: "Cash",
  },
  paidTo: {
    type: String,
    trim: true,
  },
  expenseDate: {
    type: Date,
    required: [true, "Expense date is required"],
  },
  attachments: [
    {
      type: String, // You can store filename or full path here
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "Paid", "Disputed"],
    default: "Paid",
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
