export class TutorLevelManager extends Phaser.GameObjects.Container {
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
                break;
            case 'WON_SECOND_ROUND':
                this.winRound(2)
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
        if (this.engine.bots.botsState) {
            this.engine.bots.bots.pop();
        }
        this.engine.round = i;
        this.engine.playing_field.list.forEach(e => {
            e.destroy();
        });
        this.engine.gameState = true;
        this.engine.deck = this.engine.shuffleDeck(this.engine.createDeck(this.engine.getRequiredTiles()));
        this.engine.playing_field.createTiles();
        if(i === 1 && this.scene.level === 1) {
            this.engine.bots.init();
            this.engine.banner.setText(`${i+1}/3`)
        }
        this.engine.bots.bots.forEach(bot => {
            bot.count = this.engine.get_total_items();
        })
        this.engine.bots.createBots();
        this.engine.player_display.init();
        this.engine.player_display.showOverlay(100);
    }

    winLevel() {
        console.log('You won all level!!!');
        this.engine.bots.pause();
        console.log(this.scene.level_2)
        this.engine.dataR.tutor = this.scene.level_2;
        console.log(this.engine.dataR.tutor)
        this.scene.scene.start('Tutorial', this.engine.dataR);
        this.engine.gameState = false;
    }

    loss(i) {
        console.log(`You lost with ${i} stars...`);
        this.engine.bots.pause();
        this.scene.scene.start('Menu');
        this.engine.gameState = false;
    }
}