import Expense from "../models/Expense.js";
import fs from "fs";
import path from "path";

// Create an expense with optional attachments
export const createExpense = async (req, res) => {
  try {
    const attachments = req.files?.map(file => file.path) || [];
    const expenseData = { ...req.body, attachments };

    const newExpense = new Expense(expenseData);
    await newExpense.save();
    res.status(201).json({ message: "Expense created", data: newExpense });
  } catch (error) {
    console.error("Create Expense Error:", error);
    res.status(400).json({ message: "Failed to create expense", error: error.message });
  }
};

// Get all expenses
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ expenseDate: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Get All Expenses Error:", error);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

// Get single expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json(expense);
  } catch (error) {
    console.error("Get Expense Error:", error);
    res.status(500).json({ message: "Failed to fetch expense" });
  }
};

// Update expense (with optional re-uploaded attachments)
export const updateExpense = async (req, res) => {
  try {
    const existingExpense = await Expense.findById(req.params.id);
    if (!existingExpense) return res.status(404).json({ message: "Expense not found" });

    // Optionally delete old attachments if new ones are uploaded
    if (req.files?.length) {
      existingExpense.attachments.forEach(filePath => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    const newAttachments = req.files?.map(file => file.path) || existingExpense.attachments;

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { ...req.body, attachments: newAttachments },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Expense updated", data: updatedExpense });
  } catch (error) {
    console.error("Update Expense Error:", error);
    res.status(400).json({ message: "Failed to update expense", error: error.message });
  }
};

// Delete expense and its attachments
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    // Delete attachments
    expense.attachments.forEach(filePath => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};

// Get monthly summary
export const getMonthlyExpenseSummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ message: "Year and month are required in query" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await Expense.find({
      expenseDate: { $gte: startDate, $lte: endDate },
    });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.status(200).json({ month, year, total, expenses });
  } catch (error) {
    console.error("Monthly Summary Error:", error);
    res.status(500).json({ message: "Failed to get monthly summary" });
  }
};
export const compareMonthlyExpenses = async (req, res) => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth(); // 0-indexed
      const currentYear = currentDate.getFullYear();
  
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
      const getRange = (y, m) => ({
        start: new Date(y, m, 1),
        end: new Date(y, m + 1, 0, 23, 59, 59),
      });
  
      const { start: currentStart, end: currentEnd } = getRange(currentYear, currentMonth);
      const { start: lastStart, end: lastEnd } = getRange(lastMonthYear, lastMonth);
  
      const [currentExpenses, lastExpenses] = await Promise.all([
        Expense.find({ expenseDate: { $gte: currentStart, $lte: currentEnd } }),
        Expense.find({ expenseDate: { $gte: lastStart, $lte: lastEnd } }),
      ]);
  
      const totalCurrent = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalLast = lastExpenses.reduce((sum, e) => sum + e.amount, 0);
  
      const difference = totalCurrent - totalLast;
      const percentageChange = totalLast === 0 ? null : ((difference / totalLast) * 100).toFixed(2);
  
      res.status(200).json({
        currentMonth: { year: currentYear, month: currentMonth + 1, total: totalCurrent },
        lastMonth: { year: lastMonthYear, month: lastMonth + 1, total: totalLast },
        difference,
        percentageChange: percentageChange === null ? "N/A" : `${percentageChange}%`,
      });
    } catch (error) {
      console.error("Compare Monthly Expenses Error:", error);
      res.status(500).json({ message: "Failed to compare monthly expenses" });
    }
  };
  export const getExpensesByDateRange = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
  
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Both startDate and endDate are required" });
      }
  
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the whole end date
  
      const expenses = await Expense.find({
        expenseDate: {
          $gte: start,
          $lte: end,
        },
      }).sort({ expenseDate: 1 });
  
      res.status(200).json({ total: expenses.length, data: expenses });
    } catch (error) {
      console.error("Get Expenses by Date Range Error:", error);
      res.status(500).json({ message: "Failed to fetch expenses for date range" });
    }
  };
    