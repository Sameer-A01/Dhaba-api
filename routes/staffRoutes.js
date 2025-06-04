import express from "express";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, createStaff);
router.get("/", authMiddleware, getAllStaff);
router.get("/:id", authMiddleware, getStaffById);
router.put("/:id", authMiddleware, updateStaff);
router.delete("/:id", authMiddleware, deleteStaff);

export default router;
