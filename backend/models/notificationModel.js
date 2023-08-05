const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chats",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notifications", notificationSchema);
