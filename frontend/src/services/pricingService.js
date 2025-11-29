// Pricing Service for Customized Products
// Handles dynamic pricing based on print quality, complexity, and other factors

// Print Quality Multipliers
export const PRINT_QUALITY_MULTIPLIERS = {
  embroidery: 2.5, // Premium stitched finish
  dtg: 1.0, // Standard digital printing
  sublimation: 1.8, // High-quality dye transfer
  screen: 1.2, // Traditional screen printing
  plastisol: 1.5, // Heat transfer with plastisol
  htv: 1.3, // Heat transfer vinyl
};

// Complexity Multipliers
export const COMPLEXITY_MULTIPLIERS = {
  text: 1.0, // Simple text elements
  shape: 1.2, // Geometric shapes
  image: 1.5, // Complex image processing
};

// Base Prices
export const BASE_PRICES = {
  element: 5, // Base price per element
  setup: 10, // Setup fee for customization
  rush: 15, // Rush order fee
};

// Print Quality Display Names
export const PRINT_QUALITY_NAMES = {
  embroidery: "Embroidery",
  dtg: "DTG Printing",
  sublimation: "Sublimation",
  screen: "Screen Printing",
  plastisol: "Plastisol Transfers",
  htv: "HTV",
};

// Print Quality Descriptions
export const PRINT_QUALITY_DESCRIPTIONS = {
  embroidery: "Stitched design, premium finish",
  dtg: "Direct to garment printing",
  sublimation: "High-quality dye transfer",
  screen: "Traditional screen printing",
  plastisol: "Heat transfer with plastisol",
  htv: "Heat transfer vinyl",
};

/**
 * Calculate price for a single element
 * @param {Object} element - Element object with type and printQuality
 * @returns {Object} Pricing breakdown for the element
 */
export const calculateElementPrice = (element) => {
  const basePrice = BASE_PRICES.element;
  const printMultiplier =
    PRINT_QUALITY_MULTIPLIERS[element.printQuality] || 1.0;
  const complexityMultiplier = COMPLEXITY_MULTIPLIERS[element.type] || 1.0;

  const totalPrice = basePrice * printMultiplier * complexityMultiplier;

  return {
    basePrice,
    printQualityMultiplier: printMultiplier,
    complexityMultiplier,
    totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
    printQualityName:
      PRINT_QUALITY_NAMES[element.printQuality] || element.printQuality,
    printQualityDescription:
      PRINT_QUALITY_DESCRIPTIONS[element.printQuality] || "",
  };
};

/**
 * Calculate total customization price
 * @param {Array} elements - Array of element objects
 * @returns {Object} Total pricing breakdown
 */
export const calculateCustomizationPrice = (elements) => {
  if (!elements || elements.length === 0) {
    return {
      totalPrice: 0,
      elementCount: 0,
      elementBreakdown: [],
      printQualitySummary: {},
    };
  }

  const elementBreakdown = elements.map((element) => {
    const pricing = calculateElementPrice(element);
    return {
      elementId: element.id,
      elementType: element.type,
      printQuality: element.printQuality,
      ...pricing,
    };
  });

  const totalPrice = elementBreakdown.reduce(
    (sum, element) => sum + element.totalPrice,
    0
  );

  // Create print quality summary
  const printQualitySummary = {};
  elementBreakdown.forEach((element) => {
    if (!printQualitySummary[element.printQuality]) {
      printQualitySummary[element.printQuality] = {
        count: 0,
        totalPrice: 0,
        name: element.printQualityName,
      };
    }
    printQualitySummary[element.printQuality].count++;
    printQualitySummary[element.printQuality].totalPrice += element.totalPrice;
  });

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    elementCount: elements.length,
    elementBreakdown,
    printQualitySummary,
  };
};

/**
 * Calculate total product price including customization
 * @param {number} baseProductPrice - Base product price
 * @param {Array} elements - Array of element objects
 * @param {Object} options - Additional options (rush, setup, etc.)
 * @returns {Object} Complete pricing breakdown
 */
export const calculateTotalPrice = (
  baseProductPrice,
  elements,
  options = {}
) => {
  const customizationPricing = calculateCustomizationPrice(elements);

  let additionalFees = 0;
  const feeBreakdown = {};

  // Add setup fee if this is the first customization
  if (options.includeSetup && elements.length > 0) {
    additionalFees += BASE_PRICES.setup;
    feeBreakdown.setup = BASE_PRICES.setup;
  }

  // Add rush fee if requested
  if (options.rushOrder) {
    additionalFees += BASE_PRICES.rush;
    feeBreakdown.rush = BASE_PRICES.rush;
  }

  const totalPrice =
    baseProductPrice + customizationPricing.totalPrice + additionalFees;

  return {
    baseProductPrice,
    customizationPrice: customizationPricing.totalPrice,
    additionalFees,
    feeBreakdown,
    totalPrice: Math.round(totalPrice * 100) / 100,
    elementCount: customizationPricing.elementCount,
    elementBreakdown: customizationPricing.elementBreakdown,
    printQualitySummary: customizationPricing.printQualitySummary,
  };
};

