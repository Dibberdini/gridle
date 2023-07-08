class Creature extends Entity {
    constructor(x, y, DIRECTION, model, tiles) {
        super(x, y, model, tiles);
        this.direction = DIRECTION;
        this.step = [0, 0];
        this.autonomous = true;
        this.moving = false;
        this.stopping = true;
        if (model != 0) {
            this.model = 0;
            this.loadNewModel(model);
        }
    }

    loadNewModel(model) {
        let newModel = [];

        newModel[0] = globalSpriteList.models[`${model}_b`];
        newModel[1] = globalSpriteList.models[`${model}_b`];
        newModel[2] = globalSpriteList.models[`${model}_s`];
        newModel[3] = globalSpriteList.models[`${model}_s`];
        newModel[4] = globalSpriteList.models[`${model}_f`];
        newModel[5] = globalSpriteList.models[`${model}_f`];

        this.model = newModel;
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
        } else {
            let flipped = false;
            let model = this.model[1];
            switch (this.direction.toString()) {
                case DIRECTION.NORTH.toString():
                    if (this.moving) {
                        model = this.model[0];
                    } else {
                        model = this.model[1];
                    }
                    break;
                case DIRECTION.EAST.toString():
                    if (this.moving) {
                        model = this.model[2];
                    } else {
                        model = this.model[3];
                    }
                    break;
                case DIRECTION.SOUTH.toString():
                    if (this.moving) {
                        model = this.model[4];
                    } else {
                        model = this.model[5];
                    }
                    break;
                case DIRECTION.WEST.toString():
                    flipped = true;
                    if (this.moving) {
                        model = this.model[2];
                    } else {
                        model = this.model[3];
                    }
                    break;
                default:
                    break;
            }
            push();
            if (flipped) {
                scale(-1, 1);
                image(model, -(newX + 1) * TILE_WIDTH, newY * TILE_HEIGHT);
            } else {
                image(model, newX * TILE_WIDTH, newY * TILE_HEIGHT);
            }
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
                this.moving = true;
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
            if (this.stopping) {
                this.moving = false;
            }
            return "arrived"
        }
    }

    setDirection(DIRECTION) {
        this.direction = DIRECTION;
    }

    interact() {

    }
}