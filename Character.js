class Character extends Creature {
    constructor(x, y, DIRECTION, model, tiles, name, role) {
        super(x, y, DIRECTION, model, tiles);
        this.name = name;
        this.dialogues = zone.dialogues.find(dialogue => dialogue.name == this.name);
        this.questLevel = 0;
        this.role = role
    }

    work() {
        let decision = Math.random();
        if(decision < 0.1) {
            decision = Math.floor((decision * 200) / 5);
            let dir = Object.values(DIRECTION)[decision];
            if(this.direction == dir) {
                this.move(dir);
            } else {
                this.setDirection(dir);
                if(Math.random() < 0.3) {
                    this.move(dir);
                }
            }
        }
    }

    interact(origin) {
        let newDir = [origin.x - this.x, origin.y - this.y]
        this.DIRECTION = newDir;
        super.draw(player.x, player.y);
        if(this.questLevel == 0) {
            dialogue.load(this.dialogues.meeting);
            this.questLevel++;
        } else {
            dialogue.load(this.dialogues.generic);
            if(this.role == CHARACTER_ROLES.HEALER) {
                player.monsters.forEach(monster => {
                    monster.heal(monster.maxHealth);
                });
            }
        }
    }

    setQuestLevel(newLevel) {
        this.questLevel = newLevel;
    }
}