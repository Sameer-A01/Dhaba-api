import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import { addOrder, getOrders ,getOrderById, updateOrder} from '../controllers/orderController.js';

const router = express.Router();

router.get('/:id', authMiddleware, getOrders);
router.post('/add', authMiddleware, addOrder);
router.get('/single/:id', authMiddleware, getOrderById);
router.put('/update/:id', authMiddleware, updateOrder);

export default router 