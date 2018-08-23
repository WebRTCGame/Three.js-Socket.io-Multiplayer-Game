import path from "path";
import fs from "fs";
export const promises = fs.promises;

export let dataPath = path.join(process.cwd(), "data");
export let fileKey = "4nk22tdINY";

export function getDbPath(user) {
  return path.join("./data", user + fileKey + ".json");
}

export let register = function(req, res) {};
export let signIn = function(req, res) {};

export async function getUserDb(user) {
  let x = getDbPath(user);
  console.log(`Getting ${user} db: ` + x);
  return JSON.parse(await promises.readFile(getDbPath(user)));
}

export async function readDataDirectory() {
  return await promises.readdir("./data");
}

export function getDbUserData(user) {
  return promises.readFile(getDbPath(user));
}

export async function writeDbFile(user, obj) {
  try {
    await promises.writeFile(getDbPath(user), JSON.stringify(obj));
  } catch (error) {
    console.log(error);
  }
  console.info("file created");
}

export function copyToPlayer(player, data) {
    return Object.assign(player,data);
}

export function validateUsernamePass(player,username,pass){
    return (player.nickname === username && player.pass === pass);
}
