import cron from "node-cron";
import Inventory from "../models/Inventory.js"; // Default import

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
      {
        $set: {
          quantity: "$minStockLevel", // Reset to minStockLevel
          stockResetDate: null, // Clear the reset date
          updatedAt: new Date(),
        },
      }
    );

    console.log(
      `[${new Date().toLocaleString()}] Stock reset complete for ${updatedItems.modifiedCount} items.`
    );
  } catch (error) {
    console.error("Error during stock reset:", error);
  }
});

// Export a function to start the job (optional, for explicit control)
export const startStockResetJob = () => {
  console.log("Stock reset job scheduled.");
};

export default startStockResetJob;