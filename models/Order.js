// models/Order.js
import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed',
  },
  value: { type: Number, required: true },
  reason: { type: String },
}, { _id: false });

const deletionInfoSchema = new mongoose.Schema({
  deletedAt: { type: Date, required: true },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // optional for walk-in

  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  table: { type: mongoose.Schema.Types.ObjectId, required: true },

  kots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KOT' }], // NEW FIELD

  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],

  discount: { type: discountSchema, default: null },
  totalAmount: { type: Number, required: true },
  subTotal: { type: Number, required: true },

status: {
  type: String,
  enum: ['pending', 'in-progress', 'completed', 'cancelled', 'deleted'],
  default: 'pending',
},

  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet'],
    default: 'cash',
  },

  orderDate: { type: Date, default: Date.now },
  deletionInfo: { type: deletionInfoSchema }, // New field for deletion tracking
}, { timestamps: true });

const OrderModel = mongoose.model('Order', orderSchema);
export default OrderModel;
