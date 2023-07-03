class Item extends Entity {
    constructor(x, y, id, type, owner, tiles) {
        super(x, y, 0, tiles)
        this.id = id;
        this.type = type;
        this.owner = owner;
        this.name = Item.getItemInfo(type).name;
    }

    draw(x, y) {
        let newX = this.x + 4 - x;
        let newY = this.y + 4 - y;

        if (this.model == 0) {
            push()
            fill(0, 0, 255);
            noStroke();
            ellipseMode(CENTER);
            circle(newX * TILE_WIDTH + 0.5 * TILE_WIDTH, newY * TILE_HEIGHT + 0.5 * TILE_HEIGHT, TILE_WIDTH * 0.7);
            pop();
        }
    }

    interact(newOwner) {
        this.owner = newOwner;

        //Find this items index number and remove it from list of world-entities
        let index;
        for (let i = 0; i < entities.length; i++) {
            if (Object.is(this, entities[i])) {
                index = i;
                break;
            }
        }
        entities.splice(index, 1);

        //Clear tile
        this.tile.setClear(true);
        this.tile.occupant = null;
        this.tile = null;

        //Add to saved list of picked up items to prevent respawning.
        addToPickedItems(this);

        //Add to inventory of player.
        this.owner.addItem(this);
    }

    static getItemInfo(itemType) {
        let info = { hasWorldUse: false, hasBattleUse: false, name: "Unknown" };
        switch (itemType) {
            case "ball_regular":
                info.hasBattleUse = true;
                info.hasWorldUse = false;
                info.name = "Ball";
                break;
            case "potion":
                info.hasBattleUse = true;
                info.hasWorldUse = true;
                info.name = "Potion";
                break;
            default:
                break;
        }
        return info
    }

    static async useItem(itemType) {
        switch (itemType) {
            case "potion":
                menu.loadedItem = { heal: 20 }
                menu.lastState = state;
                state = STATE.PAUSED;
                menu.index = 0;
                menu.menuState = MENU_STATES.MONSTER_MENU;
                break;
            case "ball_regular":
                battle.selectingItem = false;
                menu.index = 0;
                menu.offset = 0;
                menu.menuState = MENU_STATES.MAIN_MENU;
                battle.draw();
                await AnimationManager.throwBall();
                if (battle.activeEnemy.catch(0, player)) {
                    battle.caughtMonster();
                } else {
                    await dialogue.load([{ type: "statement", line: "Oh no! it broke free!" }]);
                }
            default:
                break;
        }
    }
}