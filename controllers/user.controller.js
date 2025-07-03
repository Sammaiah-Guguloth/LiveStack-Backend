const { validationResult } = require("express-validator");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
}

module.exports.registerUser = async (req, res) => {
  const errorResponse = handleValidationErrors(req, res);
  if (errorResponse) return;

  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        errors: [
          { msg: "User already exists with this email", param: "email" },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      firstName,
      lastName,
      email,
      profileImage: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        token,
        message: "User registered successfully",
        user: {
          _id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          profileImage: newUser.profileImage,
        },
      });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ errors: [{ msg: error.message }] });
  }
};

module.exports.loginUser = async (req, res) => {
  const errorResponse = handleValidationErrors(req, res);
  if (errorResponse) return;

  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        errors: [{ msg: "Invalid email or password", param: "email" }],
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        errors: [{ msg: "Invalid email or password", param: "password" }],
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        token,
        message: "User logged in successfully",
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage,
        },
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ errors: [{ msg: error.message }] });
  }
};

module.exports.getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(500).json({ errors: [{ msg: error.message }] });
  }
};

module.exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token").status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ errors: [{ msg: error.message }] });
  }
};

exports.googleAuth = async (req, res) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { access_token } = req.body;

  try {
    const ticket = await client.getTokenInfo(access_token);
    const { email, name, sub } = ticket;

    let user = await userModel.findOne({ email });
    if (!user) {
      user = await userModel.create({
        email,
        firstName: name.split(" ")[0],
        lastName: name.split(" ")[1] || "",
        profileImage: `https://ui-avatars.com/api/?name=${name}&background=random`,
        googleId: sub,
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        token,
        message: "User logged in successfully",
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage,
        },
      });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ errors: [{ msg: err.message }] });
  }
};
