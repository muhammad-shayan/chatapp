const express = require("express");
const dotenv = require("dotenv").config();
const colors = require("colors");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
const { Server } = require("socket.io");
const app = express();

connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server running on port ${PORT}`));
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});
var users = {};
io.on("connection", (socket) => {
  socket.on("login", (user) => {
    socket.join(user._id);
  });

  socket.on("join chat room", ({ room, user }) => {
    socket.join(room);
    if (!users[room]) {
      users[room] = [];
    }
    users[room].push(user._id);
  });

  socket.on("new message", (message) => {
    const room = message.chat._id;
    socket.in(room).emit("message received", message);
    const remainingUsers = users[room]
      ? message.chat.users.filter((u) => !users[room].includes(u))
      : message.chat.users;
    socket.emit("save notifications", { users: remainingUsers, message });
    remainingUsers.forEach((u) => {
      socket.in(u).emit("notification", message);
    });
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("is typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("is not typing");
  });

  socket.on("leave chat room", ({ room, user }) => {
    socket.leave(room);

    if (users[room]) users[room] = users[room].filter((u) => u !== user._id);
  });

  socket.on("logout", (user) => {
    socket.leave(user._id);
  });
});
