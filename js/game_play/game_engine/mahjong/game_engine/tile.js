class Tile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, engine, scale, cord) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.depth_x = cord.x;
        this.depth_y = cord.y;
        this.depth_z = cord.z;
        this.setScale(scale)
        this.setOrigin(0.5, 0.5)
        this.setInteractive()
        this.on('pointerdown', () => {
            if(!engine.boosters_state.bomb) {
                engine.click_on_tile(this, true, true)
            }
        })
        this.setDataEnabled()
        this.setData('key', this.key(texture));
        this.setName(`${cord.z}${cord.y}${cord.x}`)
    }

    key(texture) {
        if(texture[0] === "f") {
            return 'flower'
        } else {
            return texture
        }
    }

    show_overlay() {
        this.setTint(0x666666);
        this.disableInteractive();
    }

    hide_overlay() {
        this.clearTint();
        this.setInteractive();
    }
}