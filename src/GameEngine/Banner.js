export class Banner extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.x = 722;
        this.y = 0;
    }

    init() {
        this.overlay = new Phaser.GameObjects.Sprite(this.scene, 0, -32, 'banner_overlay').setOrigin(0.5,0).setAlpha(0.5);
        this.add(this.overlay);
        // this.hideOverlay();

        return this.createBackground().createText();
    }

    createText() {
        this.text = new Phaser.GameObjects.Text(this.scene, 0,30, 'Tutorial').setOrigin(0.5,0);
        this.text.setFontSize(32);
        this.add(this.text);

        return this
    }

    createBackground() {
        this.background = new Phaser.GameObjects.Sprite(this.scene, 0, -32, 'banner').setOrigin(0.5,0);
        this.add(this.background);

        return this
    }

    setText(str) {
        this.text.setText(str);
    }

    showOverlay(i) {
        this.overlay
            .setVisible(true)
            .setInteractive();
        
        this.list.splice(i, 0, this.overlay);
    }

    hideOverlay() {
        this.overlay
            .setVisible(false)
            .disableInteractive();
    }
}