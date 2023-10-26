import { BoosterItem } from "./BoosterItem.js";
import { BoosterEffectEvents } from "./BoosterEffectEvents.js";
import { BoosterStartEvents } from "./BoosterStartEvents.js";

export class BoosterPanel extends  Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.boostersString = [
            'BOMB',
            'FIREWORK',
            'LIGHT',
            'SHUFFLE'
        ];
        this.boosters = {};
        this.emitter = engine.emitter
        this.x = 591.5;
        this.y = 720;
    }

    init() {
        this.createBackground();
        this.overlay = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'booster_overlay').setOrigin(0,1).setAlpha(0.5);
        this.add(this.overlay);
        this.hideOverlay();

        this.boosterStart = new BoosterStartEvents(this.scene, this.engine);
        this.boosterEffect = new BoosterEffectEvents(this.scene, this.engine);
        this.boostersString.forEach((texture, i) => {
            this.boosters[texture] = new BoosterItem(this.scene, i * 66 + 34, -31.5, texture, this.engine)
            this.add(this.boosters[texture]);
        })
        this.boosterStart.init();
        this.boosterEffect.init();
    } 
    
    createBackground() {
        this.background = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'booster_panel').setOrigin(0, 1);
        this.add(this.background);
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

    disableBoosters() {
        Object.keys(this.boosters).forEach(key => {
            this.boosters[key].disableInteractive();
        })
    }

    enableBoosters() {
        Object.keys(this.boosters).forEach(key => {
            this.boosters[key].setInteractive();
        })
    }

    disableBooster(booster) {
        this.boosters[booster].disableInteractive();
    }

    enableBooster(booster) {
        this.boosters[booster].setInteractive();
    }
}