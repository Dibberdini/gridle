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
        let flipped = false;
        let model = this.model[1];
        switch (this.direction) {
            case DIRECTION.NORTH:
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
            case DIRECTION.EAST:
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
            case DIRECTION.SOUTH:
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
            case DIRECTION.WEST:
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
            image(model, -5 * TILE_WIDTH, 4 * TILE_HEIGHT);
        } else {
            image(model, 4 * TILE_WIDTH, 4 * TILE_HEIGHT);
        }
        pop();
    }

    async update() {
        if (super.update() == "arrived") {
            if (this.stopping) {
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
                    if(this.stopping) {
                        this.moving = false;
                    }
                }
            } else if (this.tile.type == TileType.TELEPORT) {
                let warpInfo = zone.warp[`${this.tile.x}`][`${this.tile.y}`];
                warp(warpInfo);
            }
            return "arrived";
        }
    }

    checkDirectionChange() {
        if ((keyIsDown(KEYS.UP) || currentlyHeldButton == KEYS.UP) && this.direction != DIRECTION.NORTH) {
            this.setDirection(DIRECTION.NORTH);
        } else if ((keyIsDown(KEYS.RIGHT) || currentlyHeldButton == KEYS.RIGHT) && this.direction != DIRECTION.EAST) {
            this.setDirection(DIRECTION.EAST);
        } else if ((keyIsDown(KEYS.DOWN) || currentlyHeldButton == KEYS.DOWN) && this.direction != DIRECTION.SOUTH) {
            this.setDirection(DIRECTION.SOUTH);
        } else if ((keyIsDown(KEYS.LEFT) || currentlyHeldButton == KEYS.LEFT) && this.direction != DIRECTION.WEST) {
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