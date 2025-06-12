// models/KOT.js
import mongoose from 'mongoose';

const kotSchema = new mongoose.Schema({
  kotNumber: { type: String, required: true, unique: true }, // e.g. "KOT-001"
  tableId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Table ID from Room
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  
  orderItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      specialInstructions: { type: String, default: '' },
    }
  ],

  status: {
    type: String,
    enum: ['preparing', 'ready'],
    default: 'preparing'
  },

  createdBy: {
    type: String,
    enum: ['admin', 'pos', 'self-order-kiosk'],
    required: true
  },

  createdAt: { type: Date, default: Date.now }
});

const KOTModel = mongoose.model('KOT', kotSchema);
export default KOTModel;
