import { GameEngine } from "../GameEngine/GameEngine.js";
import { game } from "../index.js";

export class Level extends Phaser.Scene {
    constructor() {
        super("Level");
        this.movingState = true;
    }

    init(data) {
        this.game_engine = new GameEngine(this, data);
    }

    create() {
        this.game_engine.init();
        this.add.existing(this.game_engine);
  
        this.game_engine.start_level();
        this.game_engine.x
    }

    update() {
        this.game_engine.bots.update();

        if (this.movingState) {
            this.game_engine.moving_holder.x = this.game_engine.playing_field.x;
            this.game_engine.moving_holder.y = this.game_engine.playing_field.y;
        }
    }
}


