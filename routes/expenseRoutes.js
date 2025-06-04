import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlyExpenseSummary,
  compareMonthlyExpenses,
  getExpensesByDateRange
} from '../controllers/expenseController.js';

const router = express.Router();

// Get all expenses
router.get('/', authMiddleware, getAllExpenses);

// Add new expense with attachments
router.post('/add', authMiddleware, upload.array('attachments', 5), createExpense);

// SPECIFIC ROUTES FIRST - before the :id route
// Monthly summary ?year=2024&month=4
router.get('/summary/month', authMiddleware, getMonthlyExpenseSummary);

// Compare current and last month
router.get('/summary/compare', authMiddleware, compareMonthlyExpenses);

// Filter by date range ?startDate=2024-03-01&endDate=2024-04-15
router.get('/by-date-range', authMiddleware, getExpensesByDateRange);

// DYNAMIC ROUTES WITH PARAMETERS LAST
// Get a single expense by ID
router.get('/:id', authMiddleware, getExpenseById);

// Update expense with optional re-uploads
router.put('/:id', authMiddleware, upload.array('attachments', 5), updateExpense);

// Delete an expense
router.delete('/:id', authMiddleware, deleteExpense);

export default router;