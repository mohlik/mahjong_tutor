export class BoosterItem extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, engine) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.engine = engine;
        this.x = x;
        this.y = y;
        this.key = texture;
        // this.setOrigin(0,1)
        this.setInteractive()
        this.on('pointerdown', () => {
            this.engine.emitter.emit('BOOSTER_START_EVENTS', {event: 'START_' + this.key + '_BOOSTER'});
        });
    }
}