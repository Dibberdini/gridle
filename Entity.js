class Entity {
    constructor(x, y, model, tiles) {
        this.x = x;
        this.y = y;
        this.model = model;
        this.tile = tiles[this.x][this.y];

        this.tile.setClear(false);
        this.tile.occupant = this;
    }

    update() {

    }

    interact() {

    }

    draw() {

    }
}