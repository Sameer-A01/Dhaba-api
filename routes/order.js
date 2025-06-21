import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js'
import { addOrder, getOrders ,getOrderById, updateOrder, deleteOrder,getDeletedOrders} from '../controllers/orderController.js';

const router = express.Router();

router.get('/:id', authMiddleware, getOrders);
router.post('/add', authMiddleware, addOrder);
router.get('/single/:id', authMiddleware, getOrderById);
router.put('/update/:id', authMiddleware, updateOrder);
router.delete('/delete/:id', authMiddleware, deleteOrder); // New delete route
router.get('/deletions/history', authMiddleware, getDeletedOrders);

export default router 