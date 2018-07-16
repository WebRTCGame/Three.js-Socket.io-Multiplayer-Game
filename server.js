"use strict";

const express = require("express");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);

import {
  players,
  bullets,
  walls,
  FIELD_WIDTH,
  FIELD_HEIGHT
} from "./modules/Game.js";

import { Player } from "./modules/Player.js";
import { Wall } from "./modules/Walls.js";
import { BotPlayer } from "./modules/BotPlayer.js";
for (let i = 0; i < 3; i++) {
  const wall = new Wall({
    x: Math.random() * FIELD_WIDTH,
    y: Math.random() * FIELD_HEIGHT,
    width: 200,
    height: 50
  });
  walls[wall.id] = wall;
}

const bot = new BotPlayer({ nickname: "bot" });

players[bot.id] = bot;

io.on("connection", function(socket) {
  console.log("----");
  let player = null;
  socket.on("game-start", config => {
    player = new Player({
      socketId: socket.id,
      nickname: config.nickname
    });
    players[player.id] = player;
  });
  socket.on("movement", function(movement) {
    if (!player || player.health === 0) {
      return;
    }
    player.movement = movement;
  });
  socket.on("shoot", function() {
    if (!player || player.health === 0) {
      return;
    }
    player.shoot();
  });
  socket.on("disconnect", () => {
    if (!player) {
      return;
    }
    delete players[player.id];
    player = null;
  });
});

setInterval(() => {
  Object.values(players).forEach(player => {
    const movement = player.movement;
    if (movement.forward) {
      player.move(player.speed);
    }
    if (movement.back) {
      player.move(-player.speed);
    }
    if (movement.left) {
      player.angle -= player.rotationSpeed;
    }
    if (movement.right) {
      player.angle += player.rotationSpeed;
    }
  });
  Object.values(bullets).forEach(bullet => {
    if (!bullet.move(bullet.speed)) {
      bullet.remove();
      return;
    }
    Object.values(players).forEach(player => {
      if (bullet.intersect(player)) {
        if (player !== bullet.player) {
          player.damage();
          bullet.remove();
          bullet.player.point += 1;
        }
      }
    });
  });
  io.sockets.emit("state", players, bullets, walls);
}, 1000 / 30);

app.use("/static", express.static(__dirname + "/static"));

app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "/static/3d.html"));
});

const port = 3000;
server.listen(port, () => {
  console.log(`Starting server on port ${port}`);
  db.defaults({
    users: {
      id: 0,
      name: "",
      pass: "",
      x: 0,
      y: 0,
      kills: 0,
      point:0
    },
    settings: {}
  }).write();
});
