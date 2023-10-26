export class TutorGameEvents extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.emitter = engine.emitter;
        this.engine = engine;
        this.pool = engine.playing_field.list;
        this.selected = engine.selected;
        this.firstBool = true;
        this.selectBool = true;
    }

    init() {
        this.emitter.on('GAME_EVENTS', (emit) => this.gameEventsHandler(emit));
    }

    gameEventsHandler(emit) {
        switch (emit.event) {
            case 'SUCCESS_SELECT':
                this.selectSprite(emit.tile);
                break;
            case 'FAIL_SELECT':
                this.failureSelect(emit.tile);
                break;
            case 'DISMATCH':
                this.dismatchEvent();  
                break;
            case 'GAME_OVER':
                console.log('GAMEOVER');
                console.log(`На поле осталось: ${emit.amount} плиток`);
                this.pool.forEach(tile => {
                    tile.setTint(0x676c85).setData('tint', 0x676c85);
                })
                break;
            case 'TILES_FOUND':
                this.destroyTiles(emit.tiles);
                break;
            default:
                this.emitter.emit('EVENT', emit);
                break;
        }
    }


    destroyTiles(arr) {
        arr.forEach((e, i) => { 
            this.engine.player_display.destroyTile(e);
            this.engine.player_display.updateScore();
            this.scene.movingState = false;
            e.removeInteractive().clearTint();
            this.engine.moving_holder.add(e);
            const side = () => {
                if(arr[0].x > arr[1].x) {
                    return 0
                } else {
                    return 1
                }
            }
            const tween = this.scene.tweens.chain({
                targets: e,
                tweens: [
                    {
                        x: (i === side() ? 425 : 125) - this.engine.conX * this.engine.playing_field.scale,
                        y: 260 - this.engine.conY * this.engine.playing_field.scale,
                        ease: 'linear',
                        duration: 300
                    },
                    {
                        x: 275 - this.engine.conX * this.engine.playing_field.scale,
                        y: 260 - this.engine.conY * this.engine.playing_field.scale,
                        ease: 'quart.in',
                        duration: 500,
                        onComplete: () => {
                            this.scene.movingState = true;
                            e.destroy();
                            this.emitter.emit('ACTION', {event: 'DESTROY'});
                        }
                    }
                ]
            });
        });
    }

    selectSprite(sprite) {
        if (this.selected.length === 0) {
            if (this.selectBool) {
                this.emitter.emit('ACTION', {event: 'SELECT'});
                this.selectBool = false;
            }
            this.selected.push(sprite);
            sprite.setTint(0xfff6a8).setData('tint', 0xfff6a8);
        } else if (this.selected.length > 0 && 
            (this.selected[0].x !== sprite.x || this.selected[0].y !== sprite.y)) {

            if (this.selected[0].getData('key') === sprite.getData('key')) {
                this.selected.push(sprite);
                this.emitter.emit('GAME_EVENTS', {
                    event: 'TILES_FOUND', 
                    tiles: this.selected, 
                    amount: this.pool.length
                });
                this.selected = [];
                this.dismatchEvent();
            } else {
                this.selected.forEach(e => e.clearTint().setData('tint', false));
                this.selected = [];
                this.selected.push(sprite.setTint(0xfff6a8).setData('tint', 0xfff6a8));
            }
        }
    }

    failureSelect(sprite) {
        if (this.firstBool) {
            this.emitter.emit('ACTION', {event: 'FAIL'});
            this.firstBool = false;
        }
        this.scene.tweens.chain({
            targets: sprite,
            tweens: [
                {
                    angle: '+=5',
                    duration: 100,
                    onStart: () => {
                        sprite.removeInteractive();
                    }
                },
                {
                    angle: '-=10',
                    duration: 100
                },
                {
                    angle: '+=5',
                    duration: 100,
                    onComplete: () => {
                        sprite.setInteractive();
                    }
                }
            ]
        })
        this.selected.forEach(e => {
            e.clearTint().setData('tint', false);
        });
        this.selected = [];
    }

    freeTiles() {
        let arr = [];
        this.engine.playing_field.list.forEach(e => {
            if(this.engine.clickOnTile(e, false, true)) {
               arr.push(e);
            }
        })
        return arr;
    }

    dismatchEvent() {
        const arr = this.freeTiles(false);
        let bool = true;
        arr.forEach((e) => {
            const len = arr.filter((a) => a.getData('key') === e.getData('key')).length;
            if (len > 1) {
                bool = false;
            }
        });

        if (bool && this.engine.gameState) {
            if (this.engine.playing_field.list.length < 2) {
                this.emitter.emit('GAME_EVENTS', {event: 'WIN'})
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