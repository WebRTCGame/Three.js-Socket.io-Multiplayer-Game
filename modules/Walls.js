import { GameObject } from "./GameObject.js";
import {
    walls,
    FIELD_WIDTH,
    FIELD_HEIGHT
  } from "./Game.js";

export class Wall extends GameObject {}

for (let i = 0; i < 3; i++) {
    const wall = new Wall({
      x: Math.random() * FIELD_WIDTH,
      y: Math.random() * FIELD_HEIGHT,
      width: 200,
      height: 50
    });
    walls[wall.id] = wall;
  }