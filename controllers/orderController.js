import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Room from "../models/Room.js";

const addOrder = async (req, res) => {
  try {
    const { products, discount, roomId, tableId } = req.body;
    const userId = req.user._id;

    if (!roomId || !tableId) {
      return res.status(400).json({ error: "Room and Table must be selected" });
    }

    // Verify room and table exist
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const table = room.tables.find(t => t._id.toString() === tableId);
    if (!table) {
      return res.status(404).json({ error: "Table not found in selected room" });
    }

    const orderItems = [];
    let subTotal = 0;

    for (let item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({ error: `Not enough stock for product ${product.name}` });
      }

      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        product: item.productId,
        quantity: item.quantity,
        price: product.price
      });

      subTotal += product.price * item.quantity;
    }

    // Apply discount
    let totalAmount = subTotal;
    let appliedDiscount = null;

    if (discount) {
      const { type, value, reason } = discount;
      if (type === 'percentage') {
        totalAmount -= (value / 100) * subTotal;
      } else if (type === 'fixed') {
        totalAmount -= value;
      }
      appliedDiscount = { type, value, reason };
    }

    const order = new Order({
      user: userId,
      room: roomId,
      table: tableId,
      products: orderItems,
      discount: appliedDiscount,
      subTotal,
      totalAmount
    });

    await order.save();

    res.status(201).json({ success: true, message: "Order created successfully", order });
  } catch (error) {
    console.error("Add Order Error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const getOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    let query = {};
    if (userRole === 'user') {
      query = { user: id };
    }

    const orders = await Order.find(query)
      .populate({
        path: 'products.product',
        populate: {
          path: 'category',
          select: 'name'
        },
        select: 'name'
      })
      .populate('room', 'roomName')
      .populate('user', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

export { addOrder, getOrders };
