import KOTModel from '../models/KOT.js';
import RoomModel from '../models/Room.js';
import Product from '../models/Product.js';

// Utility to generate sequential KOT numbers like KOT-001, KOT-002, etc.
const generateKOTNumber = async () => {
  const lastKOT = await KOTModel.findOne().sort({ createdAt: -1 });
  const lastNumber = lastKOT ? parseInt(lastKOT.kotNumber?.split('-')[1] || '0', 10) : 0;
  const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
  return `KOT-${nextNumber}`;
};

// Create a new KOT
export const createKOT = async (req, res) => {
  try {
    const { tableId, roomId, orderItems, createdBy } = req.body;

    if (!tableId || !roomId || !orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or empty orderItems' });
    }

    // Validate product IDs exist
    for (const item of orderItems) {
      const exists = await Product.exists({ _id: item.product });
      if (!exists) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
    }

    const kotNumber = await generateKOTNumber();

    const newKOT = new KOTModel({
      kotNumber,
      tableId,
      roomId,
      orderItems,
      createdBy
    });

    await newKOT.save();

    res.status(201).json({ success: true, kot: newKOT });
  } catch (error) {
    console.error('Error creating KOT:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all KOTs
export const getAllKOTs = async (req, res) => {
  try {
    const { status, tableId } = req.query;

    const filter = {};
    if (status) {
      filter.status = { $in: status.split(',') };
    }
    if (tableId) filter.tableId = tableId;

    const kots = await KOTModel.find(filter)
      .populate('roomId', 'roomName')
      .populate('orderItems.product', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, kots });
  } catch (error) {
    console.error('Error fetching KOTs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a single KOT by ID
export const getKOTById = async (req, res) => {
  try {
    const kot = await KOTModel.findById(req.params.id)
      .populate('roomId', 'roomName')
      .populate('orderItems.product', 'name price');

    if (!kot) return res.status(404).json({ success: false, message: 'KOT not found' });

    res.status(200).json({ success: true, kot });
  } catch (error) {
    console.error('Error fetching KOT:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update KOT status
export const updateKOTStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['preparing', 'ready', 'closed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const kot = await KOTModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!kot) return res.status(404).json({ success: false, message: 'KOT not found' });

    res.status(200).json({ success: true, kot });
  } catch (error) {
    console.error('Error updating KOT status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete or Cancel a KOT
export const deleteKOT = async (req, res) => {
  try {
    const kot = await KOTModel.findByIdAndDelete(req.params.id);

    if (!kot) return res.status(404).json({ success: false, message: 'KOT not found' });

    res.status(200).json({ success: true, message: 'KOT deleted successfully' });
  } catch (error) {
    console.error('Error deleting KOT:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Close all KOTs for a table
export const closeKOTsForTable = async (req, res) => {
  try {
    const { tableId } = req.params;

    if (!tableId) {
      return res.status(400).json({ message: 'Table ID is required' });
    }

    const kots = await KOTModel.updateMany(
      { tableId, status: { $in: ['preparing', 'ready'] } },
      { status: 'closed' },
      { new: true }
    );

    res.status(200).json({ success: true, message: `${kots.nModified} KOTs closed successfully` });
  } catch (error) {
    console.error('Error closing KOTs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};