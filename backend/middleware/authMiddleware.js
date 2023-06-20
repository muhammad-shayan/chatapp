const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");

const protect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Users.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("No authorizaton");
    }
  } else {
    res.status(401);
    throw new Error("No token, no authorization");
  }
};

module.exports = protect;
