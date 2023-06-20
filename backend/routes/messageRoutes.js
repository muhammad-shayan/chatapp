const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getMessages, sendMessage } = require("../controller/messageController");
const router = express.Router();

router.route("/:chatId").get(protect, getMessages).post(protect, sendMessage);

module.exports = router;
