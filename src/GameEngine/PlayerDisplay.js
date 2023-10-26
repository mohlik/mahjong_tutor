import { BotPlayingField } from "./BotPlayingField.js";

export class PlayerDisplay extends Phaser.GameObjects.Container {
    constructor(scene, engine, x, y, name) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.x = x;
        this.y = y;
        this.name = name;
        this.count;
    }

    init() {
        this.overlay = new Phaser.GameObjects.Sprite(this.scene, 73, 87, 'bot_overlay').setOrigin(0.5,0.5).setAlpha(0.5);
        this.add(this.overlay);
        this.hideOverlay();
        if(!this.playing_field){
            this.count = this.engine.get_total_items();
        } else {
            this.playing_field.destroy();
            this.count = this.engine.get_total_items();
        }
        this.createBackground();
        this.createField();
        this.createText();

        return this
    }

    createField() {
        this.playing_field = new BotPlayingField(this.scene, this.engine, -1);
        this.playing_field.createTiles();
        this.add(this.playing_field);
    }

    createBackground() {
        this.fieldLabel = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y, 'bot_field');
        this.iconLabel = new Phaser.GameObjects.Sprite(this.scene, this.x - 69, this.y, 'bot_icon');
        this.nameLabel = new Phaser.GameObjects.Sprite(this.scene, this.x - 27, this.y + 34, 'bot_name');
        this.add([this.fieldLabel, this.iconLabel, this.nameLabel]);
    }

    createText() {
        this.nameText = new Phaser.GameObjects.Text(this.scene, this.x - 75, this.y + 26, this.name);
        this.score = new Phaser.GameObjects.Text(this.scene, this.x - 7, this.y + 26, this.count);
        this.add(this.nameText);
        this.add(this.score);
    }

    destroyTile(tile) {
        const pool = this.engine.playing_field.list;
        pool.forEach((e, i) => {
            if(e.texture.key === 'overlay') {
                pool.splice(i, 1);
            }
        })
        pool.forEach((e, i) => {
            if(e.name == tile.name) {
                this.playing_field.list[i].destroy();
               }
        })
    }

    updateScore() {
        this.score.setText(this.playing_field.length);
    }

    showOverlay(i) {
        this.overlay
            .setVisible(true)
            // .setInteractive();

        this.overlay.x = this.overlay.x - this.engine.conX;
        this.overlay.y = this.overlay.y - this.engine.conY;
        
        this.list.splice(i, 0, this.overlay);
    }

    hideOverlay() {
        this.overlay
            .setVisible(false)
            // .disableInteractive();
    }

}