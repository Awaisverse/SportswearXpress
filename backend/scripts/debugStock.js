import mongoose from "mongoose";
import Product from "../models/Product.js";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const debugStock = async () => {
  try {
    console.log("=== Stock Debug Report ===");

    const products = await Product.find({});
    console.log(`Total products found: ${products.length}`);

    let totalInconsistencies = 0;

    for (const product of products) {
      if (product.variants && product.variants.stockByVariant) {
        const calculatedStock = product.variants.stockByVariant.reduce(
          (sum, variant) => sum + (variant.stock || 0),
          0
        );

        if (product.stock !== calculatedStock) {
          totalInconsistencies++;
          console.log(`\n❌ Inconsistency found in product: ${product.name}`);
          console.log(`   Product ID: ${product._id}`);
          console.log(`   Product stock field: ${product.stock}`);
          console.log(`   Calculated from variants: ${calculatedStock}`);
          console.log(`   Difference: ${product.stock - calculatedStock}`);
          console.log(`   Variants:`, product.variants.stockByVariant);

          // Fix the inconsistency
          product.stock = calculatedStock;
          await product.save();
          console.log(`   ✅ Fixed: product stock now ${product.stock}`);
        } else {
          console.log(
            `✅ ${product.name}: Stock consistent (${product.stock})`
          );
        }
      } else {
        console.log(`ℹ️  ${product.name}: No variants found`);
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total products: ${products.length}`);
    console.log(`Inconsistencies found and fixed: ${totalInconsistencies}`);

    // Calculate total stock
    const totalStock = products.reduce((sum, product) => {
      if (product.variants && product.variants.stockByVariant) {
        return (
          sum +
          product.variants.stockByVariant.reduce(
            (variantSum, variant) => variantSum + (variant.stock || 0),
            0
          )
        );
      }
      return sum + (product.stock || 0);
    }, 0);

    console.log(`Total stock across all products: ${totalStock}`);
  } catch (error) {
    console.error("Error in debug script:", error);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

debugStock();
