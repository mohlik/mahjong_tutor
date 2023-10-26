import { objNeighbour, tablesNeighbours } from "../utilits.js";
import { BoosterPanel } from "./BoosterPanel.js";
import { GameEvents } from "./GameEvents.js";
import { PlayingField } from "./PlayingField.js";
import { MovingHolder } from "./MovingHolder.js";
import { Bots } from "./Bots.js";
import { TempLevelManager } from "./TempLevelManager.js";
import { PlayerDisplay } from "./PlayerDisplay.js";
import { Banner } from "./Banner.js";

export class GameEngine extends Phaser.GameObjects.Container {
    constructor(scene, data) {
        super(scene);
        this.bots = {bots: data.level.bots, startSpeed: data.level.startSpeed}
        this.scene = scene;
        this.orientation = data.level.orientation;
        this.level = data.level;
        this.map = data.level.level;
        this.theme = data.level.theme;
        this.round = 0;
        this.stoneScale = 0.7;
        this.collection = data.stones;
        this.deck = [];
        this.selected = [];
        this.emitter = new Phaser.Events.EventEmitter();
        this.gameState = true;
        this.boostersState = {
            bomb: false,
            highlight: false,
            firework: false,
            shuffle: false
        }
        this.conX = 0;
        this.conY = 0;

        this.setSize(550,520);
    }

    init() {
        this.deck = this.shuffleDeck(this.createDeck(this.getRequiredTiles()));
        this.createBackground(this.theme);

        this.playing_field = new PlayingField(this.scene, this, this.orientation);
        this.add(this.playing_field);
        this.boosterPanel = new BoosterPanel(this.scene, this);
        this.add(this.boosterPanel);
        this.gameEvents = new GameEvents(this.scene, this);
        this.moving_holder = new MovingHolder(this.scene);
        this.add(this.moving_holder);
        this.bots = new Bots(this.scene, this, this.bots);
        this.add(this.bots);
        this.bots.enableDinamic();
        this.level_manager = new TempLevelManager(this.scene, this);
        this.add(this.level_manager);
        this.player_display = new PlayerDisplay(this.scene, this, 100, 80, 'mohl1k').init();
        this.add(this.player_display);
        this.banner = new Banner(this.scene).init()
        this.add(this.banner);
        this.banner.setText('1/3');
    }

    start_level() {
        this.boosterPanel.init();
        this.gameEvents.init();
        this.playing_field.createTiles();
        this.bots.init();
        this.level_manager.init();

        this.moving_holder.x = this.playing_field.x;
        this.moving_holder.y = this.playing_field.y;

        this.emitter.on('EVENT', (emit) => this.testHandler(emit));
    }

    testHandler(emit) {
        if(emit.event === 'BOOSTER_USED') {
            switch (emit.id) {
                case 'FIREWORK':
                    console.log('FIREWORK');
                    break;
                case 'BOMB':
                    console.log('BOMB');
                    console.log(emit);
                    break;
                case 'SHUFFLE':  
                    console.log('SHUFFLE');
                    break;
                case 'HIGHLIGHT':
                    console.log('HIGHLIGHT');
                    break;
            }
        }
    }

    createBackground(theme) {
        const background = new Phaser.GameObjects.Sprite(this.scene, 0,0, theme);
        background.setOrigin(0,0)
        .setScale(1444 / background.displayWidth, 720 / background.displayHeight)
        .setDepth(-1);
        this.add(background);
    }

    // cameraZoom() {                                             // TESTING
    //     const arr = this.playing_field.list;
    //     const min = {x: Math.min(...arr.map(f => f.x)), y: Math.min(...arr.map(s => s.y))}

    //     const max = {x: Math.max(...arr.map(f => f.x)), y: Math.max(...arr.map(s => s.y))}

    //     if((this.width / (max.x - min.x)) > (this.height / (max.y - min.y))) {
    //         const scaleY = (this.height / (max.y - min.y) / ((1 / (max.y - min.y)) * 520))
    //         this.playing_field.setScale(scaleY);
    //         this.moving_holder.setScale(scaleY);
    //     } else {
    //         const scaleX = (this.width / (max.x - min.x) / ((1 / (max.x - min.x)) * 550))
    //         this.playing_field.setScale(scaleX);
    //         this.moving_holder.setScale(scaleX);
    //     }
    //     console.log(this.playing_field.scale)
    // }
 
    

    get_total_items() {
        let count = 0;
        this.map[this.round].layers.forEach(layer => {
            layer.forEach(row => {
                row.forEach(origin => {
                    if (origin) {
                        count++
                    }
                });
            });
        });
        return count
    }

    getRequiredTiles() {
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
        console.log(count);
        return count
    }

    createDeck(count) {
        while (this.deck.length < count) {
            const randomStone = Phaser.Utils.Array.GetRandom(this.collection);
            this.deck.push(randomStone, randomStone);
        }
        return this.deck
    }

    shuffleDeck(deck) {
        return Phaser.Actions.Shuffle(deck);
    }

    returnTileTexture(texture) {
        if (!texture) {
            return this.deck.pop();
        } else {
            return texture
        }
    }

    clickOnTile(sprite, bool, leftRight) {
        let leftFace = [],
            rightFace = [],
            topFace = [];
        
        if (leftRight) {    
            tablesNeighbours.left.forEach(coordinatesOfNeighbour => {
                const neighbour = objNeighbour(
                    sprite, 
                    coordinatesOfNeighbour.x, 
                    coordinatesOfNeighbour.y, 
                    this.playing_field.list,
                    {x: 0, y: 0}
                )

                if (neighbour !== undefined) {
                    leftFace.push(neighbour);
                }
            })

            tablesNeighbours.right.forEach(coordinatesOfNeighbour => {
                const neighbour = objNeighbour(
                    sprite, 
                    coordinatesOfNeighbour.x, 
                    coordinatesOfNeighbour.y, 
                    this.playing_field.list,
                    {x: 0, y: 0}
                )

                if (neighbour !== undefined) {
                    rightFace.push(neighbour);
                }
            })
        }

        tablesNeighbours.top.forEach(coordinatesOfNeighbour => {
            const neighbour = objNeighbour(
                sprite, 
                coordinatesOfNeighbour.x, 
                coordinatesOfNeighbour.y, 
                this.playing_field.list,
                {x: 5.6, y: -5.6}
            )

            if (neighbour !== undefined) {
                topFace.push(neighbour);
            }
        })
        
        if (leftFace.length > 0 && rightFace.length > 0 || topFace.length > 0) {
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
}