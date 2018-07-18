"use strict";

const express = require("express");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");
const app = express();
const server = http.Server(app);
export const io = socketIO(server);
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
export const db = low(adapter);

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

const bot = new BotPlayer({ nickname: "bot" });

players[bot.id] = bot;

io.on("connection", function(socket) {
  console.log("----");
  let player = null;
 
  socket.on("game-start", config => {
    player = new Player({
      socketId: socket.id,
      nickname: config.nickname,
      pass: config.password
    });
    let playerData = getUserByUserPass(player.nickname,player.pass);
    if (playerData !== undefined){
      playerData.id = player.id;
      player.x = playerData.x;
      player.y = playerData.y;
      player.width = playerData.width;
      player.height = playerData.height;
      player.angle = playerData.angle;
      player.speed = playerData.speed;
      player.rotationSpeed = playerData.rotationSpeed;
      player.nickname = playerData.nickname;
      player.pass = playerData.pass;
      player.maxHealth = playerData.maxHealth;
      player.point = playerData.point;
      player.Level = playerData.Level;
      player.Exp = playerData.Exp;
      player.Attack = playerData.Attack;
      player.Defense = playerData.Defense;
      
  
  }
    players[player.id] = player;
    console.log(players[player.id]);
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
    players[player.id].save();
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
}, 1000 / 20);

app.use("/static", express.static(__dirname + "/static"));

app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "/static/3d.html"));
});

const port = 3000;
server.listen(port, () => {
  console.log(`Starting server on port ${port}`);
  db.defaults({
    Players: [{
      id: 351609823,
      x: 502.5754930370992,
      y: 48.45093268783282,
      width: 80,
      height: 80,
      angle: 0.022366698064048222,
      speed: 5,
      rotationSpeed: 0.1,
      nickname: "ab",
      pass: "ba",
      maxHealth: 10,
      point: 0,
      Level:0,
      Exp:0,
      Attack:1,
      Defense:1
    }],
    settings: {}
  }).write();

//db.get('settings').push({a:5}).write();
db.set('settings.fun','not').write();
});

let getUserByUserPass = function(username,pass){
return db.get('Players').find({nickname:username,pass:pass}).value();
};

let getUserTaken = function(username){
  return (db.get('Players').find({nickname:username}).value() !== undefined)
};

let getUserMatchesPass = function(username, pass){
    return (db.get('Players').find({nickname:username,pass:pass}).value() !== undefined);
};

