const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const {
  validateUserRegistration,
  validateUserLogin,
} = require("../middleware/validationMiddleware");
const router = express.Router();

router.post("/register", validateUserRegistration, register);

router.post("/login", validateUserLogin, login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

module.exports = router;
