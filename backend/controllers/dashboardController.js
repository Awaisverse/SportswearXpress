import dashboardService from "../services/dashboardService.js";
import { createError } from "../utils/error.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res, next) => {
  try {
    console.log("\n=== Getting Dashboard Statistics ===");

    const stats = await dashboardService.getDashboardStats();

    console.log("=== Dashboard Statistics Retrieved Successfully ===\n");
    res.json({ stats });
  } catch (error) {
    console.error("\n=== Dashboard Statistics Error ===");
    console.error("Error:", error);
    console.error("=== End of Error ===\n");

    next(createError(500, error.message));
  }
};
