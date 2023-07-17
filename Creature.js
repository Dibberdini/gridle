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

        for (let i = 0; i < 9; i++) {
            newModel.push(globalSpriteList.models[`${model}_${i}`]);
        }

        this.model = newModel;
    }

    draw(x, y) {
        let newX = this.x + 4 - x;
        let newY = this.y + 4 - y;

        let flipped = false;
        let model = this.model[1];
        switch (this.direction.toString()) {
            case DIRECTION.NORTH.toString():
                if (this.moving) {
                    if(walkNumber == 3) {
                        model = this.model[8]
                    } else {
                        model = this.model[6 + walkNumber];
                    }
                } else {
                    model = this.model[8];
                }
                break;
            case DIRECTION.EAST.toString():
                if (this.moving) {
                    if(walkNumber == 3) {
                        model = this.model[5]
                    } else {
                        model = this.model[3 + walkNumber];
                    }
                } else {
                    model = this.model[5];
                }
                break;
            case DIRECTION.SOUTH.toString():
                if (this.moving) {
                    if(walkNumber == 3) {
                        model = this.model[2]
                    } else {
                        model = this.model[0 + walkNumber];
                    }
                } else {
                    model = this.model[2];
                }
                break;
            case DIRECTION.WEST.toString():
                flipped = true;
                if (this.moving) {
                    if(walkNumber == 3) {
                        model = this.model[5]
                    } else {
                        model = this.model[3 + walkNumber];
                    }
                } else {
                    model = this.model[5];
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

    move(DIRECTION) {
        if (this.step[0] != 0 || this.step[1] != 0) {
            return;
        }
        this.stopping = false;
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

    resetPos() {
        let originalPos = zone.characters.find(char => char.id == this.id);
        this.x = originalPos.x;
        this.y = originalPos.y;
        this.tile.clear = true;
        this.tile.occupant = null;
        this.tile = grid.tiles[this.x][this.y];
        this.tile.clear = false;
        this.tile.occupant = this;
    }
}