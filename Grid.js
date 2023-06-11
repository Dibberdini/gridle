class Grid {
    constructor() {
        this.w = 0;
        this.h = 0;
    }

    loadZone(zone) {
        this.w = 0;
        this.h = 0;
        this.tiles = create2dArray(zone.h, zone.w);;

        for (let i = 0; i < zone.h; i++) {
            for (let j = 0; j < zone.w; j++) {
                let tile = new Tile(j, i)
                let index = i * zone.w + j;

                //Set Tile Type
                if (zone.layout[index][0] == "g") {
                    tile.setType(TileType.GRASS);
                } else if (zone.layout[index][0] == "w") {
                    tile.setType(TileType.WALL);
                } else if (zone.layout[index][0] == "t") {
                    tile.setType(TileType.TELEPORT);
                }

                //Set Tile Sprite
                if (zone.layout[index][1]) {
                    tile.setModel(zone.layout[index][1]);
                }

                this.tiles[j][i] = tile;
            }
        }

        zone.characters.forEach(character => {
            entities.push(new Character(character.x, character.y, character.direction, character.id, character.pathing, this.tiles))
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