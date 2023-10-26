export class Tile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, engine, scale, cord) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.depthX = cord.x;
        this.depthY = cord.y;
        this.depthZ = cord.z;
        this.setScale(scale)
        this.setOrigin(0.5, 0.5)
        this.setInteractive()
        this.on('pointerdown', () => {
            if(!engine.boostersState.bomb) {
                engine.clickOnTile(this, true, true)
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
}