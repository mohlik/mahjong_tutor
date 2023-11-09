class BoosterItem extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, engine, id) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.id = id;
        this.engine = engine;
        this.x = x;
        this.y = y;
        this.key = texture;
        this.amount = 0;
        this.setInteractive();
        this.on('pointerdown', () => {
            if(this.amount > 0) {
                this.engine.emitter.emit('BOOSTER_START_EVENTS', {event: 'START_' + this.key + '_BOOSTER'});
            }
            if(this.key === 'BOMB' && this.engine.boosters_state.bomb) {
                this.engine.emitter.emit('BOOSTER_START_EVENTS', {event: 'STOP_' + this.key + '_BOOSTER'});
            }
        });
    }

    update_amount() {
        this.amount = game_data['user_data']['boosters'][`booster${this.id}`];
    }
}