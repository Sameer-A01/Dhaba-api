import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Room from "../models/Room.js";
import KOTModel from "../models/KOT.js"; // Added missing import

const addOrder = async (req, res) => {
  try {
    const { products, discount, roomId, tableId, kotIds } = req.body;
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

    // Validate KOTs if provided
    let validatedKotIds = [];
    if (kotIds && kotIds.length > 0) {
      const kots = await KOTModel.find({ _id: { $in: kotIds } });
      if (kots.length !== kotIds.length) {
        return res.status(404).json({ error: "One or more KOTs not found" });
      }
      validatedKotIds = kotIds;
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
      kots: validatedKotIds, // Use validated KOT IDs
      products: orderItems,
      discount: appliedDiscount,
      subTotal,
      totalAmount
    });

    await order.save();

    // Update KOTs with order reference
    if (validatedKotIds.length > 0) {
      await KOTModel.updateMany(
        { _id: { $in: validatedKotIds } },
        { $set: { order: order._id } }
      );
    }

    // Populate the response with full order details
    const populatedOrder = await Order.findById(order._id)
      .populate('products.product', 'name price')
      .populate('room', 'roomName')
      .populate('user', 'name address')
      .populate({
        path: 'kots',
        select: 'kotNumber status orderItems createdAt',
        populate: {
          path: 'orderItems.product',
          select: 'name price'
        }
      });

    res.status(201).json({ success: true, message: "Order created successfully", order: populatedOrder });
  } catch (error) {
    console.error("Add Order Error:", error.message, error.stack);
    res.status(500).json({ success: false, error: "Server error: " + error.message });
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
        select: 'name price'
      })
      .populate('room', 'roomName')
      .populate('user', 'name address')
      .populate({
        path: 'kots',
        select: 'kotNumber status orderItems createdAt',
        populate: {
          path: 'orderItems.product',
          select: 'name price'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("Get Orders Error:", err.message, err.stack);
    res.status(500).json({ success: false, error: 'Failed to fetch orders: ' + err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('products.product', 'name price stock')
      .populate('room', 'roomName')
      .populate('user', 'name address')
      .populate({
        path: 'kots',
        select: 'kotNumber status orderItems createdAt',
        populate: {
          path: 'orderItems.product',
          select: 'name price'
        }
      });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get Order Error:", error.message, error.stack);
    res.status(500).json({ success: false, error: "Server error: " + error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { products, discount } = req.body;

    // Find the existing order
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // If order is already completed or cancelled, don't allow edits
    if (existingOrder.status === 'completed' || existingOrder.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot edit a completed or cancelled order' 
      });
    }

    // Calculate differences between old and new products
    const oldProducts = existingOrder.products;
    const newProducts = [];

    // First, restore stock for removed products
    for (const oldItem of oldProducts) {
      const product = await Product.findById(oldItem.product);
      if (product) {
        product.stock += oldItem.quantity;
        await product.save();
      }
    }

    // Then process new product quantities
    let subTotal = 0;
    for (const newItem of products) {
      const product = await Product.findById(newItem.productId);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          error: `Product with ID ${newItem.productId} not found` 
        });
      }

      if (newItem.quantity > product.stock) {
        return res.status(400).json({ 
          success: false, 
          error: `Not enough stock for product ${product.name}` 
        });
      }

      product.stock -= newItem.quantity;
      await product.save();

      newProducts.push({
        product: newItem.productId,
        quantity: newItem.quantity,
        price: product.price
      });

      subTotal += product.price * newItem.quantity;
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

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        products: newProducts,
        discount: appliedDiscount,
        subTotal,
        totalAmount,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('products.product', 'name price');

    res.status(200).json({ 
      success: true, 
      message: "Order updated successfully", 
      order: updatedOrder 
    });
  } catch (error) {
    console.error("Update Order Error:", error.message, error.stack);
    res.status(500).json({ success: false, error: "Server error: " + error.message });
  }
};

export { addOrder, getOrders ,updateOrder,getOrderById };