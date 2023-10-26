export class BotEvents extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene)
        this.scene = scene;
        this.engine = engine;
        this.emitter = engine.emitter;
    }

    init() {
        this.emitter.on('BOT_EVENTS', (emit) => {
            this.botEventsHandler(emit);
        })
    }

    botEventsHandler(emit) {
        switch(emit.event) {
            case 'BOMB':
                this.botBomb(emit.id, emit.bot, emit.event);
                this.emitter.emit('BOT_BOOSTER_USED', emit.id);
                break;
            case 'FIREWORK': 
                this.botFirework(emit.id, emit.bot, emit.event);
                this.emitter.emit('BOT_BOOSTER_USED', emit.id);
                break;
            case 'LIGHT':
                this.botLight(emit.id, emit.bot, emit.event);
                this.emitter.emit('BOT_BOOSTER_USED', emit.id);
                break;
            case 'SHUFFLE':
                this.botShuffle(emit.id, emit.bot, emit.event);
                this.emitter.emit('BOT_BOOSTER_USED', emit.id); 
                break;
            case 'TIMEOUT':
                this.botTimeout(emit.id, emit.bot);
                break;
            case 'FLASH':
                this.botFlash(emit.id, emit.bot);
                break;
        }
    }

    getCountBomb() {
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

    getCountFirework() {
        const num = Math.random();
        if(num > 0 && num <= 0.5){
            return 6
        } else if (num > 0.5 && num <= 0.9) {
            return 8
        } else {
            return 0
        }
    }

    botsTilesDestroy(botID, botObj, func) {
        console.log(botID + ' bomb');
        const count = func();
        console.log(botObj.count);
        botObj.count -= count;
        console.log(botObj.count);
        this.engine.bots[`display_${botID}`].destroyRandomTiles(count);
        this.engine.bots[`display_${botID}`].updateScore(botObj.count);
        if(botObj.count < 1 && this.engine.bots.state) {

            switch (this.engine.round) {
                case 0:
                    this.emitter.emit('LEVEL_MANAGER', {event: 'LOST_FIRST_ROUND'});
                    break;
                case 1:
                    this.emitter.emit('LEVEL_MANAGER', {event: 'LOST_SECOND_ROUND'});
                    break;
                case 2:
                    this.emitter.emit('LEVEL_MANAGER', {event: 'LOST_THIRD_ROUND'});
                    break;
            }
            
            console.log(bot.name + ' win!');
            this.engine.bots.state = false;
        }
    }

    botBomb(botID, botObj, event) {
        this.botsTilesDestroy(botID, botObj, this.getCountBomb);
        this.playAnimation(botID, event);
    }

    botFirework(botID, botObj, event) {
        this.botsTilesDestroy(botID, botObj, this.getCountFirework);
        this.playAnimation(botID, event);
    }

    botLight(botID, botObj, event) {
        console.log(botID + ' light');
        this.playAnimation(botID, event);
        botObj.speed++;
        setTimeout(() => botObj.speed--, 30000);
    }

    botShuffle(botID, botObj, event) {
        console.log(botID + ' shuffle');
        this.playAnimation(botID, event);
        botObj.speed += Math.random();
    }

    botTimeout(botID, botObj) {
        console.log(botID + ' timeout');
    }

    botFlash(botID, botObj) {
        console.log(botID + ' flash');
    }

    playAnimation(botID, booster) {
        this.engine.bots[`display_${botID}`].playBooster(booster);
    }
}