export class BoosterEffectEvents extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.scene = scene;
        this.engine = engine
        this.pool = engine.playing_field.list
        this.emitter = engine.emitter;
        this.shuffle = false;
        this.highlightState = false;
        this.lightTiles = [];
        this.selected = engine.selected;
        this.highlightInterval;
        this.timeoutState = false;
    }

    init() {
        this.emitter.on('BOOSTER_EFFECT_EVENTS', (event) => this.boosterEffectEvents(event));
    }

    boosterEffectEvents(emit) {
        switch(emit.event) {
            case 'FIREWORK_DESTROY':
                this.fireworkEffect(emit.arr)
                break;
            case 'BOMB_DESTROY': 
                this.bombDestroyEffect(emit.arr)
                break;
            case 'LIGHT_TILES':
                this.lighttilesEffect(emit.arr);
                break;
            case 'SHUFFLE_TILES':
                this.shuffleTilesEffect(emit.arr);
                break;
        }
    }

    fireworkEffect(arr) {
        arr.forEach(e => {
            this.engine.player_display.destroyTile(e);
            this.engine.player_display.updateScore();
            console.log(e);
            e.destroy();
            this.emitter.emit('ACTION', {event: 'DESTROY'});
        });
        this.emitter.emit('GAME_EVENTS', {event: 'DISMATCH'});
    }

    bombDestroyEffect(arr) {
        console.log(arr)
        arr.slice(0, 12).forEach(e => {
            this.engine.player_display.destroyTile(e);
            this.engine.player_display.updateScore();
            console.log(e);
            e.destroy();
            this.emitter.emit('ACTION', {event: 'DESTROY'});
        });
        this.pool.forEach(e => e.clearTint().setData('tint', false));
        this.emitter.emit('GAME_EVENTS', {event: 'DISMATCH'});
    }

    lighttilesEffect(arr) {
        if (!this.highlightState) {
            this.emitter.emit('EVENT', {event: 'BOOSTER_USED', id: 'HIGHLIGHT'});
            this.highlightState = true;
            this.highlightInterval = setInterval(() => {
                this.emitter.emit('BOOSTER_START_EVENTS', {event: 'START_HIGHLIGHT_BOOSTER'});
            }, 500)
        }
        this.pool.forEach(e => {
            if(arr.find(a => a.x === e.x && a.y === e.y) === undefined) {
                e.setTint(0x676c85).setData('tint', 0x676c85);

                if(!this.timeoutState) {
                    this.timeoutState = true;
                    setTimeout(() => {
                        this.pool.forEach(g => {
                            if(g.getData('tint') === 0x676c85) {
                                g.clearTint().setData('tint', false);
                            }
                        })
                        this.highlightState = false;
                        this.timeoutState = false;
                        clearInterval(this.highlightInterval);
                    }, 30000);
                }
            } else {
                if (e.getData('tint') === 0x676c85) {
                    e.clearTint();
                }
            }
        });
    }

    shuffleTilesEffect(arr) {
        arr.deck.forEach((tile, index) => {
            this.scene.tweens.chain({
                targets: tile,
                tweens: [
                    {
                        x: 275 - this.engine.conY + ((Math.random() - 0.75) * 50),
                        y: 260 - this.engine.conY + ((Math.random() - 0.75) * 50),
                        ease: 'quart.out',
                        duration: 500,
                        onStart: () => {
                            tile.removeInteractive();
                            this.engine.boosterPanel.disableBooster('SHUFFLE');
                        }
                    },
                    {
                        x: arr.positions[index].x,
                        y: arr.positions[index].y,
                        ease: 'quart.out',
                        duration: 500,
                        onComplete: () => {
                            tile.setInteractive();
                            this.emitter.emit('GAME_EVENTS', {event: 'DISMATCH'});
                            this.engine.boosterPanel.enableBooster('SHUFFLE');
                        }
                    }
                ]
            });
        });
    }
}