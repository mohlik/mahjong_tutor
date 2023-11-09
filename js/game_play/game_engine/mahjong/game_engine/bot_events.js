class BotEvents extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene)
        this.scene = scene;
        this.engine = engine;
        this.emitter = engine.emitter;
    }

    init() {
        this.emitter.on('BOT_EVENTS', (emit) => {
            this.bot_event_handler(emit);
        });

        return this;
    }

    bot_event_handler(emit) {
        switch(emit.event) {
            case 'BOMB':
                this.bot_bomb(emit.id, emit.bot, emit.event);
                this.emitter.emit('BOT_BOOSTER_USED', emit.id);
                break;
            case 'FIREWORK': 
                this.bot_firework(emit.id, emit.bot, emit.event);
                this.emitter.emit('BOT_BOOSTER_USED', emit.id);
                break;
            case 'LIGHT':
                this.bot_light(emit.id, emit.bot, emit.event);
                this.emitter.emit('BOT_BOOSTER_USED', emit.id);
                break;
            case 'SHUFFLE':
                this.bot_shuffle(emit.id, emit.bot, emit.event);
                this.emitter.emit('BOT_BOOSTER_USED', emit.id); 
                break;
            case 'TIMEOUT':
                this.bot_timeout(emit.id, emit.bot);
                break;
            case 'FLASH':
                this.bot_flash(emit.id, emit.bot);
                break;
        }
    }

    get_count_bomb() {
        const num = Math.random();
        if (num > 0 && num <= 0.2) {
            return 2
        } else if (num > 0.2 && num <= 0.4) {
            return 4
        } else if(num > 0.4 && num <= 0.6) {
            return 6
        } else if (num > 0.6 && num <= 0.8) {
            return 8
        } else if (num > 0.8 && num <= 0.9) {
            return 10
        } else {
            return 0
        }
    }

    get_count_firework() {
        const num = Math.random();
        if(num > 0 && num <= 0.5){
            return 3
        } else {
            return 4
        }
    }

    bot_tiles_destroy(bot_id, bot_obj, func) {
        const count = func();
        bot_obj.count -= count;
        this.engine.bots[`display_${bot_id}`].destroy_random_tiles(count);
        this.engine.bots[`display_${bot_id}`].update_score(bot_obj.count, true);
        this.engine.shuffle_displays();
    }

    bot_bomb(bot_id, bot_obj, event) {
        this.bot_tiles_destroy(bot_id, bot_obj, this.get_count_bomb);
        this.play_animation(bot_id, event);
    }

    bot_firework(bot_id, bot_obj, event) {
        const count = this.get_count_firework()
        for(let i = 0; i < count; i++) {
            setTimeout(() => this.bot_tiles_destroy(bot_id, bot_obj, () => 2), Math.random() * 1500);
        }
        this.play_animation(bot_id, event);
    }

    bot_light(bot_id, bot_obj, event) {
        this.play_animation(bot_id, event);
        bot_obj.speed++;
        setTimeout(() => bot_obj.speed--, 30000);
    }

    bot_shuffle(bot_id, bot_obj, event) {
        this.play_animation(bot_id, event);
        bot_obj.speed += Math.random();
    }

    bot_timeout(bot_id, bot_obj) {
        console.log(bot_id + ' timeout');
    }

    bot_flash(bot_id, bot_obj) {
        console.log(bot_id + ' flash');
    }

    play_animation(bot_id, booster) {
        this.engine.bots[`display_${bot_id}`].play_booster(booster);
        // this.engine.bots[`display_${bot_id}`].update_score();
    }
}