import { BotEvents } from "./BotEvents.js";
import { BotDisplay } from "./BotDisplay.js";

export class Bots extends Phaser.GameObjects.Container {
    constructor(scene, engine, bots) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.emitter = engine.emitter;
        this.bots = [
            {
                name: 'Saimon',
                speed: (bots.bots[0].speed + Math.random() * bots.bots[0].spread) / 10,
                chance: bots.bots[0].chance,
                spells: bots.bots[0].spells,
                count: this.engine.get_total_items(),
                time: 0,
                status: false
            },
            {
                name: 'John',
                speed: (bots.bots[1].speed + Math.random() * bots.bots[1].spread) / 10,
                chance: bots.bots[1].chance,
                spells: bots.bots[1].spells,
                count: this.engine.get_total_items(),
                time: 0,
                status: false
            },
            {
                name: 'David',
                speed: (bots.bots[2].speed + Math.random() * bots.bots[2].spread) / 10,
                chance: bots.bots[2].chance,
                spells: bots.bots[2].spells,
                count: this.engine.get_total_items(),
                time: 0,
                status: false
            }
        ];
        
        this.prevousTime = new Date().getTime();
        this.middleTime = bots.startSpeed;
        this.startSpeed = bots.startSpeed;
        this.timeArray = [this.middleTime];
        this.state = true;
        this.botsState = false;
        this.dinamic = false;
    }

    init() {
        this.botsState = true;
        this.botsDisplayArray = [];
        this.createBots();
        this.botsEvents = new BotEvents(this.scene, this.engine);
        this.add(this.botsEvents);
        this.botsEvents.init();
        this.play();
        this.emitter.on('GAME_EVENTS', (emit) => {
            this.botsEventsHandler(emit);
        });
    }

    destroyBots() {
        if(this.botsState) {
            this.botsDisplayArray.forEach(bot => {
                bot.destroy();
            });
        }
    }

    createBots() {
        if(this.botsState) {
            this.bots.forEach((bot, id) => {
                this[`display_${id}`] = new BotDisplay(this.scene, this.engine, 100, id * 70 + 150, id, bot.name, bot.count).init();
                this.botsDisplayArray.push(this[`display_${id}`]);
                this.add(this[`display_${id}`]);
            });
        }
    }

    play() {
        this.prevousTime = new Date().getTime();
        this.middleTime = this.startSpeed;
        this.mainLoop = setInterval(() => {

            const difficulty =this.engine.playing_field.list.length / this.engine.gameEvents.freeTiles().length
            console.log(difficulty);

            this.bots.forEach((bot, id) => {
                bot.time = bot.time + bot.speed * 0.1
                bot.speed += 0.001;
                if(Math.random() < (bot.chance) && this.dinamic) {
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
        clearInterval(this.mainLoop);
    }

    botsEventsHandler(emit) {
        switch(emit.event) {
            case 'TILES_FOUND':
                this.tilesFound();
                break;
        }
    }

    tilesFound() {
        const date = new Date().getTime();
        this.timeArray.push((date - this.prevousTime) / 1000);
        this.middleTime = this.timeArray.reduce((a ,b) => a + b) / this.timeArray.length;
        console.log(this.middleTime)
        this.prevousTime = date;
    }

    update() {
        if(this.botsState) {
            this.bots.forEach((bot, id) => {
                if(bot.time > this.middleTime && bot.count > 0) {

                    bot.time = 0;
                    bot.count--;
                    bot.count--;
                    this[`display_${id}`].destroyRandomTiles(2);
                    this[`display_${id}`].updateScore(bot.count);
                    console.log(bot.name + ': ' + bot.count);


                    if(bot.count < 1 && this.state) {

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
                        this.state = false;
                    }
                }
            });
        }

    }

    hideOverlay() {
        this.botsDisplayArray.forEach(e => {
            e.hideOverlay();
        })
    }

    showOverlay() {
        this.botsDisplayArray.forEach(e => {
            e.showOverlay(10);
        })
    }

    enableDinamic() {
        this.dinamic = true;
    }

    disableDinamic() {
        this.dinamic = false;
    }
}