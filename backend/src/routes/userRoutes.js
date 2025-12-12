const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (admin only)
 */

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get all registered users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *       401:
 *         description: User not authorized
 *       403:
 *         description: Only admin can view users
 */
router.get("/users", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find().populate("weeklyPlans");
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error while getting the users", error: err });
  }
});

module.exports = router;
