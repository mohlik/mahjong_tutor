import { config } from "./config.js";
import { Menu } from "./Scenes/Menu.js";
import { Level } from "./Scenes/Level.js";
import { Tutorial } from "./Scenes/Tutorial.js";

const configI = config([Menu, Level, Tutorial]);
const game = new Phaser.Game(configI);

export {game}
