const express = require("express");
const { validateProgressEntry } = require("../middleware/validationMiddleware");
const router = express.Router();
const {
  addProgress,
  getProgress,
} = require("../controllers/progressController");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: User progress tracking
 */

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: New progress notes (client only)
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - weight
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-09
 *               weight:
 *                 type: number
 *                 example: 72.5
 *               bodyFatPercentage:
 *                 type: number
 *                 example: 18.2
 *               notes:
 *                 type: string
 *                 example: Feeling stronger this week
 *     responses:
 *       201:
 *         description: Progress successfully added
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: User not authorized
 *       403:
 *         description: Only client can add progress
 */
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("client"),
  validateProgressEntry,
  addProgress
);

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get all users progress notes
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress notes list
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
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: 2025-12-09
 *                   weight:
 *                     type: number
 *                     example: 72.5
 *                   bodyFatPercentage:
 *                     type: number
 *                     example: 18.2
 *                   notes:
 *                     type: string
 *                     example: Feeling stronger this week
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Only client can add progress
 */
router.get("/", authenticateJWT, authorizeRoles("client"), getProgress);

module.exports = router;
