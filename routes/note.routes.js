const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const noteController = require("../controllers/note.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Create or Update Note
router.post(
  "/",
  [
    body("roomId", "Room ID is required").notEmpty(),
    body("content", "Content is required").notEmpty(),
  ],
  authMiddleware.authUser,
  noteController.createOrUpdateNote
);

// Get Notes by Room ID
router.get(
  "/:roomId",
  [param("roomId", "Invalid Room ID").isMongoId()],
  authMiddleware.authUser,
  noteController.getNotes
);

module.exports = router;
