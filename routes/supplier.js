import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js'; // import the multer config
import {
  addSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplierController.js';

const router = express.Router();

// Use upload.single for handling image upload (profilePicture field)
router.post('/add', authMiddleware, upload.single('profilePicture'), addSupplier);
router.get('/', authMiddleware, getSuppliers);
router.put('/:id', authMiddleware, upload.single('profilePicture'), updateSupplier);
router.delete('/:id', authMiddleware, deleteSupplier);

export default router;
