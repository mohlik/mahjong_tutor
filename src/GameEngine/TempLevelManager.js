export class TempLevelManager extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.emitter = engine.emitter;
    }

    init() {
        this.emitter.on('LEVEL_MANAGER', (emit) => {
            this.managerHandler(emit)
        })
    }

    managerHandler(emit) {
        switch(emit.event) {
            case 'WON_FIRST_ROUND':
                this.winRound(1);
                this.engine.banner.setText('2/3');
                break;
            case 'WON_SECOND_ROUND':
                this.winRound(2)
                this.engine.banner.setText('3/3');
                break;
            case 'WON_THIRD_ROUND':
                this.winLevel();
                break;
            case 'LOST_FIRST_ROUND':
                this.loss(0);
                break;
            case 'LOST_SECOND_ROUND':
                this.loss(1);
                break;
            case 'LOST_THIRD_ROUND':
                this.loss(2);
                break;
        }
    }

    winRound(i) {
        console.log(`You won ${i} round!`);
        this.engine.bots.pause();
        this.engine.bots.destroyBots();
        this.engine.bots.bots.sort((a,b) => {
            return a.count - b.count
        })
        this.engine.bots.bots.pop();
        this.engine.round = i;
        this.engine.playing_field.list.forEach(e => {
            e.destroy();
        });
        this.engine.gameState = true;
        this.engine.deck = this.engine.shuffleDeck(this.engine.createDeck(this.engine.getRequiredTiles()));
        this.engine.playing_field.createTiles();
        this.engine.bots.bots.forEach(bot => {
            bot.count = this.engine.get_total_items();
        })
        this.engine.bots.createBots();
        this.engine.player_display.init();
        this.engine.bots.play();
        this.engine.banner.setText(`${this.scene.round + 1}/3`);
    }

    winLevel() {
        console.log('You won all level!!!');
        this.engine.bots.pause();
        this.scene.scene.start('Menu');
        this.engine.gameState = false;
    }

    loss(i) {
        console.log(`You lost with ${i} stars...`);
        this.engine.bots.pause();
        this.scene.scene.start('Menu');
        this.engine.gameState = false;
    }
}