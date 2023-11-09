class Dialog extends Phaser.GameObjects.Container {
    constructor(scene, engine, x, y) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.text;
        this.image;
        this.x = x;
        this.y = y;
        this.emitter = engine.emitter;
        this.text_area;
        this.image_area;
        this.setDepth(1);
        this.offset_x = 60;
        this.offset_y = 80;
    }

    init() {

        this.background = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'dialog').setOrigin(0.5, 0.5);
        this.add(this.background);

        this.button = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'ok').setInteractive().setOrigin(0.5, 0.5);
        this.add(this.button);

        this.button.on('pointerdown', () => {
            this.hide();
            this.engine.playing_field.list.forEach(e => {
                e.clearTint();
            })
            this.engine.game_events.select_bool = false;
            this.emitter.emit('ACTION', {event: 'SELECT'});
        })

        this.button.on('pointerover', () => {
            this.scene.tweens.add({
                targets: this.button,
                scaleX: 0.95,
                scaleY: 0.95,
                alpha: 0.8,
                duration: 100
            })
        })

        this.button.on('pointerout', () => {
            this.scene.tweens.add({
                targets: this.button,
                scaleX: 1,
                scaleY: 1,
                alpha: 1,
                duration: 100
            })
        })

        return this
    }

    hide() {
        this.setVisible(false);
        if(this.text_area) this.text_area.destroy();
        if(this.image_area) this.image_area.destroy();
        this.text_area = false;
        this.image_area = false;
    }

    show(params) {
        if(this.text_area) this.text_area.destroy();
        if(this.image_area) this.image_area.destroy();
        this.text_area = false;
        this.image_area = false;
        this.text_area = new Phaser.GameObjects.Text(this.scene, 0, 0, params.text, {fontFamily:"font1", fontSize: 24, color:"#FFFFFF", stroke: '#000000', strokeThickness: 3});
        console.log(this.text_area)
        if(params.image) this.image_area = new Phaser.GameObjects.Image(this.scene, 0, 0, params.image).setScale(2);
        const scale_x = ((this.text_area.width + this.offset_x) + (this.image_area ? this.image_area.width + this.offset_x : 0)) / this.background.width;
        const scale_y = (Math.max(this.text_area.height + this.offset_y, (this.image_area ? this.image_area.height + this.offset_y : 0))) / this.background.height;
        this.background.setScale(scale_x, scale_y);
        this.x = params.x ? params.x : 722;
        this.y = params.y ? params.y : 360;
        if(this.image_area) {
            this.image_area.x = this.offset_x / 3 - (this.background.displayWidth / 2);
            this.text_area.x = this.image_area.displayWidth - (this.background.displayWidth / 2) + this.offset_x / 2;
            this.image_area.setOrigin(0, 0.5);
            this.text_area.setOrigin(0, 0.5);
            this.add([this.text_area, this.image_area]);
        } else {
            this.text_area.setOrigin(0.5,0.5).setStyle({align: 'center'})
            this.add(this.text_area);
        }
        if(params.button) {
            this.button
                .setInteractive()
                .setVisible(true)
                .setOrigin(0.5, 1)
                .y = this.background.displayHeight / 2;
            this.text_area.y -= 20;
            if(this.image_area) this.image_area.y -= 20;
        } else {
            this.button
                .disableInteractive()
                .setVisible(false);
        }
        this.setVisible(true);
    }
}