"use strict";
console.log(process.version);
import express from "express";
import http from "http";
import path from "path";
import socketIO from "socket.io";

import {getUserDb,writeDbFile,readDataDirectory} from "./modules/userController";

import { players, bullets, walls,updatePlayers,updateBullets } from "./modules/Game.js";

import { Player } from "./modules/Player.js";
import { BotPlayer } from "./modules/BotPlayer.js";
import { runMain } from "module";

const app = express();
const server = http.Server(app);
export const io = socketIO(server);

readDataDirectory().then(val=>console.log(val));

getUserDb("abc").then(val => console.log(val));

writeDbFile("me", { a: 5 });

const bot = new BotPlayer({ nickname: "bot" });

players[bot.id] = bot;

export let savePlayer = function(player) {
  let jso = player.jso();
  let playerData = db
    .get("Players")
    .find({ nickname: player.nickname, pass: player.pass })
    .assign({
      id: player.id,
      Ttl: Date.now(),
      x: player.x,
      y: player.y,
      width: player.width,
      height: player.height,
      angle: player.angle,
      speed: player.speed,
      rotationSpeed: player.rotationSpeed,
      nickname: player.nickname,
      pass: player.pass,
      maxHealth: player.maxHealth,
      point: player.point,
      Level: player.Level,
      Exp: player.Exp,
      Attack: player.Attack,
      Defense: player.Defense
    })
    .write();
};

io.on("connection", socket => {
  console.log("io.on connection");

  let player = null;

  socket.on("error", error => {
    console.log(socket.id + " error " + error);
  });
  socket.on("validate-user", config => {
    console.log("validate-user");
    console.log(config);
    getUserDb(config.nickname).then(val => {
      console.log(val);
    });
  });
  socket.on("game-start", config => {
    console.log("socket on game-start");
    player = new Player({
      socketId: socket.id,
      nickname: config.nickname,
      pass: config.password
    });

    let playerData = db
      .get("Players")
      .find({ nickname: player.nickname, pass: player.pass })
      .value();
    console.log(":::: " + playerData);
    if (playerData !== undefined) {
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

    //players[player.id].save();
    db.get("Players")
      .push(players[player.id].jso())
      .write();
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
  socket.on("disconnect", reason => {
    console.log(socket.id + " disconnect " + reason);
    if (!player) {
      return;
    }
    players[player.id].save();
    delete players[player.id];
    player = null;
  });
});

/** Update all sockets */
setInterval(() => {
  /*
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
  */
 updatePlayers();
 updateBullets();
  io.sockets.emit("state", players, bullets, walls);
}, 1000 / 20);

app.use("/static", express.static(__dirname + "/static"));

app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "/static/3d.html"));
});

const port = 3000;

server.listen(port, () => {
  console.log(`Starting server on port ${port}`);
});
