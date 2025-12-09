const express = require("express");
const { validatePlan } = require("../middleware/validationMiddleware");
const router = express.Router();
const { createPlan, getUserPlans } = require("../controllers/planController");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Training plan control
 */

/**
 * @swagger
 * /api/plans:
 *   post:
 *     summary: Creation of new plan (admin only)
 *     tags: [Plans]
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
 *                 example: Full Body Plan
 *               description:
 *                 type: string
 *                 example: Full body plan, 3x per week
 *               durationWeeks:
 *                 type: integer
 *                 example: 8
 *               difficulty:
 *                 type: string
 *                 example: Intermediate
 *     responses:
 *       201:
 *         description: Plan successfully created
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: User not authorized
 *       403:
 *         description: Only admin can create new plan
 */
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  validatePlan,
  createPlan
);

/**
 * @swagger
 * /api/plans/{userId}:
 *   get:
 *     summary: Get users plans
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User plans list
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
 *                     example: Push/Pull/Legs
 *                   description:
 *                     type: string
 *                     example: Plan for advanced users
 *                   durationWeeks:
 *                     type: integer
 *                     example: 12
 *                   difficulty:
 *                     type: string
 *                     example: Advanced
 *       401:
 *         description: User not authorized
 *       404:
 *         description: User not found
 */
router.get("/:userId", authenticateJWT, getUserPlans);

module.exports = router;
