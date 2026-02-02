const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res
        .status(401)
        .json({ message: "🚧 Access denied - no token available" });
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "☹️ Token is wrong" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(404).json({ message: "🕵️ User does not exist" });
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role || decoded.role,
    };
    next();
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
