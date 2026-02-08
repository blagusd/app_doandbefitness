const express = require("express");
const { validateProgressEntry } = require("../middleware/validationMiddleware");
const router = express.Router();
const {
  addProgress,
  getProgress,
} = require("../controllers/progressController");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const User = require("../models/User");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const upload = multer({ dest: "temp/" });

router.post("/", authMiddleware, requireRole("client"), addProgress);

router.get("/", authMiddleware, requireRole("client"), getProgress);

router.post(
  "/steps",
  authMiddleware,
  requireRole("client"),
  async (req, res) => {
    try {
      const { steps } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.stepsHistory) user.stepsHistory = [];

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
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

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
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json(user.stepsHistory || []);
    } catch (err) {
      console.error("Error fetching user steps:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.post(
  "/upload-photo",
  authMiddleware,
  requireRole("client"),
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "progress_photos",
      });

      fs.unlinkSync(req.file.path);

      res.json({ url: result.secure_url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  },
);

module.exports = router;
