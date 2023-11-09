class GameEvents extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.scene = scene;
        this.emitter = engine.emitter;
        this.engine = engine;
        this.pool = engine.playing_field.list;
        this.selected = engine.selected;
        this.first_bool = true;
        this.select_bool = true;
    }

    init() {
        this.emitter.on('GAME_EVENTS', (emit) => this.game_events_handler(emit));
    }

    game_events_handler(emit) {
        switch (emit.event) {
            case 'SUCCESS_SELECT':
                this.select_sprite(emit.tile);
                break;
            case 'FAIL_SELECT':
                this.failure_select(emit.tile);
                break;
            case 'DISMATCH':
                this.dismatch_event();  
                break;
            case 'GAME_OVER':
                console.log('GAMEOVER');
                console.log(`На поле осталось: ${emit.amount} плиток`);
                this.pool.forEach(tile => {
                    tile.setTint(0x676c85).setData('tint', 0x676c85);
                })
                break;
            case 'WIN':
                // if(!this.engine.tutor){
                //     switch (this.engine.round) {
                //         case 0:
                //             this.emitter.emit('LEVEL_MANAGER', {event: 'WON_FIRST_ROUND'});
                //             break;
                //         case 1:
                //             this.emitter.emit('LEVEL_MANAGER', {event: 'WON_SECOND_ROUND'});
                //             break;
                //         case 2:
                //             this.emitter.emit('LEVEL_MANAGER', {event: 'WON_THIRD_ROUND'});
                //             break;
                //     }
                // }

                if(this.engine.boosters_panel.state) {
                    this.engine.boosters_panel.reboot_states();
                }

                let raiting = [{count: this.engine.playing_field.list.length, id: 0}, ...this.engine.bots.bots];
                raiting.sort((a, b) => {
                    return a.count - b.count;
                });

                this.engine.bots.pause();
                this.engine.bots.state = false;

                if (this.engine.level_active) {
                    this.emitter.emit('EVENT', {event: 'LEVEL_FINISHED_2', results: raiting.map(e => e.id), ids: raiting.length});
                    // this.round++;
                }
                this.engine.level_active = false;
                break;
            case 'TILES_FOUND':
                this.destroy_tiles(emit.tiles);
                break;
            default:
                this.emitter.emit('EVENT', emit);
                break;
        }
    }


    destroy_tiles(arr) {
        arr.forEach((e, i) => {
            this.engine.player_display.destroy_tile(e);
            this.engine.player_display.update_score();
            this.engine.shuffle_displays();
            e.removeInteractive().clearTint();
            this.engine.playing_field.bringToTop(e);
            const side = () => {
                if(arr[0].x > arr[1].x) {
                    return 0
                } else {
                    return 1
                }
            }
            this.scene.tweens.add({
                targets: e,
                x: (i === side() ? 425 : 125) - this.engine.con_x,
                y: 260 - this.engine.con_y,
                ease: 'linear',
                duration: 300,
                onComplete: () => {
                    this.scene.tweens.add({
                        targets: e,
                        x: 275 - this.engine.playing_field.con_x,
                        y: 260 - this.engine.playing_field.con_y,
                        ease: 'quart.in',
                        duration: 500,
                        onComplete: () => {
                            e.destroy();
                            this.scene.moving_state = true;
                            if(this.engine.tutor) {
                                this.emitter.emit('ACTION', {event: 'DESTROY'});
                            } else {
                                this.emitter.emit('GAME_EVENTS', {event: 'DISMATCH'});
                            }
                        }
                    })
                }
            })
        });
    }

    select_sprite(sprite) {
        if(this.engine.debug) {
            this.engine.playing_field.list.forEach((e,i) => {
                if(e.name === sprite.name) {
                    console.log('tile index: ' + i);
                }
            })
            console.log('tile obj', sprite);
        }
        if (this.engine.level_id === 0) {
            this.emitter.emit('ACTION', {event: 'SELECT'});
        }
        if (this.selected.length === 0) {
            this.selected.push(sprite);
            sprite.setTint(0xfff6a8).setData('tint', 0xfff6a8);
        } else if (this.selected.length > 0 && 
            (this.selected[0].x !== sprite.x || this.selected[0].y !== sprite.y)) {

            if (this.selected[0].getData('key') === sprite.getData('key') && this.selected.length < 2) {
                this.selected.push(sprite);
                this.emitter.emit('GAME_EVENTS', {
                    event: 'TILES_FOUND', 
                    tiles: this.selected, 
                    amount: this.pool.length
                });
                this.selected = [];
                this.dismatch_event();
            } else {
                this.selected.forEach(e => e.clearTint().setData('tint', false));
                this.selected = [];
                this.selected.push(sprite.setTint(0xfff6a8).setData('tint', 0xfff6a8));
            }
        }
    }

    failure_select(sprite) {
        if(this.engine.debug) {
            this.engine.playing_field.list.forEach((e,i) => {
                if(e.name === sprite.name) {
                    console.log('tile index: ' + i);
                }
            })
            console.log('tile obj', sprite);
        }
        if (this.engine.level_id === 0 && this.engine.round === 0) {
            this.emitter.emit('ACTION', {event: 'FAIL'});
        }
        this.scene.tweens.add({
            targets: sprite,
            angle: 5,
            duration: 100,
            onStart: () => {
                sprite.removeInteractive();
            },
            onComplete: () => {
                this.scene.tweens.add({
                    targets: sprite,
                    angle: -5,
                    duration: 100,
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: sprite,
                            angle: 0,
                            duration: 100,
                            onComplete: () => {
                                sprite.setInteractive();
                            }
                        })
                    }
                })
            }
        })
        this.selected.forEach(e => {
            e.clearTint().setData('tint', false);
        });
        this.selected = [];
    }

    free_tiles() {
        let arr = [];
        this.engine.playing_field.list.forEach(e => {
            if(this.engine.click_on_tile(e, false, true)) {
               arr.push(e);
            }
        })
        return arr;
    }

    dismatch_event() {
        const arr = this.free_tiles(false);
        let bool = true;
        arr.forEach((e) => {
            const len = arr.filter((a) => a.getData('key') === e.getData('key')).length;
            if (len > 1) {
                bool = false;
            }
        });

        if (bool && this.engine.game_state) {
            if (this.engine.playing_field.list.length < 2) {
                this.emitter.emit('GAME_EVENTS', {event: 'WIN'});
                this.emitter.emit('EVENT', {event: 'PLAYER_FINISHED'});
                if(this.engine.actions) this.engine.actions.action = 0;
            } else {
                this.emitter.emit('GAME_EVENTS', {
                    event: 'GAME_OVER',
                    tiles: this.engine.playing_field.list,
                    amount: this.engine.playing_field.list.length
                });
            }
        }
    }
    
}