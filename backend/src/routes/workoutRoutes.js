const express = require("express");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const router = express.Router();

// Only trainer can add plan
router.post("/plans", authMiddleware, requireRole("admin"), (req, res) => {
  res.json({ message: "Plan created by trainer", trainerId: req.user._id });
});

// Client can add progress
router.post("/progress", authMiddleware, requireRole("client"), (req, res) => {
  res.json({ message: "Progress added by client", clientId: req.user._id });
});

module.exports = router;
