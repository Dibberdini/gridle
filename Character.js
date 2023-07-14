class Character extends Creature {
    constructor(x, y, DIRECTION, id, pathing, tiles) {
        let prototype = globalCharacterList.all_characters.find(character => character.id == id);
        super(x, y, DIRECTION, prototype.model, tiles);
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
        if (this.role == CHARACTER_ROLES.TRAINER) {
            this.monsters = [];
            for (let i = 0; i < prototype.monsters.length; i++) {
                let monsterPrototype = globalMonsterList.monsters.find(monster => monster.id == prototype.monsters[i].id);
                let monster = new Monster(monsterPrototype);
                monster.owner = this;
                monster.setLevel(prototype.monsters[i].level);
                this.monsters.push(monster);
            }
        }
    }

    work() {
        if (this.pathing == "static") {

        } else if (this.pathing == "roaming") {
            this.moveRandomly();
        }
        if (this.role == CHARACTER_ROLES.TRAINER && tick == 0 && this.questLevel == 0) {
            this.lookAhead();
        }
    }

    async interact(origin) {
        let newDir = [origin.x - this.x, origin.y - this.y]
        this.direction = newDir;
        if (this.role == CHARACTER_ROLES.TRAINER && this.questLevel == 0) {
            return;
        }
        draw();
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

    lookAhead() {
        for (let i = 0; i < 3; i++) {
            let checkedTile = grid.tiles[this.x + this.direction[0] * (i + 1)][this.y + this.direction[1] * (i + 1)];
            if (checkedTile.occupant == player && player.step[0] == 0 && player.step[1] == 0) {
                this.movetoEngage(i)
            }
        }
    }

    async movetoEngage(movesNeeded) {
        state = STATE.ENCOUNTER;
        for (let i = 0; i < movesNeeded; i++) {
            this.move(this.direction);
            while (this.step[0] != 0 || this.step[1] != 0) {
                await sleep(5);
            }
        }
        let currentDialogue = this.dialogues[`${this.questLevel}`];
        await dialogue.speak(currentDialogue, this);
        battle.trainerBattle(this);
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