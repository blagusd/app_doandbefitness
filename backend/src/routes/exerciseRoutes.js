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

/**
 * @swagger
 * tags:
 *   name: Exercises
 *   description: Exercise control
 */

/**
 * @swagger
 * /api/exercises:
 *   post:
 *     summary: Creation of new exercise (admin only)
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bench Press
 *               description:
 *                 type: string
 *                 example: Chest exercise with load
 *               muscleGroup:
 *                 type: string
 *                 example: Chest
 *               difficulty:
 *                 type: string
 *                 example: Intermediate
 *     responses:
 *       201:
 *         description: Exercise successfully created
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: User not authorized
 *       403:
 *         description: Only admin can create exercise
 */
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  validateExercise,
  createExercise
);

/**
 * @swagger
 * /api/exercises:
 *   get:
 *     summary: Get all exercise (authetification needed)
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all exercises
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 64b2f9c1e4a1d2a3f8c12345
 *                   name:
 *                     type: string
 *                     example: Squat
 *                   description:
 *                     type: string
 *                     example: Leg exercise with load
 *                   muscleGroup:
 *                     type: string
 *                     example: Legs
 *                   difficulty:
 *                     type: string
 *                     example: Beginner
 *       401:
 *         description: User not authorized
 */
router.get("/", authenticateJWT, getAllExercises);

module.exports = router;
