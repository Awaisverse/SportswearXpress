import jwt from "jsonwebtoken";
import SessionService from "../services/sessionService.js";

const sessionMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate session
    const isValidSession = await SessionService.validateSession(token);
    if (!isValidSession) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    // Add user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default sessionMiddleware;
