import { objNeighbour, tablesNeighbours } from "../utilits.js";
import { BoosterPanel } from "../GameEngine/BoosterPanel.js";
import { TutorGameEvents } from "./TutorGameEvents.js";
import { PlayingField } from "../GameEngine/PlayingField.js";
import { MovingHolder } from "../GameEngine/MovingHolder.js";
import { Bots } from "../GameEngine/Bots.js";
import { TutorLevelManager } from "./TutorLevelManager.js";
import { PlayerDisplay } from "../GameEngine/PlayerDisplay.js";
import { Banner } from "../GameEngine/Banner.js";
import { Actions } from "./TutorActions.js";
import { Arrow } from "./Arrow.js";

export class TutorEngine extends Phaser.GameObjects.Container {
    constructor(scene, data) {
        super(scene);
        this.dataR = data;
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
    }

    init() {
        this.deck = this.shuffleDeck(this.createDeck(this.getRequiredTiles()));
        this.createBackground(this.theme);

        this.overlay = new Phaser.GameObjects.Sprite(this.scene, 0,0,'overlay')
            .setOrigin(0,0)
            .setScale(1444/550, 720/520)
            .setAlpha(0.5);
        this.add(this.overlay);
        this.hideOverlay();

        this.playing_field = new PlayingField(this.scene, this);
        this.add(this.playing_field);
        this.boosterPanel = new BoosterPanel(this.scene, this, 915, 100);
        this.add(this.boosterPanel);
        this.gameEvents = new TutorGameEvents(this.scene, this);
        this.moving_holder = new MovingHolder(this.scene);
        this.add(this.moving_holder);
        this.bots = new Bots(this.scene, this, this.bots);
        this.add(this.bots);
        this.level_manager = new TutorLevelManager(this.scene, this);
        this.add(this.level_manager);
        this.player_display = new PlayerDisplay(this.scene, this, 100, 80, 'mohl1k').init();
        this.add(this.player_display);
        this.player_display.showOverlay(10);
        this.banner = new Banner(this.scene).init();
        this.add(this.banner);
        this.banner.setText('1/3');
        this.banner.showOverlay(3)
        this.actions = new Actions(this.scene, this).init();
        this.add(this.actions);
        this.arrow = new Arrow(this.scene);
        this.add(this.arrow);
    }

    showOverlay(i) {
        this.overlay
            .setVisible(true)
            .setInteractive();

        this.overlay.x = this.overlay.x - this.conX;
        this.overlay.y = this.overlay.y - this.conY;
        
        this.list.splice(i, 0, this.overlay);
    }

    hideOverlay() {
        this.overlay
            .setVisible(false)
            .disableInteractive();
    }

    createBackground(theme) {
        const background = new Phaser.GameObjects.Sprite(this.scene, 0,0, theme);
        background.setOrigin(0,0)
        .setScale(1444 / background.displayWidth, 720 / background.displayHeight)
        .setDepth(-1);
        this.add(background);
    }

    start_level() {

        this.gameEvents.init();
        this.playing_field.createTiles();
     
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

    get_total_items() {
        let count = 0;
        this.map[this.round].layers.forEach(layer => {
            layer.forEach(row => {
                row.forEach(origin => {
                    if (origin) {
                        count++
                    }
                })
            })
        })
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
                })
            })
        })
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