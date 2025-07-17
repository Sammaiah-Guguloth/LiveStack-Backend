const { validationResult } = require("express-validator");
const noteModel = require("../models/note.model");

exports.createOrUpdateNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user;
    const { roomId, content } = req.body;

    const updatedNote = await noteModel.findOneAndUpdate(
      { user: user._id, room: roomId },
      { content },
      { new: true, upsert: true }
    );

    return res.status(201).json(updatedNote);
  } catch (error) {
    console.error("Error while creating or updating note", error);
    return res
      .status(500)
      .json({ errors: [{ msg: "Server Error : Unable to update" }] });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { roomId } = req.params;
    const user = req.user;
    const notes = await noteModel.findOne({ room: roomId, user: user._id });
    if (!notes) {
      return res
        .status(404)
        .json({ errors: [{ msg: "No notes found for this room" }] });
    }
    // console.log(notes);
    return res.status(200).json({
      notes,
    });
  } catch (error) {
    console.error("Error while fetching notes", error);
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};
