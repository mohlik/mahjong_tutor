class EmojiModal extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene);
        this.scene = scene;
        this.state = true;
        this.tween_state = true;
        this.x = x;
        this.y = y;
        // this.emoji_collection = [
        //     '001', '002','003', '004','005', '006','007', '008','009', '010',
        //     '011', '012','013', '014','015', '016','017', '018','019', '020',
        //     '021', '022','023', '024','025'//, '026','027', '028','029', '030'
        // ];
    }

    init() {
        this.emoji = new Phaser.GameObjects.Container(this.scene);
        this.add(this.emoji);
        this.create_background();
        this.create_emoji();
    }

    create_background() {
        this.background = new Phaser.GameObjects.Sprite(this.scene, 0,0, 'emoji_modal').setAlpha(0.8);
        this.add(this.background);
        this.text_label = new Phaser.GameObjects.Text(this.scene, -100, -(this.background.height / 2), 'Emoji', {fontFamily:"font1", fontSize: 30, color:"#FFFFFF", stroke: '#000000', strokeThickness: 3});
        this.emoji.add(this.text_label);
        this.background.setInteractive();
        this.background.on('pointerdown', () => this.toogle_modal());
        this.bringToTop(this.emoji);
    }

    create_emoji() {
        game_data['user_data']['emoji'].forEach((emoji, index) => {
            const tile = new Phaser.GameObjects.Sprite(this.scene, (index % 5) * 60 - 120, Math.floor(index / 5) * 60 - 120, 'emoji', 'emojies/' + emoji + '.png');
            this.emoji.add(tile);
            tile.setInteractive();
            tile.on('pointerdown', () => this.play_emoji(tile));
        });
    }

    play_emoji(tile) {
        game_data['game_engine'].player_display.play_booster(tile.frame.name);
        const particle = new Phaser.GameObjects.Sprite(this.scene, tile.x, tile.y - this.background.height + 40, tile.texture.key, tile.frame.name);
        this.add(particle);
        this.scene.tweens.add({
            targets: particle,
            y: particle.y - 200,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                particle.destroy();
            }
        })
    }

    toogle_modal() {
        if(this.tween_state) {
            this.scene.tweens.add({
                targets: [this.background, this.emoji],
                y: this.state ? this.background.y - (this.background.height - 40) : this.background.y + (this.background.height - 40),
                duration: 500,
                onStart: () => {
                    this.tween_state = !this.tween_state;
                },
                onComplete: () => {
                    this.tween_state = !this.tween_state;
                }
            })
            this.state = !this.state;
        }
    }
}