/**
 * Get print quality options for display
 * @returns {Array} Array of print quality objects
 */
export const getPrintQualityOptions = () => {
  return Object.entries(PRINT_QUALITY_MULTIPLIERS).map(([id, multiplier]) => ({
    id,
    name: PRINT_QUALITY_NAMES[id],
    description: PRINT_QUALITY_DESCRIPTIONS[id],
    multiplier,
    basePrice: BASE_PRICES.element,
    samplePrice: Math.round(BASE_PRICES.element * multiplier * 100) / 100,
  }));
};

/**
 * Validate element pricing
 * @param {Object} element - Element to validate
 * @returns {Object} Validation result
 */
export const validateElementPricing = (element) => {
  const errors = [];

  if (!element.type) {
    errors.push("Element type is required");
  }

  if (!element.printQuality) {
    errors.push("Print quality is required");
  }

  if (!PRINT_QUALITY_MULTIPLIERS[element.printQuality]) {
    errors.push(`Invalid print quality: ${element.printQuality}`);
  }

  if (!COMPLEXITY_MULTIPLIERS[element.type]) {
    errors.push(`Invalid element type: ${element.type}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get pricing recommendations based on element type
 * @param {string} elementType - Type of element (text, shape, image)
 * @returns {Array} Recommended print qualities for the element type
 */
export const getPricingRecommendations = (elementType) => {
  const recommendations = {
    text: [
      {
        printQuality: "dtg",
        reason: "Best for text clarity and cost-effectiveness",
      },
      {
        printQuality: "embroidery",
        reason: "Premium finish for important text",
      },
      { printQuality: "screen", reason: "Good for large quantities" },
    ],
    shape: [
      { printQuality: "dtg", reason: "Good for simple shapes" },
      { printQuality: "screen", reason: "Best for geometric shapes" },
      { printQuality: "embroidery", reason: "Premium finish for logos" },
    ],
    image: [
      { printQuality: "dtg", reason: "Best for photo-quality images" },
      {
        printQuality: "sublimation",
        reason: "Excellent for full-color designs",
      },
      { printQuality: "screen", reason: "Good for simple graphics" },
    ],
  };

  return recommendations[elementType] || [];
};

/**
 * Calculate bulk discount
 * @param {number} elementCount - Number of elements
 * @param {number} basePrice - Base price before discount
 * @returns {Object} Discount information
 */
export const calculateBulkDiscount = (elementCount, basePrice) => {
  let discountPercentage = 0;

  if (elementCount >= 10) {
    discountPercentage = 15;
  } else if (elementCount >= 5) {
    discountPercentage = 10;
  } else if (elementCount >= 3) {
    discountPercentage = 5;
  }

  const discountAmount = (basePrice * discountPercentage) / 100;
  const finalPrice = basePrice - discountAmount;

  return {
    discountPercentage,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    elementCount,
  };
};

/**
 * Format price for display
 * @param {number} price - Price to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(price);
};

/**
 * Get pricing statistics
 * @param {Array} elements - Array of elements
 * @returns {Object} Pricing statistics
 */
export const getPricingStats = (elements) => {
  if (!elements || elements.length === 0) {
    return {
      totalElements: 0,
      averagePrice: 0,
      mostExpensivePrintQuality: null,
      leastExpensivePrintQuality: null,
      totalCost: 0,
    };
  }

  const elementPrices = elements.map((element) =>
    calculateElementPrice(element)
  );
  const totalCost = elementPrices.reduce(
    (sum, element) => sum + element.totalPrice,
    0
  );
  const averagePrice = totalCost / elements.length;

  // Find most and least expensive print qualities
  const printQualityCosts = {};
  elementPrices.forEach((element) => {
    if (!printQualityCosts[element.printQuality]) {
      printQualityCosts[element.printQuality] = 0;
    }
    printQualityCosts[element.printQuality] += element.totalPrice;
  });

  const printQualityEntries = Object.entries(printQualityCosts);
  const mostExpensive = printQualityEntries.reduce((max, current) =>
    current[1] > max[1] ? current : max
  );
  const leastExpensive = printQualityEntries.reduce((min, current) =>
    current[1] < min[1] ? current : min
  );

  return {
    totalElements: elements.length,
    averagePrice: Math.round(averagePrice * 100) / 100,
    mostExpensivePrintQuality: mostExpensive ? mostExpensive[0] : null,
    leastExpensivePrintQuality: leastExpensive ? leastExpensive[0] : null,
    totalCost: Math.round(totalCost * 100) / 100,
    printQualityBreakdown: printQualityCosts,
  };
};

export default {
  calculateElementPrice,
  calculateCustomizationPrice,
  calculateTotalPrice,
  getPrintQualityOptions,
  validateElementPricing,
  getPricingRecommendations,
  calculateBulkDiscount,
  formatPrice,
  getPricingStats,
  PRINT_QUALITY_MULTIPLIERS,
  COMPLEXITY_MULTIPLIERS,
  BASE_PRICES,
  PRINT_QUALITY_NAMES,
  PRINT_QUALITY_DESCRIPTIONS,
};
