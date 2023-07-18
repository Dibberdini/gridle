class Grid {
    constructor() {
    }

    loadZone(newZone) {
        this.tiles = create2dArray(newZone.w, newZone.h);;

        for (let i = 0; i < newZone.w; i++) {
            for (let j = 0; j < newZone.h; j++) {
                let tile = new Tile(i, j)
                let layout = newZone.layout[i][j];

                //Set Tile Type
                if (layout[0] == "g") {
                    tile.setType(TileType.GRASS);
                } else if (layout[0] == "w") {
                    tile.setType(TileType.WALL);
                } else if (layout[0] == "t") {
                    tile.setType(TileType.TELEPORT);
                }

                //Set Tile Sprite
                if (layout[1]) {
                    tile.setModel(layout[1]);
                }
                if (layout[2]) {
                    tile.setBlockerModel(layout[2])
                }

                this.tiles[i][j] = tile;
            }
        }

        //Add all characters
        newZone.characters.forEach(character => {
            entities.push(new Character(character.x, character.y, character.direction, character.id, character.pathing, this.tiles))
        });
        //Add all items
        newZone.items.forEach(item => {
            if (worldData.pickedItems[`${item.id}`]) {
                //This item has already been picked up.
            } else {
                entities.push(new Item(item.x, item.y, item.id, item.type, null, this.tiles));
            }
        });
        //Add all entities
        newZone.entities.forEach(entity => {
            let newEntity = new Entity(entity.x, entity.y, entity.model, this.tiles);
            newEntity.type = entity.type;
            entities.push(newEntity);
        });
    }

    draw() {
        this.tiles.forEach(row => {
            row.forEach(tile => {
                if (Math.abs(player.x - tile.x) < 6 && Math.abs(player.y - tile.y) < 6) {
                    tile.draw(player.x, player.y);
                }
            });
        });
    }
}