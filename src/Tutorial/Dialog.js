export class Dialog extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene);
        this.scene = scene;
        this.text;
        this.image;
        this.x = x;
        this.y = y;
        this.textArea;
        this.imageArea;
        this.setDepth(1)
    }

    init() {

        this.background = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'dialog').setOrigin(0.5, 0.5);
        this.add(this.background);

        this.button = new Phaser.GameObjects.Sprite(this.scene, 0, this.background.displayHeight / 2, 'ok').setInteractive().setOrigin(0.5, 0.5);
        this.add(this.button);

        this.button.on('pointerdown', () => {
            this.hide();
            this.scene.game_engine.playing_field.list.forEach(e => {
                e.clearTint();
            })
            this.scene.game_engine.gameEvents.selectBool = false;
            this.scene.game_engine.emitter.emit('ACTION', {event: 'SELECT'});
        })

        return this
    }

    hide() {
        this.contentClear();
        this.setVisible(false);
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }

    resizeBack() {
        if(this.imageArea) {
            if(this.textArea) {
            const width = this.textArea.width + this.imageArea.width + 50;
            this.background.setScale(width / this.background.width, 1);
            }
        } else {
            if(this.textArea) {
               this.background.setScale((this.textArea.width + 50) / this.background.width, 1);
            }
        }
    }

    show(text, image, bool) {
        this.setVisible(true);
        if(!bool) {
            this.button.setVisible(false);
            this.button.disableInteractive();
        } else {
            this.button.setVisible(true);
            this.button.setInteractive();
        }
        this.text = text ? text : false;
        this.image = image ? image : false;

        if(this.image) {
            this.imageArea = new Phaser.GameObjects.Sprite(this.scene, 0, 0, this.image).setOrigin(0.5, 0.5).setScale(1.3);
            this.add(this.imageArea);
            if(this.text) {
                this.textArea = new Phaser.GameObjects.Text(this.scene, 0, 0, this.text).setOrigin(0, 0.5).setDepth(2);
                this.add(this.textArea);
                this.resizeBack();
                this.imageArea.x = -15 - (this.background.width / 2);
                this.textArea.x = this.imageArea.width - (this.background.width / 2) - 10;
            }
        } else {
            if(this.text) {
                this.textArea = new Phaser.GameObjects.Text(this.scene, 0, 0, this.text).setOrigin(0.5, 0.5);
                this.add(this.textArea);
                this.resizeBack();
            }
        }

    }

    contentClear() {
        this.textArea ? this.textArea.destroy() : null;
        this.imageArea ? this.imageArea.destroy() : null;
    }
}