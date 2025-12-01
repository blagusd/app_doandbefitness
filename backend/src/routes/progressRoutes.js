const express = require("express");
const router = express.Router();
const {
  addProgress,
  getProgress,
} = require("../controllers/progressController");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.post("/", authenticateJWT, authorizeRoles("client"), addProgress);
router.get("/", authenticateJWT, authorizeRoles("client"), getProgress);

module.exports = router;
