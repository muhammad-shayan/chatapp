const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Users = require("../models/userModel");

const searchUsers = asyncHandler(async (req, res) => {
  const users = await Users.find({
    $or: [
      { name: { $regex: req.query.search } },
      { email: { $regex: req.query.search } },
    ],
  });
  res.status(200).json({ users });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Incomplete data");
  }
  const user = await Users.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(201).json({
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Credentials");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all fields");
  }
  const checkUser = await Users.findOne({ email });

  if (checkUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await Users.create({
    name,
    email,
    password: hashedPassword,
    pic,
  });
  if (user) {
    res.status(201).json({
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user");
  }
});

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

module.exports = {
  searchUsers,
  loginUser,
  registerUser,
};
