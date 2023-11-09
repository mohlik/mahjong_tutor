class BoosterStartEvents extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.emitter = engine.emitter;
        // this.states['booster2'] = true;
        this.states = {
            'booster1': true,
            'booster2': true,
            'booster4': true,
            'booster6': true
        }
        this.firework_temp = [];
    }

    init() {
        this.emitter.on('BOOSTER_START_EVENTS', (event) => this.booster_start_events(event))
    }

    booster_start_events(emit) {
        switch (emit.event) {
            case 'START_BOMB_BOOSTER':
                this.engine.emitter.emit('ACTION', {event: 'BOOSTER_START'});
                this.engine.boosters_state.bomb = true;
                this.scene.input.manager.canvas.style.cursor = 'url(assets/mahjong/bomb.png), auto';
                this.engine.playing_field.list.forEach(e => e.clearTint().setData('tint', false));
                this.engine.selected = [];
                this.bomb_booster();
                break;
            case 'START_LIGHT_BOOSTER':
                this.highlight_booster(true);
                break;
            case 'START_FIREWORK_BOOSTER':
                this.firework_booster();
                break;
            case 'START_SHUFFLE_BOOSTER':
                this.shuffle_booster();
                break;
        }
    }

    highlight_booster(bool) {
        const arr = this.engine.playing_field.list.filter(e => this.engine.click_on_tile(e, false, bool));
        if (bool) {
            this.emitter.emit('BOOSTER_EFFECT_EVENTS', {event: 'LIGHT_TILES', arr});
        }
        return arr;
    }

    shuffle_booster(bool) {
        let arr = {};
        arr.positions = [];
        this.engine.playing_field.list.forEach(e => {
            if (e.texture.key !== 'overlay'){
                arr.positions.push({x: e.x, y: e.y, depth: e.depth});
            }
        });
        const deck = this.engine.shuffle_deck(this.engine.playing_field.list);
        deck.forEach((e, i) => {
            if(e.texture.key === 'overlay') {
                deck.splice(i, 1);
            }
        })
        arr.deck = deck;
        this.emitter.emit('BOOSTER_EFFECT_EVENTS', {event: 'SHUFFLE_TILES', arr, bool});
        this.emitter.emit('EVENT', {event: 'BOOSTER_USED', id: 'SHUFFLE'});
    }

    bomb_neighbours_lighter(e) {
        const pool = this.highlight_booster(false)
        let arr = [e];
        game_data['utils'].bomb_table.forEach(coordinates_of_neighbour => {
            const neighbour = game_data['utils'].obj_neighbour(
                e, 
                coordinates_of_neighbour.x, 
                coordinates_of_neighbour.y, 
                pool,
                {x: 0, y: 0}
            )

            if (neighbour !== undefined) {
                arr.push(neighbour);
            }
        })
        return arr;
    }

    bomb_neighbours(e) {
        const pool = this.highlight_booster(false)
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
        game_data['utils'].bomb_table.forEach(coordinates_of_neighbour => {
            const neighbour = game_data['utils'].obj_neighbour(
                e, 
                coordinates_of_neighbour.x, 
                coordinates_of_neighbour.y, 
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

    bomb_booster() {
        this.engine.playing_field.list.forEach(e => {
            // const arr = this.bomb_neighbours(e),
                //   arr_light = this.bomb_neighbours_lighter(e);
            e.on('pointerover', () => {
                if(this.engine.boosters_state.bomb){
                    this.scene.input.manager.canvas.style.cursor = 'url(assets/mahjong/point_v2.cur), auto';
                    this.bomb_neighbours_lighter(e).forEach(a => {
                        a.setTint(0xf75c2d);
                        this.scene.tweens.add({
                            targets: a,
                            angle: Math.random() > 0.5 ? -4 : 4,
                            duration: 100,
                            repeat: -1,
                            yoyo: true
                        });
                    });
                    e.on('pointerdown', () => {
                        if (this.engine.boosters_state.bomb) {
                            this.scene.input.manager.canvas.style.cursor = '';
                            this.engine.playing_field.list.forEach(e => {
                                this.scene.tweens.killTweensOf(e);
                                e.setAngle(0);
                            });
                            this.engine.boosters_state.bomb = false;
                            this.bomb_neighbours_lighter(e).forEach(a => {
                                a.clearTint().setData('tint', false);
                            });
                            this.emitter.emit('BOOSTER_EFFECT_EVENTS', {event: 'BOMB_DESTROY', arr: this.bomb_neighbours(e)});
                            this.emitter.emit('EVENT', {event: 'BOOSTER_USED', id: 'BOMB', pt: new Phaser.Geom.Point(e.x, e.y), array: this.bomb_neighbours(e)});
                        }
                    });
                }
            });

            e.on('pointerout', () => {
                if (this.engine.boosters_state.bomb) {
                    this.scene.input.manager.canvas.style.cursor = 'url(assets/mahjong/bomb.png), auto';
                    this.engine.playing_field.list.forEach(e => {
                        this.scene.tweens.killTweensOf(e);
                        e.setAngle(0);
                    });
                    this.bomb_neighbours_lighter(e).forEach(a => {
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
    
    random_num = (min, max) => {
        const num = Math.random() * max;
        if(num > min && num < max){
            return num
        } else {
            return this.random_num(min, max);
        }
    }

    create_effect (point, alpha, scale) {
        const effect = new Phaser.GameObjects.Sprite(this.scene, point.x - this.engine.x, point.y, 'firework_effect')
                .setScale(0)
                .setAlpha(alpha)
                .setTint(new Phaser.Display.Color().random(50).color)
                .setName(scale > 0.5 ? 'big' : 'small');
        if(scale > 0.5) {
            this.engine.add(effect);
        } else {
            this.engine.playing_field.add(effect);
        }
        this.engine.getAll('name', 'big').forEach(e => this.engine.bringToTop(e));

        this.scene.tweens.add({
            targets: effect,
            scaleX: scale,
            scaleY: scale,
            duration: 500,
            ease: 'quart.out',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: effect,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        effect.destroy()
                    }
                })
            }
        })
    }

    launch_firework(box, tiles) {
        const start_point = new Phaser.Math.Vector2(box.x + this.engine.boosters_panel.x - this.fireworks_box.width, box.y + this.engine.boosters_panel.y);
        const end_point = new Phaser.Math.Vector2(((tiles[0].x + tiles[1].x) / 2) + this.engine.playing_field.x, (tiles[0].y + tiles[1].y) / 2 + this.engine.playing_field.y); // вычисление формулой
        const control_point = new Phaser.Math.Vector2(end_point.x + (Math.random() > 0.5 ? -this.random_num(50, 300) : this.random_num(50, 300)), (start_point.y + end_point.y) / 2);

        const curve = new Phaser.Curves.QuadraticBezier(start_point, control_point, end_point);
        const firework_projectile = this.scene.add.follower(curve, start_point.x, start_point.y, 'rocket');

        firework_projectile.startFollow({
            duration: (1000 - curve.getLength()) / 1.5,
            rotateToPath: true,
            onComplete: () => {
                this.create_effect(firework_projectile, 0.5, 0.6);
                firework_projectile.destroy();

                setTimeout(() => {
                    this.create_effect(tiles[0], 0.9, 0.3);
                    this.create_effect(tiles[1], 0.9, 0.3);
                    this.emitter.emit('BOOSTER_EFFECT_EVENTS', {event: 'FIREWORK_DESTROY', arr: tiles});
                }, 100);
            }
        })
    }

    get_random_tile(arr) {
        const tile = Phaser.Utils.Array.GetRandom(arr);
        if (this.firework_temp.includes(tile.name)){
            return this.get_random_tile(arr)
        } else {
            return tile
        }
    }

    firework_booster() {
        if (this.states['booster2'] && !this.fireworks_box) {

            const arr = this.highlight_booster(false);
            this.emitter.emit('EVENT', {event: 'BOOSTER_USED', id: 'FIREWORK'});
            if(arr.length > 7) {
                this.engine.boosters_panel.booster_used({'booster_id': 'booster2'});
                this.engine.boosters_panel.boosters['booster2'].switchState();
            }

            const get_num = () => {
                const num = Math.random();
                if (num <= 0.5) {
                    return 3
                } else {
                    return 4
                }
            }

            const num = get_num();

            let error_count = 0;

            if(arr.length > 7){
                for(let i = 0; i < num; i++) {

                    const e = this.get_random_tile(arr);
                    const a = arr.find(s => {
                        return (s.getData('key') === e.getData('key')) &&
                        (s.x !== e.x && s.y !== e.y) &&
                        (!this.firework_temp.includes(s.name))
                    });
                    if (a !== undefined && e !== undefined) {
                        this.firework_temp.push(e.name);
                        this.firework_temp.push(a.name);
                        if(!this.fireworks_box){
                            this.fireworks_box = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'common1', 'box1').setOrigin(0.5,0.5);
                            this.fireworks_box.x = this.engine.boosters_panel.background.width / 2 - this.fireworks_box.width / 2;
                            this.fireworks_box.y = this.fireworks_box.height + 5;
                            this.engine.boosters_panel.add(this.fireworks_box);
                            this.scene.tweens.add({
                                targets: this.fireworks_box,
                                y: this.fireworks_box.y - this.fireworks_box.height - 50,
                                scaleY: 1.2,
                                duration: 400,
                                onComplete: () => {
                                    this.scene.tweens.add({
                                        targets: this.fireworks_box,
                                        y: this.fireworks_box.y + 50,
                                        scaleY: 1,
                                        duration: 150,
                                        onComplete: () => {
                                            this.scene.tweens.add({
                                                targets: this.fireworks_box,
                                                y: "+=5",
                                                scaleY: 0.8,
                                                scaleX: 1.3,
                                                ease: 'quad.out',
                                                duration: 200,
                                                onComplete: () => {
                                                    this.scene.tweens.add({
                                                        targets: this.fireworks_box,
                                                        scaleY: 1,
                                                        scaleX: 1,
                                                        ease: 'quad.in',
                                                        y: "-=5",
                                                        duration: 200,
                                                        onComplete: () => {
                                                            setTimeout(() => {
                                                                this.launch_firework(this.fireworks_box, [e, a]);
                                                            }, this.random_num(0, 700));
                                                            setTimeout(() => {
                                                                this.scene.tweens.add({
                                                                    targets: this.fireworks_box,
                                                                    y: this.fireworks_box.y + this.fireworks_box.height,
                                                                    duration: 400,
                                                                    onComplete: () => {
                                                                        this.engine.boosters_panel.boosters['booster2'].remove_particles();
                                                                        this.fireworks_box.destroy();
                                                                        this.fireworks_box = false;
                                                                        this.states['booster2'] = true;
                                                                    }
                                                                })
                                                            }, 1500);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    })
                                }
                            });
                        } else {
                            setTimeout(() => {
                                this.launch_firework(this.fireworks_box, [e, a]);
                            }, this.random_num(0, 700));
                        }


                    } else {
                        error_count++
                        if(error_count > 10) {
                            this.emitter.emit('BOOSTER_ERROR_EVENTS', {event: 'FIREWORK_CANNOT_START'});
                            this.states['booster2'] = false;
                            return
                        }
                        i--
                    }
                }
            } else {
                this.emitter.emit('BOOSTER_ERROR_EVENTS', {event: 'FIREWORK_CANNOT_START'});
            }
        }
    }
}