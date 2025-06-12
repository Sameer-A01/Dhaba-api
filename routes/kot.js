import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  createKOT,
  getAllKOTs,
  getKOTById,
  updateKOTStatus,
  deleteKOT,
  closeKOTsForTable
} from '../controllers/KOTController.js';

const router = express.Router();

// @route   GET /api/kot/
// @desc    Get all KOTs
router.get('/', authMiddleware, getAllKOTs);

// @route   POST /api/kot/add
// @desc    Create a new KOT
router.post('/add', authMiddleware, createKOT);

// @route   GET /api/kot/:id
// @desc    Get a single KOT by ID
router.get('/:id', authMiddleware, getKOTById);

// @route   PUT /api/kot/:id/status
// @desc    Update KOT status
router.put('/:id/status', authMiddleware, updateKOTStatus);

// @route   DELETE /api/kot/:id
// @desc    Delete/cancel a KOT
router.delete('/:id', authMiddleware, deleteKOT);

// @route   PUT /api/kot/close/:tableId
// @desc    Close all KOTs for a table
router.put('/close/:tableId', authMiddleware, closeKOTsForTable);

export default router;