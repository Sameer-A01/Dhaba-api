// models/Order.js
import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed',
  },
  value: { type: Number, required: true }, // e.g. 10% or $50
  reason: { type: String },
}, { _id: false }); // no need for _id in embedded object

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  table: { type: mongoose.Schema.Types.ObjectId, required: true },

  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }, // price at time of order
    },
  ],

  discount: { type: discountSchema, default: null },

  totalAmount: { type: Number, required: true }, // after discount
  subTotal: { type: Number, required: true }, // before discount

  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },

  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet'],
    default: 'cash',
  },

  orderDate: { type: Date, default: Date.now },
}, { timestamps: true });

const OrderModel = mongoose.model('Order', orderSchema);
export default OrderModel;