import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  addTable,
  updateTable,
  deleteTable
} from '../controllers/roomController.js';

const router = express.Router();

router.get('/', authMiddleware, getAllRooms);
router.get('/:id', authMiddleware, getRoomById);
router.post('/add', authMiddleware, createRoom);
router.put('/:id', authMiddleware, updateRoom);
router.delete('/:id', authMiddleware, deleteRoom);

// Table routes nested under a room
router.post('/:id/tables/add', authMiddleware, addTable);

router.put('/:roomId/tables/:tableId', authMiddleware, updateTable);
router.delete('/:roomId/tables/:tableId', authMiddleware, deleteTable);

export default router;
