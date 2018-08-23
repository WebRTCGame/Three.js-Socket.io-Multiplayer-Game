import { Player } from "./Player.js";
import { players } from "./Game.js";

export class BotPlayer extends Player {
  constructor(obj) {
    super(obj);
    this.pass = obj.pass;
    this.timer = setInterval(() => {
      if (!this.move(4)) {
        this.angle = Math.random() * Math.PI * 2;
      }
      if (Math.random() < 0.03) {
        this.shoot();
      }
    }, 1000 / 30);
  }
  remove() {
    super.remove();
    clearInterval(this.timer);
    setTimeout(() => {
      const bot = new BotPlayer({ nickname: this.nickname,pass:"tob" });
      players[bot.id] = bot;
    }, 3000);
  }
}
