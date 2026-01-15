const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

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
      weightHistory: user.weightHistory || [],
      progressPhotos: user.progressPhotos || {},
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/progress");
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${req.user.id}_${file.fieldname}_${Date.now()}.${ext}`);
  },
});

const upload = multer({ storage });
router.post("/weight", authMiddleware, async (req, res) => {
  try {
    const { weight } = req.body;
    if (!weight || isNaN(weight)) {
      return res.status(400).json({ message: "Invalid weight value" });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.weightHistory.push({ weight: Number(weight) });
    await user.save();
    res.json({ success: true, weightHistory: user.weightHistory });
  } catch (err) {
    res.status(500).json({ message: "Error saving weight", error: err });
  }
});

router.get("/weight", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ weightHistory: user.weightHistory || [] });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching weight history", error: err });
  }
});

router.post(
  "/photos",
  authMiddleware,
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "side", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.progressPhotos) {
        user.progressPhotos = { front: [], side: [], back: [] };
      }

      ["front", "side", "back"].forEach((position) => {
        if (req.files[position]) {
          const filename = req.files[position][0].filename;

          user.progressPhotos[position] = user.progressPhotos[position] || [];
          user.progressPhotos[position].push(`/uploads/progress/${filename}`);
        }
      });

      await user.save();

      res.json({
        success: true,
        progressPhotos: user.progressPhotos,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error uploading photos",
        error: err,
      });
    }
  }
);

router.get("/photos", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ progressPhotos: user.progressPhotos || {} });
  } catch (err) {
    res.status(500).json({ message: "Error fetching photos", error: err });
  }
});

module.exports = router;
