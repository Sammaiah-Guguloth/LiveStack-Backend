const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const roomModel = require("../models/room.model");

module.exports.authUser = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // console.log("token :  ", token);

    if (!token && req.headers?.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        errors: [{ msg: "Unauthorized, No token provided" }],
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded._id);
    if (!user) {
      return res.status(404).json({
        errors: [{ msg: "User not found" }],
      });
    }

    req.user = user; // Attach user to request object
    next(); // Proceed to next middleware or route handler
  } catch (error) {
    console.log("Error while authenticating user:", error.message);
    res.status(500).json({
      errors: [{ msg: `Authentication failed  ${error.message}` }],
    });
  }
};

module.exports.authRoomAdmin = async (req, res, next) => {
  try {
    const roomId = req.body.roomId || req.params.id || req.query.roomId;
    const userId = req.user._id; // Get user ID from authenticated user

    if (!roomId) {
      return res.status(400).json({
        errors: [{ msg: "Room ID is required" }],
      });
    }

    // Check if the user is the admin of the room
    const room = await roomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({
        errors: [{ msg: "Room not found" }],
      });
    }

    if (room.admin.toString() !== userId.toString()) {
      return res.status(403).json({
        errors: [{ msg: "Access denied, you are not the room admin" }],
      });
    }

    req.room = room;

    next(); // Proceed to next middleware or route handler
  } catch (error) {
    console.log("Error while checking room admin:", error.message);
    res.status(500).json({
      errors: [{ msg: `Room admin check failed  ${error.message}` }],
    });
  }
};
