const express = require("express");
const https = require("https");
const fs = require("fs");
const app = express();

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};
const server = https.createServer(options, app);
const socket = require("socket.io");
const io = socket(server);

const users = {};

io.on("connection", (socket) => {
  if (!users[socket.id]) {
    users[socket.id] = socket.id;
  }
  socket.emit("yourID", socket.id);
  io.sockets.emit("allUsers", users);
  socket.on("disconnect", () => {
    delete users[socket.id];
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("hey", {
      signal: data.signalData,
      from: data.from,
    });
  });

  socket.on("acceptCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(8000, () => console.log("server is running on port 8000"));
