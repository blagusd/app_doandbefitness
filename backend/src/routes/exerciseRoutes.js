const express = require("express");
const router = express.Router();
const {
  createExercise,
  getAllExercises,
} = require("../controllers/exerciseController");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.post("/", authenticateJWT, authorizeRoles("admin"), createExercise);
router.get("/", authenticateJWT, getAllExercises);

module.exports = router;
