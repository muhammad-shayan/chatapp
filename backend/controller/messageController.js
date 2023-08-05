const asyncHandler = require("express-async-handler");
const Messages = require("../models/messageModel");
const Chats = require("../models/chatModel");

const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Messages.find({ chat: chatId })
      .populate("sender", "name pic email")
      .populate("readBy", "name email pic")
      //.populate("chats");
      .sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(400);
    throw new Error("Unable to get any messages");
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;

  if (!content) {
    res.status(400);
    throw new Error("Cannot send an empty message");
  }

  try {
    const message = await Messages.create({
      content,
      sender: req.user._id,
      chat: chatId,
    });
    const sentMessage = await Messages.findById(message._id)
      .populate("sender", "name email pic")
      .populate("readBy", "name email pic")
      .populate("chat");
    await Chats.findByIdAndUpdate(chatId, { latestMessage: message });

    res.status(200).json(sentMessage);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, getMessages };
