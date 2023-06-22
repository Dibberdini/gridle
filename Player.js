class Player extends Creature {
    constructor(x, y, DIRECTION, model, tiles) {
        super(x, y, DIRECTION, model, tiles);
        this.monsters = [];
        this.inventory = [];
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
                4 * TILE_WIDTH + 0.5 * TILE_WIDTH + (this.DIRECTION[0] * TILE_WIDTH * 0.5),
                4 * TILE_HEIGHT + 0.5 * TILE_HEIGHT + (this.DIRECTION[1] * TILE_HEIGHT * 0.5));
            pop();
        }
    }

    async update() {
        if (super.update() == "arrived") {
            if (this.tile.type == TileType.GRASS && this.monsters.length > 0) {
                if (Math.random() < 0.2) {
                    let monsterList = [];
                    for (let i = 0; i < zone.monsters.length; i++) {
                        monsterList.push(globalMonsterList.monsters[zone.monsters[i]]);
                    }
                    battle.encounter(monsterList, zone.zone_strength);
                    this.step = [0, 0];
                }
            } else if (this.tile.type == TileType.TELEPORT) {
                let warpInfo = zone.warp[`${this.tile.x}`][`${this.tile.y}`];
                warp(warpInfo);
            }
        }
    }

    addMonster(monster) {
        monster.owner = this;
        this.monsters.push(monster);
    }

    addItem(item) {
        let index = this.inventory.findIndex(element => element.type == item.type)
        if (index < 0) {
            this.inventory.push({ type: item.type, count: 1, })
        } else {
            this.inventory[index].count++;
        }
    }

    healAllMonsters() {
        this.monsters.forEach(monster => {
            monster.heal(monster.maxHealth);
            monster.dead = false;
        });
    }
}