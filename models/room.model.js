const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Admin of the room
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Array of members with roles and permissions
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    code: {
      type: String,
    },

    description: {
      type: String,
    },

    // Room settings
    isPrivate: {
      type: Boolean,
      default: false,
    },
    roomCode: {
      type: String,
    },
    language: {
      type: String,
      default: "javascript",
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "dark",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
