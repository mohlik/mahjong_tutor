class BotPlayingField extends Phaser.GameObjects.Container {
    constructor(scene, engine, index) {
        super(scene);
        this.scene = scene;
        this.engine = engine;
        this.index = index;
        this.setScale(1.2);
    }

    create_tiles() {
        this.engine.map[this.engine.round].layers.forEach((layer, z) => {
            layer.forEach((row, y) => {
                row.forEach((origin, x) => {
                    if (origin) {
                        const tile = new Phaser.GameObjects.Sprite( this.scene,
                            parseFloat((x * 5 + 
                                1 + 
                                (origin.x ? 5 / 2 : 0) + 
                                z * 1).toFixed(2)) + 98,
                            (parseFloat((y * 7 + 
                                1 + 
                                (origin.y ? 7 / 2 : 0) - 
                                z * 1).toFixed(2)) + 1 * (this.index + 1 * 1.1)) - 25,
                            'mini_tile'
                        )
                        this.add(tile);
                        tile.setData('origin', origin);
                        tile.depthZ = z;
                    }
                })
            })
        })
        this.list.sort((a, b) => {
            return (a.depthZ * 100 - (a.x/50) + (a.y/100)) - (b.depthZ * 100 - (b.x/50) + (b.y/100));
        });
    }

    get_free_tiles() {
        const arr = this.list.filter(tile => {
            return this.click_on_tile(tile);
        });
        return arr
    }


    click_on_tile(sprite) {
        let left_face = [],
            right_face = [],
            top_face = [];

        game_data['utils'].left_table.forEach(coordinates_of_neighbour => {
            const neighbour = this.obj_neighbour_mini(
                sprite, 
                coordinates_of_neighbour.x, 
                coordinates_of_neighbour.y, 
                this.list,
                {x: 0, y: 0}
            )

            if (neighbour !== undefined) {
                left_face.push(neighbour);
            }
        })

        game_data['utils'].right_table.forEach(coordinates_of_neighbour => {
            const neighbour = this.obj_neighbour_mini(
                sprite, 
                coordinates_of_neighbour.x, 
                coordinates_of_neighbour.y, 
                this.list,
                {x: 0, y: 0}
            )

            if (neighbour !== undefined) {
                right_face.push(neighbour);
            }
        });

        game_data['utils'].top_table.forEach(coordinates_of_neighbour => {
            const neighbour = this.obj_neighbour_mini(
                sprite, 
                coordinates_of_neighbour.x, 
                coordinates_of_neighbour.y, 
                this.list,
                {x: 1, y: -1}
            )

            if (neighbour !== undefined) {
                top_face.push(neighbour);
            }
        })
        
        if (left_face.length > 0 && right_face.length > 0 || top_face.length > 0) {
            return false
        } else {
            return true
        }
    }

    obj_neighbour_mini (obj, x, y, pool, depth) {
		return pool.find((o) => { 
			const objX = (obj.x + x * 5 + depth.x),
				  objY = (obj.y + y * 7 + depth.y);
	
			return (o.x - objX > -1 && o.x - objX < 1) && (o.y - objY > -1 && o.y - objY < 1)
		})
	};
}