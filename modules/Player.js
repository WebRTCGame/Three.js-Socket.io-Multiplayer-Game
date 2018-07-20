import { GameObject } from "./GameObject.js";
import { FIELD_HEIGHT, FIELD_WIDTH, players, bullets } from "./Game.js";
import { Bullet } from "./Bullet.js";
import { io, db } from "../server.js";

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
  save() {
    console.log("player save 1xxxxxxx");
    console.log('db.getState(): ' + db.getState());
    let p = db.get('Players');
    console.log(p);
    console.log("saving player");
    let p1 = p.find({nickname:this.nickname,pass:this.pass});
    if (p1 !== undefined){
    p1.assign({
        //id: this.id,
        Ttl:Date.now(),
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        angle: this.angle,
        speed: this.speed,
        rotationSpeed: this.rotationSpeed,
        //nickname: this.nickname,
        //pass: this.pass,
        maxHealth: this.maxHealth,
        point: this.point,
        Level: this.Level,
        Exp: this.Exp,
        Attack: this.Attack,
        Defense: this.Defense
      }).write();
    } else {
      p.push({
        id: this.id,
        Ttl:Date.now(),
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        angle: this.angle,
        speed: this.speed,
        rotationSpeed: this.rotationSpeed,
        nickname: this.nickname,
        pass: this.pass,
        maxHealth: this.maxHealth,
        point: this.point,
        Level: this.Level,
        Exp: this.Exp,
        Attack: this.Attack,
        Defense: this.Defense}).write();
    }
    p.write();
    console.log('done saving');
  }
load(){

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
      this.save();
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
  jso(){
    return {
      id: this.id,
      Ttl:Date.now(),
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      angle: this.angle,
      speed: this.speed,
      rotationSpeed: this.rotationSpeed,
      nickname: this.nickname,
      pass: this.pass,
      maxHealth: this.maxHealth,
      point: this.point,
      Level: this.Level,
      Exp: this.Exp,
      Attack: this.Attack,
      Defense: this.Defense}
  }
}
