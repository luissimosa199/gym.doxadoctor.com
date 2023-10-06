const express = require("express");
const next = require("next");
const http = require("http");
const socketIo = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  const httpServer = http.createServer(server);
  const io = socketIo(httpServer);

  let allUsers = [];
  let roomMessages = {};

  io.on("connection", (socket) => {
    console.log("CONNECTED");
    socket.emit("me", socket.id);

    socket.on("joinRoomOnConnect", (room, name, callback) => {
      socket.join(room);
      allUsers.push({ room, id: socket.id, name });
      callback();
      socket.emit("message", `You have joined the room: ${room}`);
      socket.to(room).emit("message", `A user has joined the room: ${room}`);

      const usersInRoom = allUsers.filter((user) => user.room === room);
      io.to(room).emit("usersInRoom", usersInRoom);
    });

    socket.on("getUsersInRoom", (room) => {
      const usersInRoom = allUsers.filter((user) => user.room === room);
      socket.emit("usersInRoom", usersInRoom);
    });

    socket.on("sendMessage", ({ room, user, message, files, timestamp }) => {
      if (!roomMessages[room]) {
        roomMessages[room] = [];
      }
      roomMessages[room].push({ timestamp, user, message, files });
      io.to(room).emit("roomMessages", roomMessages[room]);
    });

    socket.on("getRoomMessages", (room, callback) => {
      callback(roomMessages[room] || []);
    });

    socket.on("disconnect", () => {
      const user = allUsers.find((user) => user.id === socket.id);
      allUsers = allUsers.filter((user) => user.id !== socket.id);
      if (user) {
        const usersInRoom = allUsers.filter((u) => u.room === user.room);
        io.to(user.room).emit("usersInRoom", usersInRoom);
      }
    });
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
