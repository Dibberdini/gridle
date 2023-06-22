class Item extends Entity {
    constructor(x, y, id, type, owner, tiles) {
        super(x, y, 0, tiles)
        this.id = id;
        this.type = type;
        this.owner = owner;
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
}