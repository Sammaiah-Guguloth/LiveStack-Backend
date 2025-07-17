const { insertOne } = require("../models/room.model");

// codeHandlers.js
module.exports = function codeHandlers(io, socket, rooms) {
  // User edits code - broadcast to others
  socket.on("code-change", ({ code, roomId, userId }) => {
    // console.log("code came : ", code);
    // console.log("room Id  : ", roomId);
    io.in(roomId).emit("code-change", {
      code,
      userId,
    });
  });

  socket.on("cursor-change", ({ roomId, userId, userName, position }) => {
    io.in(roomId).emit("cursor-change", {
      userId,
      userName,
      position,
    });
  });

  // socket.on("user-typing", ({ roomId, userName }) => {;
  //   io.in(roomId).emit("user-typing", {
  //     userName,
  //   });
  // });

  // socket.on("code-edit", ({ roomId, code }) => {
  //   // Broadcast to all except sender
  //   socket.to(roomId).emit("code-updated", code);
  // });

  socket.on("language-change", ({ roomId, language }) => {
    io.in(roomId).emit("language-change", {
      language,
    });
  });

  // Save code request (if needed)
  socket.on("save-code", ({ roomId, code }) => {
    // You can implement save logic here (DB or file)
    // console.log(`Save code for room ${roomId}`);
    // Acknowledge to user
    socket.emit("code-saved", { success: true });
  });
};
