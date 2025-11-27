const express = require("express");
const { authMiddleware, _ } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/progress", authMiddleware, (req, res) => {
  res.json({ message: "🤸 Progress successfully added", userId: req.user.id });
});

module.exports = router;
