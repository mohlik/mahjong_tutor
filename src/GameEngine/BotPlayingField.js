export class BotPlayingField extends Phaser.GameObjects.Container {
    constructor(scene, engine, id) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.id = id;
    }

    createTiles() {
        this.engine.map[this.engine.round].layers.forEach((layer, z) => {
            layer.forEach((row, y) => {
                row.forEach((origin, x) => {
                    if (origin) {
                        const tile = new Phaser.GameObjects.Sprite( this.scene,
                            parseFloat((x * 5 + 
                                1 + 
                                (origin.x ? 5 / 2 : 0) + 
                                z * 1).toFixed(2)) + 68,
                            (parseFloat((y * 7 + 
                                1 + 
                                (origin.y ? 7 / 2 : 0) - 
                                z * 1).toFixed(2)) + 70 * (this.id + 1 * 1.1)) + 55,
                            'mini_tile'
                        )
                        this.add(tile);
                        tile.depthZ = z;
                    }
                })
            })
        })
        this.list.sort((a, b) => {
            return (a.depthZ * 100 - (a.x/50) + (a.y/100)) - (b.depthZ * 100 - (b.x/50) + (b.y/100));
        });
    }
}