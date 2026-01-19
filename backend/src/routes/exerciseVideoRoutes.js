const express = require("express");
const router = express.Router();
const ExerciseVideo = require("../models/ExerciseVideo");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

// GET videos by category (user + admin)
router.get("/:category", authMiddleware, async (req, res) => {
  try {
    const videos = await ExerciseVideo.find({ category: req.params.category });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: "Error fetching videos", error: err });
  }
});

// ADMIN: add video
router.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { title, youtubeUrl, category } = req.body;

    const video = await ExerciseVideo.create({
      title,
      youtubeUrl,
      category,
    });

    res.json(video);
  } catch (err) {
    res.status(500).json({ message: "Error adding video", error: err });
  }
});

// ADMIN: edit video
router.put("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const updated = await ExerciseVideo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating video", error: err });
  }
});

// ADMIN: delete video
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      await ExerciseVideo.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Error deleting video", error: err });
    }
  },
);

module.exports = router;
