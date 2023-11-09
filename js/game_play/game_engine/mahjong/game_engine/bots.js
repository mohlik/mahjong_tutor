class Bots extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.emitter = engine.emitter;
        this.bots = [];

        this.middle_time = 0;
        this.start_speed = 0;
        this.prevous_time = new Date().getTime();
        this.time_array = [];
        this.state = false;
        this.bots_state = false;
        this.dinamic = false;
        this.ids = [];
        this.bots_display_array = [];
    }

    init(bots_data) {
        if(this.engine.round === 0){
            this.bots = [
                {
                    name: 'Saimon',
                    id: 1,
                    speed: 0,
                    chance: 0,
                    spells: [],
                    count: 0,
                    time: 0,
                    status: false
                },
                {
                    name: 'John',
                    id: 2,
                    speed: 0,
                    chance: 0,
                    spells: [],
                    count: 0,
                    time: 0,
                    status: false
                },
                {
                    name: 'David',
                    id: 3,
                    speed: 0,
                    chance: 0,
                    spells: [],
                    count: 0,
                    time: 0,
                    status: false
                }
            ];
        }

        this.ids = bots_data.ids;
        this.ids.forEach((id, index) => {
            this.bots[index].id = id
        });
        this.middle_time = bots_data.start_speed;
        this.start_speed = bots_data.start_speed;
        this.time_array.push(this.middle_time);
        this.bots.forEach((bot_obj, index) => {
            bot_obj.speed = (bots_data.bots[index].speed + Math.random() * bots_data.bots[index].spread) / 10;
            bot_obj.chance = bots_data.bots[index].chance;
            bot_obj.spells = bots_data.bots[index].spells;
            bot_obj.count = this.engine.get_total_items();
        })
        this.state = true;
        this.bots_state = true;
        if (this.engine.round === 0) {
            this.create_bots()
        } else {
            this.bots_display_array.forEach(bot => {
                bot.create_field();
                bot.update_score(this.bots.find(e => e.id === bot.id).count);
            })
        }
        if (!this.bots_events) {
            this.bots_events = new BotEvents(this.scene, this.engine).init();
            this.add(this.bots_events);
        }
        this.play();
        this.emitter.on('GAME_EVENTS', (emit) => {
            this.bots_events_handler(emit);
        });
    }

    destroy_bots() {
        if(this.bots_state) {
            this.bots_display_array.forEach(bot => {
                bot.destroy();
            });
        }
    }

    create_bots() {
        if(this.bots_state) {
            this.bots.forEach((bot, index) => {
                this[`display_${index}`] = new BotDisplay(this.scene, this.engine, 130, (index + 2) * 115 + 85, index, bot.id, bot.count).init();
                this.bots_display_array.push(this[`display_${index}`]);
                this.add(this[`display_${index}`]);
                console.log(this[`display_${index}`].x);
                console.log(this[`display_${index}`].y);
            });
        }
    }

    kick_looser(looser_id) {
        this.engine.boosters_panel.booster_items.forEach(e => e.remove_particles());
        setTimeout(() => {
            let pos = this.ids.indexOf(looser_id);
            if (pos === -1) pos = 0;
            const comp = this.bots_display_array[pos];
            try {game_data['scene'].tweens.add({
                targets: comp, 
                scaleX: 1.3, 
                scaleY: 1.3, 
                alpha: 0, 
                y: comp.y + 300, 
                duration: 1000, 
                onComplete: () => {
                    this.bots_display_array.splice(pos, 1);
                    this.bots.splice(pos, 1);
                    this.ids.splice(pos, 1);
                    comp.destroy();
                }
            });} catch {}
        }, 2000);
    }

    play() {
        this.prevous_time = new Date().getTime();
        this.middle_time = this.start_speed;
        this.main_loop = setInterval(() => {

            const difficulty =this.engine.playing_field.list.length / this.engine.game_events.free_tiles().length

            this.bots.forEach((bot, id) => {
                bot.time = bot.time + bot.speed * 0.1
                bot.speed += 0.001;
                if(Math.random() < (bot.chance / 100) && this.dinamic) {
                    switch (Phaser.Utils.Array.GetRandom(bot.spells)) {
                        case 'bomb':
                            this.emitter.emit('BOT_EVENTS', {event: 'BOMB', id, bot});
                            break;
                        case 'firework':
                            this.emitter.emit('BOT_EVENTS', {event: 'FIREWORK', id, bot});
                            break;
                        case 'light':
                            this.emitter.emit('BOT_EVENTS', {event: 'LIGHT', id, bot});
                            break;
                        case 'shuffle':
                            this.emitter.emit('BOT_EVENTS', {event: 'SHUFFLE', id, bot});
                            break;
                        case 'timeout':
                        	this.emitter.emit('BOT_EVENTS', {event: 'TIMEOUT', id, bot});
                            break;
                        case 'flash':
                            this.emitter.emit('BOT_EVENTS', {event: 'FLASH', id, bot});
                            break;
                    }
                }
            });
        }, 100);
    }

    pause() {
        clearInterval(this.main_loop);
    }

    bots_events_handler(emit) {
        switch(emit.event) {
            case 'TILES_FOUND':
                this.tiles_found();
                break;
        }
    }

    tiles_found() {
        const date = new Date().getTime();
        this.time_array.push((date - this.prevous_time) / 1000);
        this.middle_time = this.time_array.reduce((a ,b) => a + b) / this.time_array.length;
        this.prevous_time = date;
    }

    update(bool) {
        if(this.bots_state) {
            this.bots.forEach((bot, id) => {
                if(bot.time > this.middle_time || bool) {
                    bot.time = 0;
                    if(!this.engine.level_id === 0 || bot.count > 3){
                        bot.count--;
                        bot.count--;
                        this.bots_display_array[id].destroy_random_tiles(2);
                        this.bots_display_array.forEach(bb => {
                            if (bb.id === bot.id) {
                                bb.update_score(bot.count);
                            }
                        });
                        this.engine.shuffle_displays();
                    }
                    if(bot.count < 2 && this.state) {
                        if(this.engine.boosters_panel.state) {
                            this.engine.boosters_panel.reboot_states();
                        }

                        let raiting = [{count: this.engine.playing_field.list.length, id: 0}, ...this.bots];
                        raiting.sort((a, b) => {
                            return a.count - b.count;
                        });

                        this.emitter.emit('EVENT', {event: 'BOT_FINISHED', bot, id});
                        
                        this.pause();
                        this.state = false;

                        if (this.engine.level_active) {
                            this.emitter.emit('EVENT', {event: 'LEVEL_FINISHED_2', results: raiting.map(e => e.id), ids: raiting.length});
                            // this.round++;
                        }
                    }
                }
            });
        }

    }

    hide_overlay() {
        this.bots_display_array.forEach(e => {
            e.hide_overlay();
        })
    }

    show_overlay() {
        this.bots_display_array.forEach(e => {
            e.show_overlay(10);
        })
    }

    enable_dinamic() {
        this.dinamic = true;
    }

    disable_dinamic() {
        this.dinamic = false;
    }
}