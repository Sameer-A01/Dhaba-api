import cron from "node-cron";
import Inventory from "../models/Inventory.js";

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const updatedItems = await Inventory.updateMany(
      {
        stockResetDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
      { $set: { quantity: 0 } }
    );

    console.log(
      `[${new Date().toLocaleString()}] Stock reset complete for ${updatedItems.modifiedCount} items.`
    );
  } catch (error) {
    console.error("Error during stock reset:", error);
  }
});
