import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import {
  addSupply,
  getSupplies,
  updateSupply,
  deleteSupply,
} from '../controllers/supplyController.js';

const router = express.Router();

// GET all supplies
router.get('/', authMiddleware, getSupplies);

// POST /api/supply/add
router.post('/add', authMiddleware, addSupply);

// PUT /api/supply/:id
router.put('/:id', authMiddleware, updateSupply);

// DELETE /api/supply/:id
router.delete('/:id', authMiddleware, deleteSupply);

export default router;
