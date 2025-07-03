const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const roomController = require("../controllers/room.controller");
const authMiddlware = require("../middlewares/auth.middleware");

// Create Room
router.post(
  "/create",
  authMiddlware.authUser,
  [
    body("name", "Room name is required").notEmpty(),
    body("language", "Language is required").notEmpty(),
    // body("isPrivate").notEmpty("isPrivate is required"),
    body("description").notEmpty().withMessage("description is required"),
  ],
  roomController.createRoom
);

// Get all rooms
router.get(
  "/all-my-rooms",
  authMiddlware.authUser,
  roomController.getAllRoomsOfUser
);

// get all rooms
router.get("/all-rooms", authMiddlware.authUser, roomController.getAllRooms);

// Get room by ID
router.get(
  "/:id",
  authMiddlware.authUser,
  [param("id", "Invalid Room ID").isMongoId()],
  roomController.getRoomById
);

module.exports = router;
