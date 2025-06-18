import KOTModel from '../models/KOT.js';
import RoomModel from '../models/Room.js';
import Product from '../models/Product.js';
import KOTCounter from '../models/KOTCounter.js';

// Utility to generate daily-reset sequential KOT numbers like KOT-YYYYMMDD-001
const generateKOTNumber = async () => {
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

  const counter = await KOTCounter.findOneAndUpdate(
    { date: formattedDate },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  const paddedNumber = String(counter.count).padStart(3, '0');
  return `KOT-${formattedDate}-${paddedNumber}`;
};

// Create a new KOT
export const createKOT = async (req, res) => {
  try {
    const { tableId, roomId, orderItems, user, createdBy } = req.body;

    if (!tableId || !roomId || !orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or empty orderItems' });
    }

    // Validate roomId and tableId
    const room = await RoomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: `Room not found: ${roomId}` });
    }

    const table = room.tables.find((t) => t._id.toString() === tableId.toString());
    if (!table) {
      return res.status(404).json({ message: `Table ${tableId} not found in room ${roomId}` });
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
      user,
      createdBy,
    });

    await newKOT.save();

    // Update table status to occupied
    await RoomModel.findOneAndUpdate(
      { _id: roomId, 'tables._id': tableId },
      { $set: { 'tables.$.status': 'occupied' } },
      { new: true }
    );

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
      .populate('orderItems.product', 'name price')
      .lean();

    // Enrich KOTs with roomName and tableNumber
    const enrichedKots = await Promise.all(
      kots.map(async (kot) => {
        const room = await RoomModel.findById(kot.roomId).lean();
        const table = room?.tables.find((t) => t._id.toString() === kot.tableId.toString());
        return {
          ...kot,
          roomName: room?.roomName || 'N/A',
          tableNumber: table?.tableNumber || 'N/A',
        };
      })
    );

    res.status(200).json({ success: true, kots: enrichedKots });
  } catch (error) {
    console.error('Error fetching KOTs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a single KOT by ID
export const getKOTById = async (req, res) => {
  try {
    const kot = await KOTModel.findById(req.params.id)
      .populate('orderItems.product', 'name price')
      .lean();

    if (!kot) return res.status(404).json({ success: false, message: 'KOT not found' });

    // Enrich with roomName and tableNumber
    const room = await RoomModel.findById(kot.roomId).lean();
    const table = room?.tables.find((t) => t._id.toString() === kot.tableId.toString());

    const enrichedKot = {
      ...kot,
      roomName: room?.roomName || 'N/A',
      tableNumber: table?.tableNumber || 'N/A',
    };

    res.status(200).json({ success: true, kot: enrichedKot });
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
    console.error('Error updating KOT:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete or Cancel a KOT
export const deleteKOT = async (req, res) => {
  try {
    const kot = await KOTModel.findByIdAndDelete(req.params.id);

    if (!kot) return res.status(404).json({ success: false, message: 'KOT not found' });

    // Check if there are any remaining active KOTs for the table
    const remainingKOTs = await KOTModel.countDocuments({
      tableId: kot.tableId,
      status: { $in: ['preparing', 'ready'] },
    });

    // If no active KOTs remain, set table status to available
    if (remainingKOTs === 0) {
      await RoomModel.findOneAndUpdate(
        { _id: kot.roomId, 'tables._id': kot.tableId },
        { $set: { 'tables.$.status': 'available' } },
        { new: true }
      );
    }

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

    // Set table status to available
    const kot = await KOTModel.findOne({ tableId });
    if (kot) {
      await RoomModel.findOneAndUpdate(
        { _id: kot.roomId, 'tables._id': tableId },
        { $set: { 'tables.$.status': 'available' } },
        { new: true }
      );
    }

    res.status(200).json({ success: true, message: `${kots.modifiedCount} KOTs closed successfully` });
  } catch (error) {
    console.error('Error closing KOTs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// Update KOT details (order items, etc.)
export const updateKOT = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderItems, tableId, roomId, user } = req.body;

    // Find the existing KOT
    const existingKOT = await KOTModel.findById(id);
    if (!existingKOT) {
      return res.status(404).json({ success: false, message: 'KOT not found' });
    }

    // Validate products if orderItems are being updated
    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        const exists = await Product.exists({ _id: item.product });
        if (!exists) {
          return res.status(404).json({ message: `Product not found: ${item.product}` });
        }
      }
    }

    // Validate room and table if they're being changed
    if (roomId || tableId) {
      const newRoomId = roomId || existingKOT.roomId;
      const newTableId = tableId || existingKOT.tableId;

      const room = await RoomModel.findById(newRoomId);
      if (!room) {
        return res.status(404).json({ message: `Room not found: ${newRoomId}` });
      }

      const table = room.tables.find((t) => t._id.toString() === newTableId.toString());
      if (!table) {
        return res.status(404).json({ message: `Table ${newTableId} not found in room ${newRoomId}` });
      }

      // If table is being changed, update table statuses
      if (tableId && tableId !== existingKOT.tableId.toString()) {
        // Set old table to available if no other active KOTs exist
        const oldTableKOTCount = await KOTModel.countDocuments({
          tableId: existingKOT.tableId,
          status: { $in: ['preparing', 'ready'] },
          _id: { $ne: id } // Exclude current KOT
        });

        if (oldTableKOTCount === 0) {
          await RoomModel.findOneAndUpdate(
            { _id: existingKOT.roomId, 'tables._id': existingKOT.tableId },
            { $set: { 'tables.$.status': 'available' } }
          );
        }

        // Set new table to occupied
        await RoomModel.findOneAndUpdate(
          { _id: newRoomId, 'tables._id': newTableId },
          { $set: { 'tables.$.status': 'occupied' } }
        );
      }
    }

    // Prepare update object
    const updateData = {};
    if (orderItems) updateData.orderItems = orderItems;
    if (tableId) updateData.tableId = tableId;
    if (roomId) updateData.roomId = roomId;
    if (user) updateData.user = user;
    updateData.updatedAt = new Date();

    // Update the KOT
    const updatedKOT = await KOTModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('orderItems.product', 'name price');

    res.status(200).json({ success: true, kot: updatedKOT });
  } catch (error) {
    console.error('Error updating KOT:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};