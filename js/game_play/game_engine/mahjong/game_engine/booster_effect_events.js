class BoosterEffectEvents extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.scene = scene;
        this.engine = engine
        this.pool = engine.playing_field.list
        this.emitter = engine.emitter;
        this.shuffle = false;
        this.highlight_state = this.engine.boosters_panel.booster_start.states['booster4'];
        this.light_tiles = [];
        this.selected = engine.selected;
        this.highlight_interval;
        this.timeout_state = false;
    }

    init() {
        this.emitter.on('BOOSTER_EFFECT_EVENTS', (event) => this.booster_effect_events(event));
    }

    booster_effect_events(emit) {
        switch(emit.event) {
            case 'BOMB_DESTROY': 
                this.bomb_destroy_effect(emit.arr)
                break;
            case 'FIREWORK_DESTROY':
                this.firework_effect(emit.arr)
                break;
            case 'LIGHT_TILES':
                this.light_tiles_effect(emit.arr);
                break;
            case 'SHUFFLE_TILES':
                this.shuffle_tiles_effect(emit.arr, emit.bool);
                break;
        }
    }

    bomb_destroy_effect(arr) {
        arr.slice(0, 12).forEach(e => {
            this.engine.player_display.destroy_tile(e);
            this.engine.player_display.update_score();
            e.destroy();
            this.emitter.emit('ACTION', {event: 'DESTROY'});
        });
        if(arr.length > 0) {
            this.engine.boosters_panel.booster_used({'booster_id': 'booster1'});
            this.engine.boosters_panel.boosters['booster1'].switchState();
            this.engine.boosters_panel.booster_items.forEach(e => e.remove_particles());
        }
        this.engine.shuffle_displays();
        this.pool.forEach(e => e.clearTint().setData('tint', false));
        this.emitter.emit('GAME_EVENTS', {event: 'DISMATCH'});
    }

    firework_effect(arr) {
        arr.forEach(e => {
            this.engine.player_display.destroy_tile(e);
            this.engine.player_display.update_score();
            e.destroy();
            this.emitter.emit('ACTION', {event: 'DESTROY'});
        });
        
        this.engine.shuffle_displays();
        this.emitter.emit('GAME_EVENTS', {event: 'DISMATCH'});
    }

    light_tiles_effect(arr) {
        if (this.highlight_state) {
            this.engine.boosters_panel.booster_used({'booster_id': 'booster4'});
            this.emitter.emit('EVENT', {event: 'BOOSTER_USED', id: 'HIGHLIGHT'});
            this.highlight_state = false;
            this.highlight_interval = setInterval(() => {
                this.emitter.emit('BOOSTER_START_EVENTS', {event: 'START_LIGHT_BOOSTER'});
            }, 500)
        }
        this.pool.forEach(e => {
            if(arr.find(a => a.x === e.x && a.y === e.y) === undefined) {
                e.setTint(0x676c85).setData('tint', 0x676c85);

                if(!this.timeout_state) {
                    this.timeout_state = true;
                    setTimeout(() => {
                        this.pool.forEach(g => {
                            if(g.getData('tint') === 0x676c85) {
                                g.clearTint().setData('tint', false);
                            }
                        })
                        this.highlight_state = true;
                        this.timeout_state = false;
                        this.engine.boosters_panel.boosters['booster4'].remove_particles();
                        this.engine.boosters_panel.boosters['booster4'].switchState();
                        clearInterval(this.highlight_interval);
                    }, 30000);
                }
            } else {
                if (e.getData('tint') === 0x676c85) {
                    e.clearTint();
                }
            }
        });
    }

    shuffle_tiles_effect(arr) {
        arr.deck.forEach((tile, index) => {
            this.scene.tweens.add({
                targets: tile,
                x: 275 - this.engine.con_y + ((Math.random() - 0.75) * 50),
                y: 260 - this.engine.con_x + ((Math.random() - 0.75) * 50),
                ease: 'quart.out',
                duration: 500,
                onStart: () => {
                    tile.show_overlay()
                    this.engine.boosters_panel.disable_booster('booster6')
                },
                onComplete: () => {
                    this.scene.tweens.add({
                        targets: tile,
                        x: arr.positions[index].x,
                        y: arr.positions[index].y,
                        ease: 'quart.out',
                        duration: 500,
                        onComplete: () => {
                            tile.hide_overlay();
                            this.engine.boosters_panel.enable_booster('booster6');
                            this.engine.boosters_panel.boosters['booster6'].remove_particles();
                            this.engine.boosters_panel.boosters['booster6'].switchState();
                            this.emitter.emit('GAME_EVENTS', {event: 'DISMATCH'});
                        }
                    })
                }
            })
        });
        this.engine.boosters_panel.booster_used({'booster_id': 'booster6'});
    }
}