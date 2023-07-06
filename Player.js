class Player extends Creature {
    constructor(x, y, DIRECTION, model, tiles) {
        super(x, y, DIRECTION, model, tiles);
        this.monsters = [];
        this.inventory = [{ type: "cancel", name: "Cancel", count: "" }];
        this.bank = [];
        this.money = 0;

        let idNum = "0_";
        for (let i = 0; i < 8; i++) {
            idNum += Math.round(Math.random() * 9);
        }
        this.id = idNum;
    }

    draw(x, y) {
        if (this.model == 0) {
            push()
            fill(255, 255, 0);
            noStroke();
            ellipseMode(CORNER);
            circle(4 * TILE_WIDTH, 4 * TILE_HEIGHT, TILE_WIDTH);
            stroke(255, 0, 0);
            strokeWeight(2);
            line(
                4 * TILE_WIDTH + 0.5 * TILE_WIDTH,
                4 * TILE_HEIGHT + 0.5 * TILE_HEIGHT,
                4 * TILE_WIDTH + 0.5 * TILE_WIDTH + (this.direction[0] * TILE_WIDTH * 0.5),
                4 * TILE_HEIGHT + 0.5 * TILE_HEIGHT + (this.direction[1] * TILE_HEIGHT * 0.5));
            pop();
        }
    }

    async update() {
        if (super.update() == "arrived") {
            if (this.stopping()) {
                this.checkDirectionChange();
            }
            if (this.tile.type == TileType.GRASS && this.monsters.length > 0) {
                if (Math.random() < 0.2) {
                    let monsterList = [];
                    for (let i = 0; i < zone.monsters.length; i++) {
                        monsterList.push(globalMonsterList.monsters.find(monster => monster.id == zone.monsters[i]));
                    }
                    battle.encounter(monsterList, zone.zone_strength);
                    this.step = [0, 0];
                }
            } else if (this.tile.type == TileType.TELEPORT) {
                let warpInfo = zone.warp[`${this.tile.x}`][`${this.tile.y}`];
                warp(warpInfo);
            }
            return "arrived";
        }
    }

    stopping() {
        if (this.direction == DIRECTION.NORTH && keyIsDown(KEYS.UP)) {
            return false;
        } else if (this.direction == DIRECTION.EAST && keyIsDown(KEYS.RIGHT)) {
            return false;
        } else if (this.direction == DIRECTION.SOUTH && keyIsDown(KEYS.DOWN)) {
            return false;
        } else if (this.direction == DIRECTION.WEST && keyIsDown(KEYS.LEFT)) {
            return false;
        }
        return true;
    }

    checkDirectionChange() {
        if (keyIsDown(KEYS.UP) && this.direction != DIRECTION.NORTH) {
            this.setDirection(DIRECTION.NORTH);
        } else if (keyIsDown(KEYS.RIGHT) && this.direction != DIRECTION.EAST) {
            this.setDirection(DIRECTION.EAST);
        } else if (keyIsDown(KEYS.DOWN) && this.direction != DIRECTION.SOUTH) {
            this.setDirection(DIRECTION.SOUTH);
        } else if (keyIsDown(KEYS.LEFT) && this.direction != DIRECTION.WEST) {
            this.setDirection(DIRECTION.WEST);
        }
    }

    async addMonster(monster) {
        monster.owner = this.id;
        if (this.monsters.length < 6) {
            this.monsters.push(monster);
        } else {
            await dialogue.load([{ type: "timed", line: `No room for ${monster.name}, it was moved to bank`, time: 800 }]);
            this.bank.push(monster);
        }
    }

    addItem(item) {
        let index = this.inventory.findIndex(element => element.type == item.type)
        if (index < 0) {
            let cancel = this.inventory.pop()
            this.inventory.push({ type: item.type, name: item.name, count: 1, })
            this.inventory.push(cancel);
        } else {
            this.inventory[index].count++;
        }
    }

    removeItem(itemIndex) {
        if (this.inventory[itemIndex].count > 1) {
            this.inventory[itemIndex].count--;
        } else {
            this.inventory.splice(itemIndex, 1);
        }
    }

    healAllMonsters() {
        this.monsters.forEach(monster => {
            monster.health = monster.maxHealth;
            monster.status = STATUSES.NONE;
            monster.dead = false;
            monster.moveSet.forEach(move => {
                move.pp = move.maxPP;
            });
        });
    }
}