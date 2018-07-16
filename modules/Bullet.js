import { GameObject } from "./GameObject.js";
import { bullets } from "./Game.js";

export class Bullet extends GameObject {
  constructor(obj) {
    super(obj);
    this.width = 15;
    this.height = 15;
    this.player = obj.player;
    this.speed = 10;
  }
  remove() {
    delete this.player.bullets[this.id];
    delete bullets[this.id];
  }
}
