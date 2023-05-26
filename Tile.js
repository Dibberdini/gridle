class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = TileType.EMPTY;
        this.clear = true;
        this.occupant = null;
    }

    setType(type) {
        this.type = type;
        if(this.type == TileType.WALL) {
            this.clear = false;
        }
    }

    draw(x,y) {
        let newX = this.x + 4 - x;
        let newY = this.y + 4 - y;
        push();

        fill(255);
        if(this.type == TileType.GRASS) {
            fill(0, 255, 0);
        } else if(this.type == TileType.WALL) {
            fill(120,120,120);
        }

        stroke(0);
        strokeWeight(2);
        square(newX*TILE_WIDTH, newY*TILE_HEIGHT, TILE_WIDTH);
        pop();
    }

    setClear(clear) {
        this.clear = clear;
    }

    isClear() {
        return this.clear;
    }
}