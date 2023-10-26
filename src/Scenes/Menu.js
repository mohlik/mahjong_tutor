import { levels } from "../levels.js";

export class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
        this.arrStones = [];
        this.canvas
    }

    preload() {
        for ( let i = 0; i < 9; i++) {
            this.load.image(`bamboo${i + 1}`, `assets/tile_bamboo_${i + 1}.png`);
            this.arrStones.push(`bamboo${i + 1}`);
        }
        for ( let i = 0; i < 9; i++) {
            this.load.image(`circle${i + 1}`, `assets/tile_circle_${i + 1}.png`);
            this.arrStones.push(`circle${i + 1}`);
        }
        for ( let i = 0; i < 4; i++) {
            this.load.image(`flower${i + 1}`, `assets/tile_flower_${i + 1}.png`);
            this.arrStones.push(`flower${i + 1}`);
        }
        for ( let i = 0; i < 5; i++) {
            this.load.image(`symbol${i + 1}`, `assets/tile_symbol_${i + 1}.png`);
            this.arrStones.push(`symbol${i + 1}`);
        }
        this.load.image('japan', 'assets/japan.png');
        this.load.image('BOMB', 'assets/bomb.png');
        this.load.image('LIGHT', 'assets/lamp.png');
        this.load.image('SHUFFLE', 'assets/shuffle.png');
        this.load.image('FIREWORK', 'assets/firework.png');
        this.load.image('point', 'assets/point.png');

        this.load.image('mini_tile', 'assets/mini_tile.png');
        this.load.image('bot_field', 'assets/bot_field.png');
        this.load.image('bot_icon', 'assets/bot_icon.png');
        this.load.image('bot_name', 'assets/bot_name.png');
        this.load.image('dialog', 'assets/dialog.png');
        this.load.image('ok', 'assets/ok_button.png');
        this.load.image('lamp', 'assets/lamp_1.png');
        this.load.image('overlay', 'assets/over.png');
        this.load.image('booster_panel', 'assets/booster_panel.png');
        this.load.image('booster_overlay', 'assets/booster_overlay.png');

        this.load.image('action_1', 'assets/action_1.png');
        this.load.image('action_2', 'assets/action_2_v2.png');
        this.load.image('action_3', 'assets/action_3.png');
        this.load.image('action_4', 'assets/action_4.png');
        this.load.image('action_5', 'assets/action_5.png');
        this.load.image('action_6', 'assets/action_6.png');
        this.load.image('action_7', 'assets/action_7.png');
        this.load.image('action_8', 'assets/action_8.png');
        this.load.image('action_9', 'assets/action_9.png');
        this.load.image('action_10', 'assets/action_10.png');
        this.load.image('action_19', 'assets/action_19.png');

        this.load.image('banner', 'assets/banner.png');
        this.load.image('banner_overlay', 'assets/banner_overlay.png');
        this.load.image('bot_overlay', 'assets/bot_overlay.png');
        this.load.image('arrow', 'assets/arrow.png');

        this.canvas = this.sys.game.canvas;
    }

    create() {
        const con = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Click!").setOrigin(0.5,0.5);

        this.input.on('pointerdown', () => {
            this.scene.start('Tutorial', {level: levels[1], stones: this.arrStones, round: 1});
        })
    }
}