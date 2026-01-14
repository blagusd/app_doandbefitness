const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (admin only)
 */

/**
 * GET /auth/users
 * Admin: get all users
 */
router.get("/users", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find().populate("weeklyPlans");
    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: "Error while getting the users",
      error: err,
    });
  }
});

/**
 * GET /auth/user/:id
 * Fetch single user (used by Dashboard)
 */
router.get("/user/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.id.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      completedWeeks: user.completedWeeks || [],
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching user",
      error: err,
    });
  }
});

/**
 * POST /auth/complete-week/:userId/:weekNumber
 * Mark week completed
 */
router.post(
  "/complete-week/:userId/:weekNumber",
  authMiddleware,
  async (req, res) => {
    try {
      const { userId, weekNumber } = req.params;

      if (req.user.id.toString() !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const week = Number(weekNumber);

      if (!user.completedWeeks.includes(week)) {
        user.completedWeeks.push(week);
        await user.save();
      }

      res.json({
        success: true,
        completedWeeks: user.completedWeeks,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error completing week",
        error: err,
      });
    }
  }
);

module.exports = router;
