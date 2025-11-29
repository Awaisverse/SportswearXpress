import Buyer from "../models/Buyer.js";
import Seller from "../models/Seller.js";

class DashboardService {
  async getDashboardStats() {
    try {
      const [
        totalBuyers,
        totalSellers,
        unverifiedSellers,
        activeBuyers,
        activeSellers,
      ] = await Promise.all([
        Buyer.countDocuments(),
        Seller.countDocuments(),
        Seller.countDocuments({ isVerified: false }),
        Buyer.countDocuments({ status: "active" }),
        Seller.countDocuments({ status: "active" }),
      ]);

      return {
        totalBuyers,
        totalSellers,
        unverifiedSellers,
        activeBuyers,
        activeSellers,
        verifiedSellers: totalSellers - unverifiedSellers,
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard statistics: ${error.message}`);
    }
  }
}

export default new DashboardService();
