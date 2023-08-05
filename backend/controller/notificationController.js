const asyncHandler = require("express-async-handler");
const Notifications = require("../models/notificationModel");
const Chats = require("../models/chatModel");
const Users = require("../models/userModel");

const getNotifications = asyncHandler(async (req, res) => {
  try {
    let notifications = await Notifications.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "name pic email")
      .populate("message", "content sender chat")
      //.populate("chats");
      .sort({ createdAt: -1 });
    notifications = await Users.populate(notifications, {
      path: "message.sender",
      select: "_id name email pic",
    });
    notifications = await Chats.populate(notifications, {
      path: "message.chat",
      select: "-createdAt",
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(400);
    throw new Error("Unable to get notifications");
  }
});

const createNotification = asyncHandler(async (req, res) => {
  const { users, message, chat } = req.body;
  try {
    const notification = await Notifications.create({
      users,
      message,
      chat,
    });

    res.status(200).json(notification);
  } catch (error) {
    res.status(400);
    throw new Error("Unable to create notification");
  }
});

const updateNotification = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  try {
    const notifications = await Notifications.find({ chat: chatId });
    notifications.forEach(async (notif) => {
      // console.log(notif.users);
      const users = notif.users.filter(
        (u) => u.toString() !== req.user._id.toString()
      );
      // console.log(users);
      if (users.length > 0) {
        await Notifications.findByIdAndUpdate(
          notif._id,
          {
            users,
          },
          { new: true }
        );
      } else {
        await Notifications.findByIdAndDelete(notif._id);
      }
    });
  } catch (error) {
    res.status(400);
    throw new Error("Unable to update notification");
  }
  res.status(200).json("ok");
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await Notifications.findByIdAndDelete(notificationId);

    res.status(200).json(notification);
  } catch (error) {
    res.status(400);
    throw new Error("Unable to delete notification");
  }
});

module.exports = {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
};
