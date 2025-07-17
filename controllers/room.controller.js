const { validationResult } = require("express-validator");
const roomModel = require("../models/room.model");

exports.createRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, language, isPrivate, description, roomCode } = req.body;

    if (isPrivate === "true" && !roomCode) {
      return res.status(400).json({
        errors: [{ msg: "Room code is requried for private rooms" }],
      });
    }

    const newRoom = new roomModel({
      name,
      description,
      isPrivate: isPrivate === "true", // Convert string to boolean
      language,
      admin: req.user._id,
      members: [req.user._id],
      ...(isPrivate && roomCode && { roomCode }),
    });

    await newRoom.save();

    return res.status(201).json({ room: newRoom });
  } catch (error) {
    console.log("Error while creating room", error);
    return res
      .status(500)
      .json({ errors: ["Server Error: Unable to create room"] });
  }
};

exports.getAllRoomsOfUser = async (req, res) => {
  try {
    const userId = req.user._id; // assuming req.user is set by auth middleware

    const rooms = await roomModel
      .find({
        $or: [{ admin: userId }, { members: userId }],
      })
      .populate("admin") // select specific fields
      .populate("members");

    return res.status(200).json({ rooms });
  } catch (error) {
    return res
      .status(500)
      .json({ errors: ["Server Error: Unable to fetch user's rooms"] });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await roomModel.find().populate("admin").populate("members");
    return res.status(200).json({ rooms });
  } catch (error) {
    return res
      .status(500)
      .json({ errors: ["Server Error: Unable to fetch rooms"] });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await roomModel
      .findById(req.params.id)
      .populate("admin")
      .populate("members");

    // console.log("");

    if (!room)
      return res.status(404).json({ errors: [{ msg: "Room not found" }] });

    return res.status(200).json({ room });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ errors: [{ msg: "Server Error: Unable to fetch room " }] });
  }
};

exports.updateCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, roomId } = req.body;

    await roomModel.findByIdAndUpdate(roomId, { code });
    return res.status(200).json({ message: "Code updated successfully." });
  } catch (error) {
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};

// Fetching rooms that user is part of using pagination
exports.getPaginatedRooms = async (req, res) => {
  try {
    const userId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const totalRooms = await roomModel.countDocuments({ members: userId });

    const rooms = await roomModel
      .find({ members: userId })
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .populate("admin", "firstName lastName email") // Optional: populate admin info
      .lean();

    return res.status(200).json({
      success: true,
      rooms,
      page,
      totalPages: Math.ceil(totalRooms / limit),
    });
  } catch (error) {
    console.error("Error fetching paginated rooms:", error);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};

// Fetching the rooms that the user is part of and given query upto limit 6
exports.getRoomsByRoomName = async (req, res) => {
  try {
    const { roomName } = req.params;
    const userId = req.user._id;

    // if (!roomName) {
    //   return res
    //     .status(400)
    //     .json({ errors: [{ msg: "Room name is required." }] });
    // }

    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }

    // const rooms = await roomModel
    //   .find({
    //     name: { $regex: roomName, $options: "i" }, // case-insensitive partial match
    //     members: userId, // user must be a member
    //   })
    //   .limit(6)
    //   .populate("admin", "firstName lastName email") // populate admin info
    //   .select("-code"); // exclude heavy fields like code if not needed

    const rooms = await roomModel
      .find({
        name: { $regex: roomName, $options: "i" },
        members: userId,
      })
      .select("name _id");

    if (rooms.length === 0) {
      return res
        .status(404)
        .json({ errors: [{ msg: "No matching rooms found." }] });
    }

    return res.status(200).json({ rooms });
  } catch (error) {
    console.error("Error fetching rooms by name:", error);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};

// update code only admin can update
exports.updateCodeByAdmin = async (req, res) => {
  try {
    const room = req.room;
    const { code } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!room) {
      return res.status(404).json({ errors: [{ msg: "Room not found" }] });
    }

    room.code = code;
    await room.save();
    return res.status(200).json({ message: "Code updated successfully." });
  } catch (error) {
    console.error("Error while updating code after session", error);
    return res.status(500).json({
      errors: [{ msg: "Server Error: Unable to update code" }],
    });
  }
};
