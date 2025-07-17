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

router.put(
  "/update-code",
  authMiddlware.authUser,
  [
    body("roomId", "Room ID is required").notEmpty(),
    body("code", "Code is required").notEmpty(),
  ],
  roomController.updateCode
);

router.get(
  "/my/rooms",
  authMiddlware.authUser,
  roomController.getPaginatedRooms
);

router.get(
  "/my/rooms-by-name/:roomName",
  authMiddlware.authUser,
  [param("roomName", "roomName is required").notEmpty()],
  roomController.getRoomsByRoomName
);

// update the code only admin can update
router.put(
  "/update-code-admin",
  authMiddlware.authUser,
  authMiddlware.authRoomAdmin,
  [
    body("roomId", "Room ID is required").notEmpty(),
    body("code", "Code is required").notEmpty(),
  ],
  roomController.updateCodeByAdmin
);

module.exports = router;
