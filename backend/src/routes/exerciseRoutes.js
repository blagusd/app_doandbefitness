const express = require("express");
const { validateExercise } = require("../middleware/validationMiddleware");
const router = express.Router();
const {
  createExercise,
  getAllExercises,
} = require("../controllers/exerciseController");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  validateExercise,
  createExercise,
);

router.get("/", authMiddleware, getAllExercises);

module.exports = router;
