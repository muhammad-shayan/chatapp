const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  fetchChat,
  allChats,
  deleteChat,
  createGroupChat,
  editGroupChat,
  deleteGroupChat,
  leaveGroupChat,
} = require("../controller/chatController");
const router = express.Router();

router.route("/").get(protect, allChats).post(protect, fetchChat);
router.route("/:chatId").delete(protect, deleteChat);
router
  .route("/group")
  .post(protect, createGroupChat)
  .put(protect, editGroupChat);
router.route("/group/:groupChatId").delete(protect, deleteGroupChat);
router.route("/leavegroup").put(protect, leaveGroupChat);

module.exports = router;
