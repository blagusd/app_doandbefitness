const express = require("express");
const router = express.Router();
const { createPlan, getUserPlans } = require("../controllers/planController");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.post("/", authenticateJWT, authorizeRoles("admin"), createPlan);
router.get("/:userId", authenticateJWT, getUserPlans);

module.exports = router;
