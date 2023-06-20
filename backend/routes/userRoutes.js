const express = require("express");
const {
  loginUser,
  registerUser,
  searchUsers,
} = require("../controller/userController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").post(registerUser).get(protect, searchUsers);
router.route("/login").post(loginUser);

module.exports = router;
