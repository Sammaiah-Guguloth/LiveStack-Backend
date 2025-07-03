const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      // select: false, // for now later create class function for checking
    },
    googleId: {
      type: String,
      select: false,
    },
    profileImage: {
      type: String,
    },
    role: {
      type: String,
      enum: ["viewer", "editor", "admin"],
      default: "viewer",
    },
    socketId: {
      type: String,
    },
    permissions: {
      canEdit: {
        type: Boolean,
        default: true,
      },
      canSpeak: {
        type: Boolean,
        default: true,
      },
      canShareVideo: {
        type: Boolean,
        default: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
