class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = TileType.EMPTY;
        this.clear = true;
        this.occupant = null;
        this.model = 0;
    }

    setType(type) {
        this.type = type;
        if (this.type == TileType.WALL) {
            this.clear = false;
        }
    }

    draw(x, y) {
        let newX = this.x + 4 - x;
        let newY = this.y + 4 - y;
        if (this.model != 0) {
            image(this.model, newX * TILE_WIDTH, newY * TILE_HEIGHT);
        } else {
            push();
            fill(255);
            if (this.type == TileType.GRASS) {
                fill(0, 255, 0);
            } else if (this.type == TileType.WALL) {
                fill(120, 120, 120);
            }
            stroke(0);
            strokeWeight(2);
            square(newX * TILE_WIDTH, newY * TILE_HEIGHT, TILE_WIDTH);
            pop();
        }
    }

    setClear(clear) {
        this.clear = clear;
    }

    isClear() {
        return this.clear;
    }

    setModel(modelName) {
        this.model = globalSpriteList.find(sprite => sprite.name == modelName).img;
    }
}