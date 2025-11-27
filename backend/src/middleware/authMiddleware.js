const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Expected token at Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res
        .status(401)
        .json({ message: "🚧 Acces denied - no token available" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "☹️ Token is wrong" });

    // Check token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the base to know his role
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(404).json({ message: "🕵️ User does not exist" });

    req.user = user; // save data from token

    next(); // continue on route
  } catch (err) {
    res.status(401).json({ message: "🔴 Invalid token" });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "🚫 Access denied" });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };
