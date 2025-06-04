import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import upload from '../middleware/upload.js'; // Import multer config
import {addProduct, getProducts, updateProduct, deleteProduct} from '../controllers/productController.js';


const router = express.Router();

router.post('/add', authMiddleware, upload.single('image'), addProduct);
router.get('/', authMiddleware, getProducts);
router.put('/:id', authMiddleware, upload.single('image'), updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;