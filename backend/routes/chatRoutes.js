const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  fetchChat,
  allChats,
  createGroupChat,
  editGroupChat,
  deleteGroupChat,
} = require("../controller/chatController");
const router = express.Router();

router.route("/").get(protect, allChats).post(protect, fetchChat);
router
  .route("/group")
  .post(protect, createGroupChat)
  .put(protect, editGroupChat)
  .delete(protect, deleteGroupChat);

module.exports = router;
