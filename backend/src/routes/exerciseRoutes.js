const express = require("express");
const { validateExercise } = require("../middleware/validationMiddleware");
const router = express.Router();
const {
  createExercise,
  getAllExercises,
} = require("../controllers/exerciseController");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  validateExercise,
  createExercise
);
router.get("/", authenticateJWT, getAllExercises);

module.exports = router;
