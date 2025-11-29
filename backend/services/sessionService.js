import Session from "../models/Session.js";
import { UAParser } from "ua-parser-js";

class SessionService {
  static async createSession(userId, userType, token, req) {
    const ua = new UAParser(req.headers["user-agent"]);
    const browser = ua.getBrowser();
    const os = ua.getOS();
    const device = ua.getDevice();

    const session = new Session({
      userId,
      userType,
      token,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip || req.connection.remoteAddress,
      deviceType: device.type || "desktop",
      browser: `${browser.name} ${browser.version}`,
      os: `${os.name} ${os.version}`,
      isActive: true,
      loginAt: new Date(),
      lastActivity: new Date(),
    });

    await session.save();
    return session;
  }

  static async deactivateSession(token) {
    const session = await Session.findOne({ token });
    if (session) {
      session.isActive = false;
      session.logoutAt = new Date();
      await session.save();
    }
    return session;
  }

  static async updateLastActivity(token) {
    const session = await Session.findOne({ token });
    if (session) {
      session.lastActivity = new Date();
      await session.save();
    }
    return session;
  }

  static async getUserSessions(userId, userType) {
    return await Session.find({ userId, userType })
      .sort({ loginAt: -1 })
      .limit(10);
  }

  static async getActiveSessions(userId, userType) {
    return await Session.find({ userId, userType, isActive: true });
  }

  static async validateSession(token) {
    const session = await Session.findOne({ token, isActive: true });
    if (session) {
      // Update last activity
      session.lastActivity = new Date();
      await session.save();
      return true;
    }
    return false;
  }
}

export default SessionService;
