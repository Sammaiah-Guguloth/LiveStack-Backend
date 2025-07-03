const registerRoomHandlers = require("./room.handler");
const registerCodeHandlers = require("./code.handler");
// const registerUserHandlers = require("./user.handler");
const registerChatHandlers = require("./chat.handler");
const registerVideoHandlers = require("./video.handler");

const {
  getRoomIdBySocketId,
  removeMemberFromRoom,
  getMemberBySocketId,
  removeMemberBySocketId,
  rooms,
  getMembersByRoomId,
} = require("./utils/roomState");

function createSocketServer(server) {
  const io = require("socket.io")(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    console.log("New socket connected: ", socket.id);

    registerRoomHandlers(io, socket);
    registerCodeHandlers(io, socket);
    // registerUserHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerVideoHandlers(io, socket);

    socket.on("disconnect", () => {
      try {
        const { roomId = "", removedMember = null } = removeMemberBySocketId(
          socket.id
        );

        if (!roomId || !removedMember) return;

        const updatedMembers = getMembersByRoomId(roomId);

        console.log("removed user : ", removedMember);

        // socket.to(roomId).emit("user-left", removed);
        io.in(roomId).emit("user-left", {
          socketId: socket.id,
          updatedMembers,
          user: removedMember,
        });

        console.log(`${removedMember.firstName} left room ${roomId}`);

        console.log("Socket disconnected: ", socket.id);
      } catch (err) {
        console.log(err);
      }
    });
  });

  return io;
}

module.exports = { createSocketServer };
