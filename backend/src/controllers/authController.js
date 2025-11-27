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
    if (existingUser)
      return res.status(400).json({ message: "⚠️ Email already exists" });

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({ fullName, email, passwordHash });
    await newUser.save();

    res.status(201).json({ message: "🟢 User created", userId: newUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "❗User does not exist" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "❓ Wrong password" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "2h" });

    res.json({ message: "🎆 Login successfull", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };
