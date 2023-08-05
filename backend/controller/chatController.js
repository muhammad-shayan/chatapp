const asyncHandler = require("express-async-handler");
const Chats = require("../models/chatModel");
const Users = require("../models/userModel");
const Messages = require("../models/messageModel");
const Notifications = require("../models/notificationModel");

const fetchChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  let chat = await Chats.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "name email pic")
    .populate("latestMessage");

  chat = await Users.populate(chat, {
    path: "latestMessage.sender",
    select: "name email pic",
  });
  if (chat.length > 0) {
    res.status(200).json(chat[0]);
  } else {
    const newChat = await Chats.create({
      chatName: "singleChat",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    if (newChat) {
      res.status(200).json(newChat);
    } else {
      throw new Error("Unable to create chat");
    }
  }
});

const allChats = asyncHandler(async (req, res) => {
  try {
    let chats = await Chats.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "name email pic")
      .populate("groupAdmin", "name email pic")
      .populate("latestMessage");
    chats = await Users.populate(chats, {
      path: "latestMessage.sender",
      select: "name email pic",
    });
    res.status(200).json(chats);
  } catch (error) {
    res.status(401);
    throw new Error("Unable to find chats");
  }
});

const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    await Chats.findByIdAndDelete(chatId);
    await Messages.deleteMany({ chat: chatId });
    await Notifications.deleteMany({ chat: chatId });

    res.status(200).json({ message: "Chat deleted" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  const { chatUsers, chatName } = req.body;
  if (chatUsers.length < 2) {
    res.status(400);
    throw new Error("At least 3 users are required for group chat");
  }

  try {
    const groupChat = await Chats.create({
      isGroupChat: true,
      chatName,
      users: [req.user._id, ...chatUsers],
      groupAdmin: req.user._id,
    });

    let createdGroupChat = await Chats.findById(groupChat._id)
      .populate("users", "name email pic")
      .populate("groupAdmin", "name email pic")
      .populate("latestMessage");
    createdGroupChat = await Users.populate(createdGroupChat, {
      path: "latestMessage.sender",
      select: "name email pic",
    });

    res.status(200).json(createdGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const editGroupChat = asyncHandler(async (req, res) => {
  let { groupChatId, users, chatName } = req.body;
  const groupChat = await Chats.findById(groupChatId);

  if (!users) {
    users = groupChat.users;
  }

  if (!chatName) {
    chatName = groupChat.chatName;
  }

  if (groupChat.groupAdmin._id.toString() !== req.user._id.toString()) {
    res.status(400);
    throw new Error("Not authorized to edit group chat");
  }

  try {
    const editedGroupChat = await Chats.findByIdAndUpdate(
      groupChatId,
      {
        isGroupChat: true,
        chatName,
        users,
      },
      { new: true }
    );

    res.status(200).json(editedGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const leaveGroupChat = asyncHandler(async (req, res) => {
  let { groupChatId, users } = req.body;

  try {
    await Chats.findByIdAndUpdate(
      groupChatId,
      {
        isGroupChat: true,
        users,
      },
      { new: true }
    );

    res.status(200).json({ message: "ok" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteGroupChat = asyncHandler(async (req, res) => {
  const { groupChatId } = req.params;
  const groupChat = await Chats.findById(groupChatId);

  if (groupChat.groupAdmin._id.toString() !== req.user._id.toString()) {
    res.status(400);
    throw new Error("Not authorized to delete group chat");
  }

  try {
    await Chats.findByIdAndDelete(groupChatId);
    await Messages.deleteMany({ chat: groupChatId });
    await Notifications.deleteMany({ chat: groupChatId });

    res.status(200).json({ message: "Chat deleted" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  fetchChat,
  allChats,
  deleteChat,
  createGroupChat,
  editGroupChat,
  deleteGroupChat,
  leaveGroupChat,
};
