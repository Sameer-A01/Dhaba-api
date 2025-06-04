import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true },
  seatingCapacity: { type: Number, required: true },
  tableType: {
    type: String,
    enum: ['standard', 'booth', 'high-top', 'outdoor'],
    default: 'standard',
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'out-of-service'],
    default: 'available',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { _id: true });

const roomSchema = new mongoose.Schema({
  roomName: { type: String, required: true, unique: true },
  description: String,
  capacity: { type: Number, required: true },
  location: String,
  isActive: { type: Boolean, default: true },
  tables: [tableSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const RoomModel = mongoose.model('Room', roomSchema);
export default RoomModel;
