class Character extends Creature {
    constructor(x, y, DIRECTION, id, tiles) {
        let prototype = globalCharacterList.all_characters.find(character => character.id == id);
        super(x, y, DIRECTION, 0, tiles);
        this.model = 0;
        this.name = prototype.name;
        this.dialogues = prototype.dialogues;
        this.questLevel = 0;
        this.role = prototype.role
    }

    work() {
        let decision = Math.random();
        if (decision < 0.1) {
            decision = Math.floor((decision * 200) / 5);
            let dir = Object.values(DIRECTION)[decision];
            if (this.direction == dir) {
                this.move(dir);
            } else {
                this.setDirection(dir);
                if (Math.random() < 0.3) {
                    this.move(dir);
                }
            }
        }
    }

    interact(origin) {
        let newDir = [origin.x - this.x, origin.y - this.y]
        this.DIRECTION = newDir;
        super.draw(player.x, player.y);
        if (this.dialogues[`${this.questLevel}`]) {
            dialogue.speak(this.dialogues[`${this.questLevel}`], this);
        }
        if (this.role == CHARACTER_ROLES.HEALER) {
            player.healAllMonsters();
        }
    }

    setQuest(newLevel) {
        this.questLevel = newLevel;
    }
}