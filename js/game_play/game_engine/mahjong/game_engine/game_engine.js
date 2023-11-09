class GameEngine extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.round = -1;
        this.stone_scale = 0.7;
        this.deck = [];
        this.selected = [];
        this.emitter = new Phaser.Events.EventEmitter();
        this.game_state = true;
        this.boosters_state = {
            bomb: false,
            highlight: false,
            firework: false,
            shuffle: false
        }
        this.con_x = 0;
        this.con_y = 0;

        this.level_id;

        this.raiting  = [
            'player',
            'bot_1',
            'bot_2',
            'bot_3'
        ];

        this.debug = false;
    }

    init() {
        game_data['game_engine'] = this;

        this.playing_field = new PlayingField(this.scene, this);
        this.add(this.playing_field);
        this.boosters_panel = new BoostersPanel(this.scene, this);
        this.add(this.boosters_panel);
        this.game_events = new GameEvents(this.scene, this);
        this.game_events.init();
        this.bots = new Bots(this.scene, this);
        this.add(this.bots);
        this.player_display = new PlayerDisplay(this.scene, this, 130, 200, 'mohl1k');
        this.add(this.player_display);
        this.emoji_modal = new EmojiModal(this.scene, 1220, 885);
        this.add(this.emoji_modal);
        this.emoji_modal.init();

        this.overlay = new Overlay(this.scene, 1444, 720);
        this.add(this.overlay);
        this.arrow = new Arrow(this.scene);
        this.add(this.arrow);
        this.dialog = new Dialog(this.scene, this, 547, 520);
        this.add(this.dialog);
        this.dialog.init().hide();
        this.actions = new Actions(this.scene, this).init();
        this.add(this.actions);

        this.boosters_panel.init({engine: this});


        this.emitter.on('EVENT', (emit) => this.handler_booster_states(emit));

        if(this.debug) {
            const win_button = new Phaser.GameObjects.Sprite(this.scene, 200, 650, 'win_button').setInteractive();
            this.add(win_button);
            win_button.on('pointerdown', () => {
                if(this.actions) this.actions.action = 0;
                let raiting = [{count: this.playing_field.list.length, id: 0}, ...this.bots.bots];
                this.emitter.emit('EVENT', {event: 'LEVEL_FINISHED_2', results: raiting.map(e => e.id), ids: raiting.length});
            });

            const lose_button = new Phaser.GameObjects.Sprite(this.scene, 200, 700, 'lose_button').setInteractive();
            this.add(lose_button);
            lose_button.on('pointerdown', () => {
                if(this.actions) this.actions.action = 0;
                let raiting = [...this.bots.bots, {count: this.playing_field.list.length, id: 0}];
                this.emitter.emit('EVENT', {event: 'LEVEL_FINISHED_2', results: raiting.map(e => e.id), ids: raiting.length});
            })
        }
    }

    handler_booster_states(params) {
        switch(params.event) {
            case 'BOOSTER_DRAG_START':
		        this.handler_booster_drag_start(params);
            break;         
            case 'BOOSTER_DRAG_END':
                this.handler_booster_drag_end(params);
            break;           
            case 'RETURN_BOOSTER':
                this.handler_return_booster(params);
            break;           
            case 'APPLY_BOOSTER': 
                this.boosters_panel.apply_booster(params);
            break;  
            case 'BOOSTER_USED': 
                // this.boosters_panel.booster_used(params);
            break; 
            case 'BOOSTER_CLICK': 
                // this.playing_field.booster_click(params);
            break; 
        }
    }

    handler_booster_drag_end(params) {
        this.playing_field.booster_drag_end(params);
    }

    handler_booster_drag_start(params) {
        this.playing_field.booster_drag_start(params);
    }
    
    handler_return_booster(params) {
        this.boosters_panel.return_booster(params);
    }

    shuffle_displays() {
        let arr = [this.player_display, ...this.bots.bots_display_array];
        let new_raiting = arr.sort((a, b) => {
            return a.count - b.count
        });
        arr.forEach(comp => comp.move(new_raiting.map(e => e.raiting_place)));
    }
    
    update_boosters() {
        this.boosters_panel.update_boosters();
    }

    show_overlay(i) {
        this.overlay
            .setVisible(true)
            .setInteractive();

        this.overlay.x = this.overlay.x - this.con_x;
        this.overlay.y = this.overlay.y - this.con_y;
        
        this.list.splice(i, 0, this.overlay);
    }

    hide_overlay() {
        this.overlay
            .setVisible(false)
            .disableInteractive();
    }

    start_level(params) {

        this.destroy_level();
        if(this.round === 2) {
            this.round = 0;
        } else {
            this.round++;
        }

        this.collection = game_data['arr_stones'];
        this.level_active = true;
        this.level_id = params.level_id;

        if(this.level_id !== 0) {
            this.bots.enable_dinamic();
        }

        this.data_level = params.data;
        this.level = params.data.level;
        this.map = params.data.level.level;
        this.theme = params.data.level.theme;
        this.bots.init({bots: params.data.level.bots, start_speed: params.data.level.start_speed, ids: params.ids});

        this.deck = this.shuffle_deck(this.create_deck(this.get_required_tiles()));
        this.player_display.init();
        this.boosters_panel.update_panel({'level': this.level, 'level_id': this.level_id});
        
        this.playing_field.create_tiles(this.map);

        this.emitter.on('EVENT', (emit) => this.test_handler(emit));
    }

    get_tutorial_holes(obj) {
    
        if (obj['type'] == 'tutorial1') return this.playing_field.gems_manager.start_tutorial(obj);
        else if (obj['type'] == 'tutorial2') return game_data['field_tutorial_manager'].check_tutorial();
    }

    test_handler(emit) {
        if(emit.event === 'BOOSTER_USED') {
            switch (emit.id) {
                case 'FIREWORK':
                    break;
                case 'BOMB':
                    emit.array.forEach(e => {
                        let small_anim = new Phaser.GameObjects.Sprite(this.scene, e.x, e.y, 'deton_1').setScale(0,0);
                        this.playing_field.add(small_anim);
                        this.scene.tweens.add({
                            targets: small_anim,
                            scaleX: 1,
                            scaleY: 1,
                            duration: 200,
                            ease: 'quart.out',
                            yoyo: true,
                            onComplete: () => {
                                small_anim.destroy();
                            }
                        });
                    });
                    let anim = new Phaser.GameObjects.Sprite(this.scene, emit.pt.x, emit.pt.y, 'deton_1').setScale(0,0);
                    this.playing_field.add(anim);
                    this.scene.tweens.add({
                        targets: anim,
                        scaleX: 1.5,
                        scaleY: 1.5,
                        duration: 250,
                        ease: 'quart.out',
                        yoyo: true,
                        onComplete: () => {
                            anim.destroy();
                        }
                    });
                    break;
                case 'SHUFFLE':  
                    break;
                case 'HIGHLIGHT':
                    break;
            }
        }
    }

    get_total_items() {
        let count = 0;
        this.map[this.round].layers.forEach(layer => {
            layer.forEach(row => {
                row.forEach(origin => {
                    if (origin) {
                        count++;
                    }
                });
            });
        });
        return count
    }

    get_required_tiles() {
        let count = 0;
        this.map[this.round].layers.forEach(layer => {
            layer.forEach(row => {
                row.forEach(origin => {
                    if (origin !== false && !origin.texture) {
                        count++;
                    }
                });
            });
        });
        return count
    }

    create_deck(count) {
        while (this.deck.length < count) {
            const random_stone = Phaser.Utils.Array.GetRandom(this.collection);
            this.deck.push(random_stone, random_stone);
        }
        return this.deck
    }

    shuffle_deck(deck) {
        return Phaser.Actions.Shuffle(deck);
    }

    return_tile_texture(texture) {
        if (!texture) {
            return this.deck.pop()
        } else {
            return texture
        }
    }

    click_on_tile(sprite, bool, left_right) {
        let left_face = [],
            right_face = [],
            top_face = [];
        
        if (left_right) {    
            game_data['utils'].left_table.forEach(coordinates_of_neighbour => {
                const neighbour = game_data['utils'].obj_neighbour(
                    sprite, 
                    coordinates_of_neighbour.x, 
                    coordinates_of_neighbour.y, 
                    this.playing_field.list,
                    {x: 0, y: 0}
                )

                if (neighbour !== undefined) {
                    left_face.push(neighbour);
                }
            })

            game_data['utils'].right_table.forEach(coordinates_of_neighbour => {
                const neighbour = game_data['utils'].obj_neighbour(
                    sprite, 
                    coordinates_of_neighbour.x, 
                    coordinates_of_neighbour.y, 
                    this.playing_field.list,
                    {x: 0, y: 0}
                )

                if (neighbour !== undefined) {
                    right_face.push(neighbour);
                }
            })
        }

        game_data['utils'].top_table.forEach(coordinates_of_neighbour => {
            const neighbour = game_data['utils'].obj_neighbour(
                sprite, 
                coordinates_of_neighbour.x, 
                coordinates_of_neighbour.y, 
                this.playing_field.list,
                {x: 5.6, y: -5.6}
            );

            if (neighbour !== undefined) {
                top_face.push(neighbour);
            }
        })
        
        if (left_face.length > 0 && right_face.length > 0 || top_face.length > 0) {
            if (bool) {
                this.emitter.emit('GAME_EVENTS', {event: 'FAIL_SELECT', tile: sprite});
            }
            return false
        } else {
            if (bool) {
                this.emitter.emit('GAME_EVENTS', {event: 'SUCCESS_SELECT', tile: sprite});
            }
            return true
        }
    }

    level_complete(with_destroy) {
        with_destroy = with_destroy ? with_destroy : false;
        this.level_active = true;
        if (with_destroy) this.destroy_level();
    }

    destroy_level() {
        if(this.level_active) {
            this.playing_field.destroy_field();
            this.boosters_panel.reboot_states();
            this.bots.pause();
            this.overlay.hide();
            this.dialog.hide();
            // this.player_display.destroy_elements();
            // this.bots.destroy_bots();
            this.level_active = false;
        }
    }

    update() {
        if(this.bots) this.bots.update();
        // if(this.boosters_panel) this.boosters_panel.update_boosters();
    }
}