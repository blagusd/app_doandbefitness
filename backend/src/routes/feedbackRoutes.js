const express = require("express");
const router = express.Router();
const { sendEmail } = require("../config/email");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/authMiddleware");
const AppError = require("../utils/AppError");

router.post("/send-feedback", authMiddleware, async (req, res, next) => {
  try {
    const { week, feedback } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return next(new AppError("User not found", 404));

    const html = `
      <h2>Novi feedback od klijenta</h2>
      <p><strong>Korisnik:</strong> ${user.fullName} (${user.email})</p>
      <p><strong>Tjedan:</strong> ${week}</p>
      <p><strong>Feedback:</strong></p>
      <p>${feedback}</p>
    `;

    await sendEmail(
      process.env.FEEDBACK_EMAIL,
      `Feedback od ${user.fullName} — Tjedan ${week}`,
      html
    );

    res.status(200).json({ message: "Feedback poslan!" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
