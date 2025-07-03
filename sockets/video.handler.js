const {
  getRoomIdBySocketId,
  // getMembersByRoomId,
} = require("./utils/roomState");

module.exports = function videoHandlers(io, socket) {
  // When a peer sends an offer
  socket.on("send-offer", ({ from, to, offer, fromUserName }) => {
    console.log("from : ", from, " to : ", to);

    console.log("offer came and sending offer : ", offer);

    console.log(
      "Emitting to socket:",
      to,
      "Connected:",
      io.sockets.sockets.has(to)
    );

    io.to(to).emit("receive-offer", {
      fromSocketId: socket.id,
      fromUserId: from,
      fromUserName,
      offer,
    });

    console.log("offer sent");
  });

  // When a peer sends an answer
  socket.on("send-answer", ({ to, answer }) => {
    io.to(to).emit("receive-answer", {
      from: socket.id,
      answer,
    });
  });

  // When a peer sends ICE candidates
  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", {
      from: socket.id,
      candidate,
    });
  });

  // Toggle audio/video
  socket.on("media-toggle", ({ isMuted, videoOff }) => {
    const roomId = getRoomIdBySocketId(socket.id);
    if (!roomId) return;

    // Broadcast new media state to others in the room
    socket.to(roomId).emit("media-updated", {
      socketId: socket.id,
      isMuted,
      videoOff,
    });
  });

  // Optional: clean up on disconnect
  // socket.on("disconnect", () => {
  //   const roomId = getRoomIdBySocketId(socket.id);
  //   if (!roomId) return;

  //   socket.to(roomId).emit("user-disconnected", {
  //     socketId: socket.id,
  //   });
  // });
};
