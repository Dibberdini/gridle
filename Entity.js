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
        if (this.type && this.type == "PC") {
            menu.menuState = MENU_STATES.BANK_MENU;
            menu.lastIndex = menu.index;
            menu.index = 0;
            state = STATE.PAUSED;
        }
    }

    draw(x, y) {
        let newX = this.x + 4 - x;
        let newY = this.y + 4 - y;

        if (this.model == 0) {
            push()
            fill(255, 0, 255);
            noStroke();
            ellipseMode(CORNER);
            circle(newX * TILE_WIDTH, newY * TILE_HEIGHT, TILE_WIDTH);
            pop();
        }
    }
}