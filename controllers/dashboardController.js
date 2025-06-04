import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Expense from "../models/Expense.js"; // ✅ Add this line

const getSummary = async (req, res) => {
  try {
    // 📦 Total Products
    const totalProducts = await Product.countDocuments({ isDeleted: false });

    // 📦 Total Stock
    const stockResult = await Product.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, totalStock: { $sum: "$stock" } } },
    ]);
    const totalStock = stockResult[0]?.totalStock || 0;

    // 📅 Date Ranges
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 🧾 Orders Today
    const ordersToday = await Order.countDocuments({
      orderDate: { $gte: startOfDay, $lte: endOfDay },
    });

    // 💰 Total Revenue
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const revenue = revenueResult[0]?.totalRevenue || 0;

    // ❌ Out of Stock Products
    const outOfStock = await Product.find({ stock: 0 })
      .select("name category stock")
      .populate("category", "name");

    // 🔝 Highest Sale Product
    const highestSaleResult = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalQuantity: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "product.category",
        },
      },
      { $unwind: "$product.category" },
      {
        $project: {
          name: "$product.name",
          category: "$product.category.name",
          totalQuantity: 1,
        },
      },
    ]);
    const highestSaleProduct =
      highestSaleResult[0] || { message: "No sales data available" };

    // ⚠️ Low Stock Products
    const lowStock = await Product.find({ stock: { $gt: 0, $lt: 5 } })
      .select("name category stock")
      .populate("category", "name");

    // 💸 Expenses Today
    const expensesToday = await Expense.aggregate([
      {
        $match: {
          expenseDate: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const totalExpensesToday = expensesToday[0]?.total || 0;

    // 💸 Expenses This Month
    const expensesThisMonth = await Expense.aggregate([
      {
        $match: {
          expenseDate: { $gte: startOfMonth, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const totalExpensesThisMonth = expensesThisMonth[0]?.total || 0;

    // 📊 Category-wise Expenses
    const categoryWiseExpenses = await Expense.aggregate([
      {
        $match: {
          expenseDate: { $gte: startOfMonth, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          category: "$_id",
          total: 1,
          _id: 0,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // 📦 Combine all data
    const dashboardData = {
      totalProducts,
      totalStock,
      ordersToday,
      revenue,
      outOfStock,
      highestSaleProduct,
      lowStock,
      expenses: {
        today: totalExpensesToday,
        thisMonth: totalExpensesThisMonth,
        byCategory: categoryWiseExpenses,
      },
    };

    return res.status(200).json(dashboardData);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching dashboard summary", error });
  }
};

export { getSummary };
