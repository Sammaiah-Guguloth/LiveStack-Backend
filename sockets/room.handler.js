const {
  addRoom,
  addMemberToRoom,
  removeMemberFromRoom,
  removeMemberBySocketId,
  getRoomIdBySocketId,
  rooms,
  getMembersByRoomId,
} = require("./utils/roomState");

const roomModel = require("../models/room.model");

module.exports = function roomHandlers(io, socket) {
  // Join room event
  socket.on("join-room", ({ roomId, user }) => {
    socket.join(roomId);

    addRoom(roomId);
    // console.log("rooms : ", rooms);
    addMemberToRoom(roomId, {
      socketId: socket.id,
      ...user,
    });

    // console.log("after join : ", rooms);
    // console.log("after join memebers : ", rooms[roomId].members);

    // Fire and forget for db
    // On join (fire and forget, ensures uniqueness)
    roomModel
      .updateOne(
        {
          _id: roomId,
          members: { $ne: user._id }, // ensures user is not already a member
        },
        {
          $push: { members: user._id },
        }
      )
      .exec()
      .catch((err) => console.log(err));

    console.log(`${user.firstName}  joined room `);

    // Notify others in the room that user joined
    // socket.to(roomId).emit("user-joined", user);

    const updatedMembers = getMembersByRoomId(roomId);

    io.in(roomId).emit("user-joined", {
      socketId: socket.id,
      updatedMembers,
      user,
    });

    // io.in(roomId).emit("members-update", {});
  });

  // Leave room event
  socket.on("leave-room", ({ roomId, user }) => {
    socket.leave(roomId);

    // console.log(roomId);
    // console.log("user : ", user);
    // console.log("came");
    // console.log("rooms : ", rooms);
    // const members = rooms[roomId];
    // console.log("before removing : ", members);

    // remove from the local room
    removeMemberFromRoom(roomId, socket.id);

    const updatedMembers = getMembersByRoomId(roomId);

    // console.log("updated Members : ", updatedMembers);

    // Notify room user left
    // socket.to(roomId).emit("user-left", user);
    io.in(roomId).emit("user-left", {
      updatedMembers,
      user,
    });
    console.log("sent");
  });

  // Handle socket disconnecting - remove user from all rooms they are in
  socket.on("disconnecting", () => {
    // Emit updated members list to room
    // io.in(roomId).emit("members-update", {});
  });
};
