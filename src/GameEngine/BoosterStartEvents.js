import { objNeighbour, tablesNeighbours } from "../utilits.js";

export class BoosterStartEvents extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.pool = engine.playing_field.list;
        this.emitter = engine.emitter;
        this.fireworkState = true;

        // bomb clear gameevent
    }

    init() {
        this.emitter.on('BOOSTER_START_EVENTS', (event) => this.boosterStartEvents(event))
    }

    boosterStartEvents(emit) {
        switch (emit.event) {
            case 'START_BOMB_BOOSTER':
                this.engine.boostersState.bomb = true;
                this.pool.forEach(e => e.clearTint().setData('tint', false));
                this.engine.selected = [];
                this.bombBooster();
                break;
            case 'START_HIGHLIGHT_BOOSTER':
                this.highlightBooster(true);
                break;
            case 'START_FIREWORK_BOOSTER':
                this.fireworkBooster();
                break;
            case 'START_SHUFFLE_BOOSTER':
                this.shuffleBooster();
                break;
        }
    }

    highlightBooster(bool) {
        const arr = this.engine.playing_field.list.filter(e => this.engine.clickOnTile(e, false, bool));
        if (bool) {
            this.emitter.emit('BOOSTER_EFFECT_EVENTS', {event: 'LIGHT_TILES', arr});
        }
        return arr;
    }

    shuffleBooster() {
        let arr = {};
        arr.positions = [];
        this.engine.playing_field.list.forEach(e => {
            if (e.texture.key !== 'overlay'){
                arr.positions.push({x: e.x, y: e.y, depth: e.depth});
            }
        });
        const deck = this.engine.shuffleDeck(this.pool);
        deck.forEach((e, i) => {
            if(e.texture.key === 'overlay') {
                deck.splice(i, 1);
            }
        })
        arr.deck = deck;
        this.emitter.emit('BOOSTER_EFFECT_EVENTS', {event: 'SHUFFLE_TILES', arr});
        this.emitter.emit('EVENT', {event: 'BOOSTER_USED', id: 'SHUFFLE'});
    }

    bombNeighboursLighter(e) {
        const pool = this.highlightBooster(false)
        let arr = [e];
        tablesNeighbours.bomb.forEach(coordinatesOfNeighbour => {
            const neighbour = objNeighbour(
                e, 
                coordinatesOfNeighbour.x, 
                coordinatesOfNeighbour.y, 
                pool,
                {x: 0, y: 0}
            )

            if (neighbour !== undefined) {
                arr.push(neighbour);
            }
        })
        return arr;
    }

    bombNeighbours(e) {
        const pool = this.highlightBooster(false)
        let arr = [];
        const j = pool.find(s => {
            let bool = true;
            arr.forEach((f => {
                if (s.x === f.x && s.y === f.y) {
                    bool = false;
                }
            }))
            return (s.getData('key') === e.getData('key')) &&
            (s.x !== e.x && s.y !== e.y) &&
            bool
        })
        if (j !== undefined) {
            arr.push(e, j);
        }
        tablesNeighbours.bomb.forEach(coordinatesOfNeighbour => {
            const neighbour = objNeighbour(
                e, 
                coordinatesOfNeighbour.x, 
                coordinatesOfNeighbour.y, 
                pool,
                {x: 0, y: 0}
            )

            if (neighbour !== undefined) {
                const a = pool.find(s => {
                    let bool = true;
                    arr.forEach((f => {
                        if (s.x === f.x && s.y === f.y) {
                            bool = false;
                        }
                    }))
                    return (s.getData('key') === neighbour.getData('key')) &&
                    (s.x !== neighbour.x && s.y !== neighbour.y) &&
                    bool
                })
                if (a !== undefined) {
                    arr.push(neighbour, a);
                }
            }
        })
        return arr;
    }

    bombBooster() {
        this.engine.playing_field.list.forEach(e => {
            const arr = this.bombNeighbours(e),
                  arrLight = this.bombNeighboursLighter(e);
            e.on('pointerover', () => {
                if(this.engine.boostersState.bomb){
                    this.scene.input.manager.canvas.style.cursor = 'url(assets/point.cur), pointer';
                    arrLight.forEach(a => {
                        a.setTint(0xf75c2d);
                    });
                    e.on('pointerdown', () => {
                        if (this.engine.boostersState.bomb) {
                            this.scene.input.manager.canvas.style.cursor = '';
                            this.engine.boostersState.bomb = false;
                            arrLight.forEach(a => {
                                a.clearTint().setData('tint', false);
                            });
                            this.emitter.emit('BOOSTER_EFFECT_EVENTS', {event: 'BOMB_DESTROY', arr});
                            this.emitter.emit('EVENT', {event: 'BOOSTER_USED', id: 'BOMB', pt: new Phaser.Geom.Point(e.x, e.y)});
                        }
                    });
                }
            });

            e.on('pointerout', () => {
                if (this.engine.boostersState.bomb) {
                    this.scene.input.manager.canvas.style.cursor = '';
                    arrLight.forEach(a => {
                        const tint = a.getData('tint');
                        if(tint) {
                            a.setTint(tint);
                        } else {
                            a.clearTint().setData('tint', false);
                        }
                    });
                } 
            });
        });
    }

    fireworkBooster() {
        if (this.fireworkState) {
            const arr = this.highlightBooster(false);
            this.emitter.emit('EVENT', {event: 'BOOSTER_USED', id: 'FIREWORK'});

            const getN = () => {
                const num = Math.random();
                if (num <= 0.5) {
                    return 3
                } else {
                    return 4
                }
            }

            const num = getN();

            let errorCount = 0;

            for(let i = 0; i < num; i++) {
                const e = Phaser.Utils.Array.GetRandom(arr);
                const a = arr.find(s => {
                    return (s.getData('key') === e.getData('key')) &&
                    (s.x !== e.x && s.y !== e.y) 
                });
                if (a !== undefined && e !== undefined) {
                    this.emitter.emit('BOOSTER_EFFECT_EVENTS', {event: 'FIREWORK_DESTROY', arr: [e, a]});
                } else {
                    errorCount++
                    if(errorCount > 10) {
                        this.emitter.emit('BOOSTER_ERROR_EVENTS', {event: 'FIREWORK_CANNOT_START'});
                        this.fireworkState = false;
                        return
                    }
                    i--
                }
            }
        }
    }
}