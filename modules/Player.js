import { GameObject } from "./GameObject.js";
import { FIELD_HEIGHT, FIELD_WIDTH, players, bullets } from "./Game.js";
import { Bullet } from "./Bullet.js";
import { io } from "../server.js";

export class Player extends GameObject {
    constructor(obj = {}) {
      super(obj);
      this.socketId = obj.socketId;
      this.nickname = obj.nickname;
      this.pass = obj.pass;
      this.width = 80;
      this.height = 80;
      this.health = this.maxHealth = 10;
      this.bullets = {};
      this.point = 0;
      this.speed = 5;
      this.movement = {};
  
      do {
        this.x = Math.random() * (FIELD_WIDTH - this.width);
        this.y = Math.random() * (FIELD_HEIGHT - this.height);
        this.angle = Math.random() * 2 * Math.PI;
      } while (this.intersectWalls());
    }
    shoot() {
      if (Object.keys(this.bullets).length >= 3) {
        return;
      }
      const bullet = new Bullet({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        angle: this.angle,
        player: this
      });
      bullet.move(this.width / 2);
      this.bullets[bullet.id] = bullet;
      bullets[bullet.id] = bullet;
    }
    damage() {
      this.health--;
      if (this.health === 0) {
        this.remove();
      }
    }
    remove() {
      delete players[this.id];
      io.to(this.socketId).emit("dead");
    }
    toJSON() {
      return Object.assign(super.toJSON(), {
        health: this.health,
        maxHealth: this.maxHealth,
        socketId: this.socketId,
        point: this.point,
        nickname: this.nickname
      });
    }
  }