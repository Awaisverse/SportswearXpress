import jwt from "jsonwebtoken";

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token.substring(0, 20) + "...");

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      if (!decoded || !decoded.id) {
        console.error("Invalid token structure:", decoded);
        return res.status(401).json({
          success: false,
          message: "Invalid token structure",
        });
      }

      // Get user from the token
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
      console.log("Set user in request:", req.user);

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }
      res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
        error: error.message,
      });
    }
  } else {
    console.error("No authorization header found");
    res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

// Admin middleware
export const admin = (req, res, next) => {
  console.log("Admin middleware - req.user:", req.user);
  console.log("Admin middleware - req.user.role:", req.user?.role);

  if (req.user && req.user.role === "admin") {
    console.log("Admin access granted");
    next();
  } else {
    console.log("Admin access denied");
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};

// Seller middleware
export const seller = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as a seller" });
  }
};

// Buyer middleware
export const buyer = (req, res, next) => {
  if (req.user && req.user.role === "buyer") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as a buyer" });
  }
};
