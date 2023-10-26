import { Tile } from "./Tile.js";

export class PlayingField extends Phaser.GameObjects.Container {
    constructor(scene, engine) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.emitter = engine.emitter;
        this.stoneScale = 0.7;
        this.x = 447;
        this.y = 100;

        this.conX = 0;
        this.conY = 0;
    }


    createTiles() {
        this.x = 447;
        this.y = 100;
        this.engine.map[this.engine.round].layers.forEach((layer, z) => {
            layer.forEach((row, y) => {
                row.forEach((origin, x) => {
                    if (origin) {
                        const texture = this.engine.returnTileTexture(origin.texture);
                        const tile = new Tile( this.scene,
                            parseFloat((x * 57 * this.stoneScale + 
                                10 * this.stoneScale + 
                                (origin.x ? (57 * this.stoneScale) / 2 : 0) + 
                                z * (8 * this.stoneScale)).toFixed(2)),
                            parseFloat((y * 82 * this.stoneScale + 
                                10 * this.stoneScale + 
                                (origin.y ? (82 * this.stoneScale) / 2 : 0) - 
                                z * (8 * this.stoneScale)).toFixed(2)) + 90, 
                            texture, this.engine, this.stoneScale, {x, y, z}
                        )
                        this.add(tile);
                    }
                })
            })
        })
        this.list.sort((a, b) => {
            return (a.depthZ * 100 - (a.x/50) + (a.y/100)) - (b.depthZ * 100 - (b.x/50) + (b.y/100));
        });
        this.emitter.emit('EVENT', {event: 'FIELD_APPEARED'});
        
        if(this.engine.actions) {
            this.emitter.emit('ACTION', {event: 'FIELD'});
        }

        this.cameraCenter();
    }

    disableTiles() {
        this.list.forEach(tile => {
            if (tile.texture.key !== 'overlay'){
                tile.disableInteractive();
            }
        })
    }

    enableTiles() {
        this.list.forEach(tile => {
            if (tile.texture.key !== 'overlay'){
                tile.setInteractive();
            }
        })
    }

    cameraCenter() {
        let arr = this.list;
        arr.forEach((e,i) => {
            if(e.texture.key === 'overlay') {
                arr.splice(i,1);
            }
        })

        const min = {x: Math.min(...arr.map(f => f.x)), y: Math.min(...arr.map(s => s.y))}

        const max = {x: Math.max(...arr.map(f => f.x)), y: Math.max(...arr.map(s => s.y))}

        const centerPoint = () => {
            const x = ((max.x - min.x) / 2) + min.x
            const y = ((max.y - min.y) / 2) + min.y
            return {x, y}
        }

        this.conX = 275 - (centerPoint().x * this.scale);
        this.conY = 260 - (centerPoint().y * this.scale);
        this.x += this.conX;
        this.y += this.conY;
    }
}