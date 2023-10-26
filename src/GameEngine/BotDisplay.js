import { BotPlayingField } from "./BotPlayingField.js";

export class BotDisplay extends Phaser.GameObjects.Container {
    constructor(scene, engine, x, y, id, name, count) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.x = x;
        this.y = y;
        this.id = id;
        this.name = name;
        this.count = count;
        this.animationsHolder = [];
    }

    init() {
        this.overlay = new Phaser.GameObjects.Sprite(this.scene, 73, 70 * (this.id + 1 * 1.1) + 80, 'bot_overlay').setOrigin(0.5,0.5).setAlpha(0.5);
        this.add(this.overlay);
        this.hideOverlay();

        this.createBackground();
        this.createField();
        this.createText();
        return this
    }

    createField() {
        this.playing_field = new BotPlayingField(this.scene, this.engine, this.id);
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

    destroyRandomTiles(num) {
        num ? num = num : num = 1;

        for(let i = 0; i < num; i++){
            const tile = Phaser.Utils.Array.GetRandom(this.playing_field.list);
            if(tile) {
                tile.destroy();
            }
        }
    }

    updateScore(str) {
        this.score.setText(str);
    }

    showOverlay(i) {
        this.overlay
            .setVisible(true)
            .setInteractive();

        this.overlay.x = this.overlay.x - this.engine.conX;
        this.overlay.y = this.overlay.y - this.engine.conY;
        
        this.list.splice(i, 0, this.overlay);
    }

    hideOverlay() {
        this.overlay
            .setVisible(false)
            .disableInteractive();
    }

    playBooster(booster) {
        this.animation = new Phaser.GameObjects.Sprite(this.scene, this.iconLabel.x,this.iconLabel.y, booster).setScale(0, 0);
        this.animationsHolder.push(this.animation);
        this.add(this.animation);
        this.scene.tweens.add({
            targets: this.animation,
            scaleX: 1,
            scaleY: 1,
            duration: 1500,
            ease: 'quart.out',
            onComplete: () => {
                this.animationsHolder.forEach(animation => {
                    animation.destroy();
                })
            }
        })
    }
}