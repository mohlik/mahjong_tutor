import { TutorEngine } from "../Tutorial/TutorEngine.js";
import { Dialog } from '../Tutorial/Dialog.js';


export class Tutorial extends Phaser.Scene {
    constructor() {
        super('Tutorial');
        this.level_1 = {
            level: [{"layers":[[[false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,{"x":true,"y":true,"texture":"bamboo1"},{"x":true,"y":true,"texture":"bamboo1"},false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false]]],"active":1,"temp":{"layers":[],"bool":false}},{"layers":[[[false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,{"x":false,"y":true,"texture":"flower1"},false,false,false,false,false,false],[false,false,false,false,false,{"x":false,"y":false,"texture":"circle6"},{"x":false,"y":true,"texture":"circle1"},false,false,false,false,false,false],[false,false,false,false,false,{"x":false,"y":false,"texture":"circle1"},{"x":false,"y":true,"texture":"circle6"},false,false,false,false,false,false],[false,false,false,false,false,{"x":false,"y":false,"texture":"flower1"},false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false]]],"active":1,"temp":{"layers":[],"bool":false}},{"layers":[[[false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,{"x":true,"y":true,"texture":"circle2"},{"x":true,"y":true,"texture":"flower2"},{"x":true,"y":true,"texture":"circle6"},false,false,false,false,false,false],[false,false,false,false,{"x":true,"y":true,"texture":"circle6"},{"x":true,"y":true,"texture":"flower2"},{"x":true,"y":true,"texture":"circle2"},false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false]]],"active":1,"temp":{"layers":[],"bool":false}}],"bots":[{"speed":1,"spread":1,"chance":0.1,"spells":[]},{"speed":1,"spread":1,"chance":0.1,"spells":[]},{"speed":1,"spread":1,"chance":0.1,"spells":[]}],"theme":"japan","startSpeed":3,"orientation":"x"
        };
        this.level_2 = {
            level: [{"layers":[[[false,{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},false,{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},false,{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},false],[false,{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},false,{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},false,{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},false],[false,{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},false,{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},false,{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},false],[false,{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},false,{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},false,{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},{"x":false,"y":true,"texture":false},false],[false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false]]],"active":1,"temp":{"layers":[],"bool":false}},{"layers":[[[false,false,{"x":false,"y":true,"texture":false},false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,false,{"x":false,"y":true,"texture":false},false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false],[false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,false,{"x":false,"y":true,"texture":false},false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,false,{"x":false,"y":true,"texture":false},false],[false,false,{"x":false,"y":true,"texture":false},false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,false,{"x":false,"y":true,"texture":false},false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false],[false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,false,{"x":false,"y":true,"texture":false},false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,false,{"x":false,"y":true,"texture":false},false],[false,false,{"x":false,"y":true,"texture":false},false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,false,{"x":false,"y":true,"texture":false},false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false],[false,false,false,false,false,false,false,false,false,false,false,false,false]]],"active":1,"temp":{"layers":[],"bool":false}},{"layers":[[[false,false,false,false,false,false,false,false,false,false,false,false,false],[false,{"x":true,"y":false,"texture":false},false,{"x":false,"y":false,"texture":false},{"x":true,"y":false,"texture":false},false,{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},{"x":true,"y":false,"texture":false},false,{"x":false,"y":false,"texture":false},{"x":true,"y":false,"texture":false},false],[false,false,{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},{"x":true,"y":false,"texture":false},false,{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},false],[false,false,{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},{"x":true,"y":false,"texture":false},false,{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},false],[false,{"x":true,"y":false,"texture":false},false,{"x":false,"y":false,"texture":false},{"x":true,"y":false,"texture":false},false,{"x":false,"y":false,"texture":false},{"x":false,"y":false,"texture":false},{"x":true,"y":false,"texture":false},false,{"x":false,"y":false,"texture":false},{"x":true,"y":false,"texture":false},false],[false,false,false,false,false,false,false,false,false,false,false,false,false]],[[false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,{"x":false,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,{"x":true,"y":true,"texture":false},false,{"x":true,"y":true,"texture":false},false,{"x":false,"y":true,"texture":false},false,false],[false,false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,false,false,{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,false],[false,false,false,{"x":false,"y":true,"texture":false},{"x":true,"y":true,"texture":false},false,{"x":true,"y":true,"texture":false},false,{"x":true,"y":true,"texture":false},false,{"x":false,"y":true,"texture":false},false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false,false,false,false,false,false]]],"active":2,"temp":{"layers":[],"bool":false}}],"bots":[{"speed":1,"spread":1,"chance":0.1,"spells":["shuffle"]},{"speed":1,"spread":1,"chance":0.1,"spells":["shuffle"]},{"speed":1,"spread":1,"chance":0.1,"spells":["shuffle"]}],"theme":"japan","startSpeed":1,"orientation":"x"
        };

        this.level = 0;

        this.dialog;
        this.tutor = true;

        this.movingState = true;
    }

    init(data) {
        if(data.tutor) {
            this.game_engine = new TutorEngine(this, {level: data.tutor, stones: data.stones});
            this.level = 1;
        } else {
            this.game_engine = new TutorEngine(this, {level: this.level_1, stones: data.stones});
        }
        

        this.dialog = new Dialog(this, 547, 520, 'Hello');
    }

    create() {

        this.game_engine.init();
        this.add.existing(this.game_engine);
        this.dialog.init();
        this.add.existing(this.dialog);
        this.dialog.hide();
  
        this.game_engine.start_level();
        this.game_engine;
    }

    update() {
        this.game_engine.bots.update();

        if (this.movingState) {
            this.game_engine.moving_holder.x = this.game_engine.playing_field.x;
            this.game_engine.moving_holder.y = this.game_engine.playing_field.y;
        }
    }
}