import RoomModel from '../models/Room.js';
import mongoose from 'mongoose';

export const createRoom = async (req, res) => {
  try {
    const { roomName, description, capacity, location, tables } = req.body;
    const room = new RoomModel({ roomName, description, capacity, location, tables });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await RoomModel.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await RoomModel.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const updatedRoom = await RoomModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRoom) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await RoomModel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json({ message: 'Room deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addTable = async (req, res) => {
  try {
    const room = await RoomModel.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.tables.push(req.body);
    await room.save();
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTable = async (req, res) => {
  try {
    const room = await RoomModel.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const table = room.tables.id(req.params.tableId);
    if (!table) return res.status(404).json({ message: 'Table not found' });

    Object.assign(table, req.body);
    await room.save();
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const { roomId, tableId } = req.params;
    const room = await RoomModel.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const tableIndex = room.tables.findIndex(t => t._id.toString() === tableId);
    if (tableIndex === -1) {
      return res.status(404).json({ message: 'Table not found in this room' });
    }

    // Remove the table by splicing
    room.tables.splice(tableIndex, 1);
    await room.save();

    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Delete Table Error:', error);
    res.status(500).json({ message: 'Server error while deleting table' });
  }
};

