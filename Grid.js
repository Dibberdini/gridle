class Grid {
    constructor() {
        this.w = 0;
        this.h = 0;
    }

    loadZone(zone) {
        this.w = 0;
        this.h = 0;
        this.tiles = create2dArray(zone.h, zone.w);;

        for(let i = 0; i < zone.h; i++) {
            for(let j = 0; j < zone.w; j++) {
                let tile = new Tile(j, i)
                let index = i*zone.w+j;
                if(zone.layout[index] == "g") {
                    tile.setType(TileType.GRASS);
                } else if(zone.layout[index] == "w") {
                    tile.setType(TileType.WALL);
                }

                this.tiles[j][i] = tile;
            }
        }

        zone.characters.forEach(character => {
            entities.push(new Character(character.x, character.y, character.direction, character.model, this.tiles, character.name, character.role))
        });
    }

    draw() {
        this.tiles.forEach(row => {
            row.forEach(tile => {
                if(Math.abs(player.x - tile.x) < 6 && Math.abs(player.y - tile.y) < 6) {
                    tile.draw(player.x, player.y);
                }
            });
        });
    }
}