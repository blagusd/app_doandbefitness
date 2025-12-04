const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check does the user exist
    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new AppError("⚠️ Email already exists", 401));

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({ fullName, email, passwordHash });
    await newUser.save();

    res.status(201).json({ message: "🟢 User created", userId: newUser._id });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("❗User does not exist", 401));

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return next(new AppError("❓ Wrong password"));

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "2h" });

    res.json({ message: "🎆 Login successfull", token });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
