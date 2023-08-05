const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getNotifications,
  createNotification,
  updateNotification,
  //deleteNotification,
} = require("../controller/notificationController");
const router = express.Router();

router
  .route("/")
  .get(protect, getNotifications)
  .post(protect, createNotification);
router.route("/:chatId").put(protect, updateNotification);
//.delete(protect, deleteNotification);

module.exports = router;
