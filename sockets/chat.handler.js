function registerChatHandlers(io, socket) {
  // Receive message from client and broadcast to room (except sender)
  socket.on("message", ({ roomId, message, sender }) => {
    // console.log("recived :  ", message);
    io.in(roomId).emit("message", {
      message,
      time: new Date().toISOString(),
      sender,
    });

    // socket.to(roomId).emit("receive-message", {
    //   message,
    //   user,
    //   time: new Date().toISOString(),
    // });
    //console.log(`[Chat] ${senderId} in ${roomId}: ${message}`);
  });

  // Optionally handle user typing notifications really optional
  socket.on("typing", ({ roomId, username }) => {
    socket.to(roomId).emit("user-typing", { username });
  });

  socket.on("stop-typing", ({ roomId, senderId }) => {
    socket.to(roomId).emit("user-stop-typing", { senderId });
  });
}

module.exports = registerChatHandlers;
