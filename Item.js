class Item extends Entity {
    constructor(x, y, id, type, owner, tiles) {
        super(x, y, 0, tiles)
        this.id = id;
        this.type = type;
        this.owner = owner;
        this.name = Item.getItemInfo(type).name;
        this.model = globalSpriteList.models.underberg;
    }

    draw(x, y) {
        let newX = this.x + 4 - x;
        let newY = this.y + 4 - y;

        image(this.model, newX * TILE_WIDTH, newY * TILE_HEIGHT);
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
        dialogue.load([{ type: "timed", line: `Picked up ${this.name}.`, time: 1000 }]);
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

    static async useItem(itemType, index) {
        switch (itemType) {
            case "potion":
                menu.loadedItem = { heal: 20 }
                menu.lastState = state;
                state = STATE.PAUSED;
                menu.index = 0;
                menu.menuState = MENU_STATES.MONSTER_MENU;
                break;
            case "ball_regular":
                if (battle.activeEnemy.owner != "wild") {
                    await dialogue.load([{ type: "timed", line: "Thief! You can't steal a bojsemon.", time: 1000 }]);
                    battle.selectingItem = false;
                    return;
                }
                battle.selectingItem = false;
                menu.index = 0;
                menu.offset = 0;
                menu.menuState = MENU_STATES.MAIN_MENU;
                player.removeItem(index);
                battle.draw();
                await AnimationManager.throwBall();
                if (battle.activeEnemy.catch(0)) {
                    await battle.caughtMonster();
                } else {
                    await dialogue.load([{ type: "statement", line: "Oh no! it broke free!" }]);
                }
            default:
                break;
        }
    }
}