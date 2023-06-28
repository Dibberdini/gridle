class Creature extends Entity {
    constructor(x, y, DIRECTION, model, tiles) {
        super(x, y, model, tiles);
        this.direction = DIRECTION;
        this.step = [0, 0];
        this.autonomous = true;
    }

    draw(x, y) {
        let newX = this.x + 4 - x;
        let newY = this.y + 4 - y;

        if (this.model == 0) {
            push()
            fill(255, 0, 0);
            noStroke();
            ellipseMode(CORNER);
            circle(newX * TILE_WIDTH, newY * TILE_HEIGHT, TILE_WIDTH);
            stroke(0);
            strokeWeight(2);
            line(
                newX * TILE_WIDTH + 0.5 * TILE_WIDTH,
                newY * TILE_HEIGHT + 0.5 * TILE_HEIGHT,
                newX * TILE_WIDTH + 0.5 * TILE_WIDTH + (this.direction[0] * TILE_WIDTH * 0.5),
                newY * TILE_HEIGHT + 0.5 * TILE_HEIGHT + (this.direction[1] * TILE_HEIGHT * 0.5));
            pop();
        }
    }

    move(DIRECTION) {
        if (this.step[0] != 0 || this.step[1] != 0) {
            return;
        }
        let newX = this.tile.x + DIRECTION[0];
        let newY = this.tile.y + DIRECTION[1];

        if ((grid.tiles[newX] || [])[newY] === undefined) {
            //Desired tile does not exist
        }
        else {
            let newTile = grid.tiles[newX][newY];
            if (newTile.isClear()) {
                newTile.setClear(false);

                //Move smoothly to new tile over 15 frames (tickrate)
                this.step = DIRECTION

                this.tile.setClear(true);
                this.tile.occupant = null;
                this.tile = newTile;
                this.tile.occupant = this;
            }
        }
    }

    update() {
        this.x += this.step[0] * (1 / tickRate);
        this.y += this.step[1] * (1 / tickRate);

        if (tick == tickRate - 1 && JSON.stringify(this.step) != "[0,0]") {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            this.step = [0, 0];
            return "arrived"
        }
    }

    setDirection(DIRECTION) {
        this.direction = DIRECTION;
    }

    interact() {

    }
}