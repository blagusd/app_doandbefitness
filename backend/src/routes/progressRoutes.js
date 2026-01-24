const StepsProgress = require("../models/Steps");
const express = require("express");
const { validateProgressEntry } = require("../middleware/validationMiddleware");
const router = express.Router();
const {
  addProgress,
  getProgress,
} = require("../controllers/progressController");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const User = require("../models/User");

router.post(
  "/",
  authMiddleware,
  requireRole("client"),
  validateProgressEntry,
  addProgress,
);

router.get("/", authMiddleware, requireRole("client"), getProgress);

router.post(
  "/steps",
  authMiddleware,
  requireRole("client"),
  async (req, res) => {
    console.log("POST /steps HIT");
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);

    try {
      const { steps } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.stepsHistory) {
        user.stepsHistory = [];
      }

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const existing = user.stepsHistory.find((entry) => {
        const entryDate = new Date(entry.date);
        entryDate.setUTCHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      });

      if (existing) {
        existing.steps = steps;
      } else {
        user.stepsHistory.push({ date: today, steps });
      }
      user.markModified("stepsHistory");

      await user.save();

      res.json({ success: true, stepsHistory: user.stepsHistory });
    } catch (err) {
      console.error("Error saving steps:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.get(
  "/steps",
  authMiddleware,
  requireRole("client"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log("Fetching steps for user:", user._id);
      console.log("StepsHistory returned:", user.stepsHistory);

      res.json(user.stepsHistory || []);
    } catch (err) {
      console.error("Error fetching steps:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.get(
  "/steps/:userId",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user.stepsHistory || []);
    } catch (err) {
      console.error("Error fetching user steps:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
