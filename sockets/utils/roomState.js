//  ROOM STATE MANAGEMENT
/*

// for better performance this rooms array to object with roomId as key

rooms --> [ _id , name, members[], code, language ] // room schema
members --> [ user.model.js ]

rooms {
  "roomId" : {
    _id : ,
    name : "",
    members: [], // array of member objects
  }
}


functions : 
  addRoom 
  removeRoom
  getRoomById
  getRooms

  add memeber to room 
  remove member from room
  getMembersByRoomId
  

  changeLanguage
  // changeCode


  //l

*/

const rooms = {}; // roomId as key -> room object

// ================== ROOM OPERATIONS ==================

function addRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      _id: roomId,
      members: [],
      code: "", // default empty
      language: "javascript", // default
    };
  }
}

function removeRoom(roomId) {
  delete rooms[roomId];
}

function getRoomById(roomId) {
  return rooms[roomId] || null;
}

function getRooms() {
  return Object.values(rooms);
}

// ================== MEMBER OPERATIONS ==================

function addMemberToRoom(roomId, member) {
  const room = getRoomById(roomId);
  if (!room) return;

  const exists = room.members.find((m) => m._id === member._id);
  if (!exists) {
    room.members.push(member);
  }
}

function removeMemberFromRoom(roomId, socketId) {
  const room = getRoomById(roomId);
  if (!room) return;

  room.members = room.members.filter((m) => m.socketId !== socketId);

  // // Optionally delete room if empty
  // if (room.members.length === 0) {
  //   removeRoom(roomId);
  // }
}

function getMembersByRoomId(roomId) {
  const room = getRoomById(roomId);
  return room?.members || [];
}

function removeMemberBySocketId(socketId) {
  // console.log("rooms : ", rooms);

  // console.log("rooms Id's : ", Object.keys(rooms));

  // difference b/w the for of and for in js

  for (const roomId in rooms) {
    const room = rooms[roomId];
    const index = room.members.findIndex(
      (member) => member.socketId === socketId
    );

    if (index !== -1) {
      const [removedMember] = room.members.splice(index, 1);

      // If room is now empty, delete it
      // if (room.members.length === 0) {
      //   delete rooms[roomId];
      //   console.log(`[Room Cleanup] Deleted empty room ${roomId}`);
      // }

      return {
        roomId,
        removedMember,
      };
    }
  }

  return null; // No matching socketId found
}

function getRoomIdBySocketId(socketId) {
  console.log("sockedId : ", socketId);
  console.log("roomIds : ", Object.keys(rooms));
  for (const roomId in Object.keys(rooms)) {
    const room = rooms[roomId];
    console.log("room : ", room);
    if (!room) return null;
    const found = room.members.find((member) => member.socketId === socketId);
    if (found) return roomId;
  }
  return null;
}

function getMemberBySocketId(socketId) {
  for (const roomId in Object.keys(rooms)) {
    const room = rooms[roomId];
    const member = room.members.find((m) => m.socketId === socketId);
    if (member) {
      return member;
    }
  }
  return null;
}

// ================== CODE + LANGUAGE ==================

function changeLanguage(roomId, newLanguage) {
  const room = getRoomById(roomId);
  if (room) {
    room.language = newLanguage;
  }
}

function changeCode(roomId, newCode) {
  const room = getRoomById(roomId);
  if (room) {
    room.code = newCode;
  }
}

function getCode(roomId) {
  return getRoomById(roomId)?.code || "";
}

function getLanguage(roomId) {
  return getRoomById(roomId)?.language || "javascript";
}

// ================== EXPORT ==================

module.exports = {
  addRoom,
  removeRoom,
  getRoomById,
  getRooms,

  addMemberToRoom,
  removeMemberFromRoom,
  getMembersByRoomId,
  removeMemberBySocketId,
  getRoomIdBySocketId,
  getMemberBySocketId,

  changeLanguage,
  changeCode,
  getCode,
  getLanguage,

  rooms,
};
