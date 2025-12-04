const express = require("express");
const { register, login } = require("../controllers/authController");
const {
  validateUserRegistration,
  validateUserLogin,
} = require("../middleware/validationMiddleware");
const router = express.Router();

router.post("/register", validateUserRegistration, register);
router.post("/login", validateUserLogin, login);

module.exports = router;
