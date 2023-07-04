class Character extends Creature {
    constructor(x, y, DIRECTION, id, pathing, tiles) {
        let prototype = globalCharacterList.all_characters.find(character => character.id == id);
        super(x, y, DIRECTION, 0, tiles);
        this.model = 0;
        this.name = prototype.name;
        this.dialogues = prototype.dialogues;
        this.questLevel = 0;
        this.role = prototype.role;
        this.id = id;
        this.pathing = pathing;
        this.path;

        if (this.pathing == "roaming") {
            this.path = zone.paths.find(path => path.id == this.id).path;
        }

        if (worldData.characters[`${this.id}`]) {
            this.questLevel = worldData.characters[`${this.id}`].questLevel;
        }
    }

    work() {
        if (this.pathing == "static") {

        } else if (this.pathing == "roaming") {
            this.moveRandomly();
        }
    }

    async interact(origin) {
        let newDir = [origin.x - this.x, origin.y - this.y]
        this.direction = newDir;
        super.draw(player.x, player.y);
        let currentDialogue = this.dialogues[`${this.questLevel}`];
        if (currentDialogue) {
            if (currentDialogue[0].checkMonster && this.checkforMonster(currentDialogue[0].checkMonster.species)) {
                this.setQuest(currentDialogue[0].checkMonster.gain);
                await dialogue.speak(this.dialogues[`${this.questLevel}`], this);
            } else if (currentDialogue[0].checkItem && this.checkforItem(currentDialogue[0].checkItem.itemType)) {
                this.setQuest(currentDialogue.checkItem.gain);
                await dialogue.speak(this.dialogues[`${this.questLevel}`], this)
            } else {
                await dialogue.speak(currentDialogue, this);
            }
        }
        if (this.role == CHARACTER_ROLES.HEALER) {
            player.healAllMonsters();
        }
    }

    checkforItem(itemType) {
        for (let i = 0; i < player.inventory.length; i++) {
            if (player.inventory[i].type == itemType) {
                return true;
            }
        }
        return false;
    }

    checkforMonster(monsterSpecies) {
        if (player.monsters[0].species == monsterSpecies) {
            return true;
        }
        return false;
    }

    setQuest(newLevel) {
        this.questLevel = newLevel;
    }

    moveRandomly() {
        let decision = Math.random();
        //10% chance to act
        if (decision < 0.1) {
            //Pick one of four directions. ONLY WORKS if decision is <0.1
            decision = Math.floor((decision * 200) / 5);
            let dir = Object.values(DIRECTION)[decision];
            let desiredTile = [this.x + dir[0], this.y + dir[1]]
            //If already facing this way, move in this direction
            if (this.direction == dir && this.tileIsInPath(desiredTile)) {
                this.move(dir);
            } else {
                this.setDirection(dir);
                //66% chance to face a new direction AND move
                if (Math.random < 0.66 && this.tileIsInPath(desiredTile)) {
                    this.move(dir);
                }
            }
        }
    }

    tileIsInPath(desiredTile) {
        if ((grid.tiles[desiredTile[0]] || [])[desiredTile[1]] === undefined) {
            //Desired tile does not exist
            return false;
        } else {
            //Check if desired tile is in characters path
            for (let i = 0; i < this.path.length; i++) {
                if (JSON.stringify(this.path[i]) == JSON.stringify(desiredTile)) {
                    return true;
                }
            }
            return false;
        }
    }
}