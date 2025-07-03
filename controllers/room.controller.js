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

    console.log("");

    if (!room)
      return res.status(404).json({ errors: [{ msg: "Room not found" }] });

    return res.status(200).json({ room });
  } catch (error) {
    return res
      .status(500)
      .json({ errors: [{ msg: "Server Error: Unable to fetch room " }] });
  }
};
