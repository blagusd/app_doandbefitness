const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
const { sendEmail } = require("../config/email");

const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new AppError("⚠️ Email already exists", 401));

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({ fullName, email, passwordHash });
    await newUser.save();

    await sendEmail(
      email,
      "Welcome to Do&BE Fitness!",
      `
        <h2>Welcome, ${fullName}!</h2>
        <p>Your account has been successfully created.</p>
        <p>You can now log in and start your fitness journey.</p>
      `,
    );

    res.status(201).json({ message: "🟢 User created", userId: newUser._id });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("❗User does not exist", 401));

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return next(new AppError("❓ Wrong password"));

    // Generate JWT token with role info
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
      expiresIn: "2h",
    });

    res.json({
      message: "🎆 Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("👽 User not found", 404));

    // generate token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 min
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await sendEmail(
      user.email,
      "Password reset - Do&BEFitness",
      `<p>Click link for password reset:</p><a href="${resetLink}">${resetLink}</a>`,
    );

    res.status(200).json({ message: `Reset link sent to ${email}` });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return next(new AppError("❕ Invalid or expired token", 400));

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "🛂 Password successfully reset" });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
