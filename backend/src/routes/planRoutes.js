const express = require("express");
const { validatePlan } = require("../middleware/validationMiddleware");
const router = express.Router();
const { createPlan, getUserPlans } = require("../controllers/planController");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  validatePlan,
  createPlan
);
router.get("/:userId", authenticateJWT, getUserPlans);

module.exports = router;
