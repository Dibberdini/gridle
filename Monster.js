class Monster {
    constructor(monsterPrototype) {
        this.prototype = monsterPrototype;
        this.species = monsterPrototype.name;
        this.attack = monsterPrototype.attack;
        this.defence = monsterPrototype.defence;
        this.speed = monsterPrototype.speed;
        this.special = monsterPrototype.special;
        this.maxHealth = monsterPrototype.maxHealth;

        this.model = monsterPrototype.model;
        this.type = monsterPrototype.type;
        this.catchRate = monsterPrototype.catchRate;
        this.moveSet = [globalMoveList.moves[0]];
        this.name = monsterPrototype.name;
        this.level = 1;
        this.experience = 0;
        this.requiredEXP = this.calculateRequiredEXP();
        this.health = this.maxHealth;
        this.dead = false;
        this.owner = "wild";
        this.status = "none";

        this.EVs = { health: 0, attack: 0, defence: 0, special: 0, speed: 0 }
        this.IVs = { health: 0, attack: 0, defence: 0, special: 0, speed: 0 }
        this.IVs.health = Math.round(Math.random() * 15);
        this.IVs.attack = Math.round(Math.random() * 15);
        this.IVs.defence = Math.round(Math.random() * 15);
        this.IVs.special = Math.round(Math.random() * 15);
        this.IVs.speed = Math.round(Math.random() * 15);

        //Battle-specific parameters
        this.outstandingDamage = 0;
        this.outstandingEXP = 0;
        this.outstandingHealing = 0;
        this.loadedMove;
        this.loadedTarget;
    }

    setLevel(level) {
        while (this.level < level) {
            this.levelUp();
        }

        this.requiredEXP = this.calculateRequiredEXP();

        //Give the monster attack-moves
        var monsterMoveList = globalMonsterList.learnset.find(monsterMoves => monsterMoves.name == this.species).moves;
        while (monsterMoveList.length > 0 && this.moveSet < 3) {
            let highestMove = monsterMoveList.pop();
            if (monster.strength >= highestMove[0]) {
                monster.learnMove(highestMove[1]);
            }
        }
    }

    draw(isEnemy) {
        if (isEnemy) {
            this.drawModel(400, 60);
            this.drawStats(70, 60, false);
        } else {
            this.drawModel(100, 280);
            this.drawStats(380, 320, true);
        }
    }

    drawModel(x, y) {
        if (this.model == 0) {
            push();
            fill(0, 250, 0);
            noStroke();
            rect(x, y, 120, 120);
            pop();
        }
    }

    async drawStats(x, y, fullStats) {
        push();
        //Draw Name
        textSize(24);
        text(this.name, x, y)

        //Draw Level
        text("Lvl: " + this.level, x + 20, y + 25);

        //Update HP
        if (this.outstandingDamage > 0) {
            this.health--;
            this.outstandingDamage--;

            if (this.health <= 0) {
                this.health = 0;
                this.dead = true;
            }

            if (this.outstandingDamage <= 0) {
                this.outstandingDamage = 0;
            }
        }

        //Draw HP
        text("HP: ", x + 10, y + 50);
        if (fullStats) {
            textSize(16);
            text(this.health + "/" + this.maxHealth, x + 53, y + 39);
        }
        strokeWeight(2);
        noFill();
        rect(x + 53, y + 40, 120, 8);
        noStroke();
        fill(255, 0, 0);
        let percentageHealth = this.health / this.maxHealth * 120;
        rect(x + 53, y + 40, percentageHealth, 8);

        //Update XP
        if (this.outstandingEXP > 0) {
            this.experience++;
            this.outstandingEXP--;
            this.checkLevelUp();
        }

        //Draw XP
        let percentageXP = this.experience / this.requiredEXP * 130
        fill(51, 204, 255);
        rect(x + 1, y + 53, percentageXP, 8);

        //Draw Border
        stroke(0);
        strokeWeight(3);
        fill(0);
        line(x, y + 20, x, y + 60);
        line(x, y + 60, x + 130, y + 60);
        triangle(x + 130, y + 55, x + 140, y + 60, x + 130, y + 65);
        pop();
    }

    addName(name) {
        this.name = name;
    }

    attackMove(move, target) {
        let moveInfo = {};
        let crit = Math.ceil(Math.random() * 2);
        let damage = (((((2 * this.level * crit) / 5) + 2) * move.power * (this.attack / target.defence)) / 50) + 2;
        let random = Math.random() * 0.15 + 1;
        damage *= random;
        damage = Math.ceil(damage);

        target.takeDamage(damage);

        if (crit == 2) {
            moveInfo.crit = true;
        }
        return moveInfo;
    }

    takeDamage(damage) {
        this.outstandingDamage = damage;
    }

    increaseHealth(healAmount) {
        this.health += healAmount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }

    heal(healAmount) {
        this.outstandingHealing = healAmount
    }

    gainEXP(exp) {
        this.outstandingEXP += exp;
    }

    checkLevelUp() {
        if (this.experience >= this.requiredEXP) {
            this.experience -= this.requiredEXP;
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.requiredEXP = this.calculateRequiredEXP();

        this.calculateStats();

        if (this.experience >= this.requiredEXP) {
            this.levelUp();
        }
    }

    calculateStats() {
        let stats = ["attack", "defence", "speed", "special"]

        stats.forEach(stat => {
            this[`${stat}`] = Math.round(((((this.prototype[`${stat}`] + this.IVs[`${stat}`]) * 2 + (Math.sqrt(this.EVs[`${stat}`]) / 4)) * this.level) / 100) + 5);
        });

        let healthIncrease = Math.round(((((this.prototype.maxHealth + this.IVs.health) * 2 + (Math.sqrt(this.EVs.health) / 4)) * this.level) / 100) + this.level + 10);
        this.health += healthIncrease - this.maxHealth;
        this.maxHealth = healthIncrease;
    }

    gainEV(defeatedMonster) {
        this.EVs.attack += defeatedMonster.prototype.attack;
        if (this.EVs.attack > 25600) {
            this.EVs.attack = 25600;
        }
        this.EVs.defence += defeatedMonster.prototype.defence;
        if (this.EVs.defence > 25600) {
            this.EVs.defence = 25600;
        }
        this.EVs.speed += defeatedMonster.prototype.speed;
        if (this.EVs.speed > 25600) {
            this.EVs.speed = 25600;
        }
        this.EVs.special += defeatedMonster.prototype.special;
        if (this.EVs.special > 25600) {
            this.EVs.special = 25600;
        }
        this.EVs.health += defeatedMonster.prototype.maxHealth;
        if (this.EVs.health > 25600) {
            this.EVs.health = 25600;
        }
    }

    calculateRequiredEXP() {
        let experienceToNextLevel = 0;
        let experienceToThisLevel = 0;
        switch (this.prototype.growth) {
            case GROWTH_RATES.FAST:
                experienceToNextLevel = (4 * Math.pow(this.level + 1, 3)) / 5;
                experienceToThisLevel = (4 * Math.pow(this.level, 3)) / 5;
                break;
            case GROWTH_RATES.MEDIUM_FAST:
                experienceToNextLevel = (Math.pow(this.level + 1, 3));
                experienceToThisLevel = (Math.pow(this.level, 3));
                break;
            case GROWTH_RATES.MEDIUM_SLOW:
                experienceToNextLevel = (6 / 5) * Math.pow(this.level + 1, 3) - 15 * Math.pow(this.level + 1, 2) + 100 * (this.level + 1) - 140;
                experienceToThisLevel = (6 / 5) * Math.pow(this.level, 3) - 15 * Math.pow(this.level, 2) + 100 * this.level - 140;
                break;
            case GROWTH_RATES.SLOW:
                experienceToNextLevel = (5 * Math.pow(this.level + 1, 3)) / 4;
                experienceToThisLevel = (5 * Math.pow(this.level, 3)) / 4;
                break;
            default:
                break;
        }
        return Math.round(experienceToNextLevel - experienceToThisLevel);
    }

    learnMove(moveName) {
        var newMove = globalMoveList.moves.find(move => move.name == moveName);
        if (this.moveSet.length < 3) {
            this.moveSet.push(newMove);
        }
    }

    catch(ballStrength, newOwner) {
        let random = Math.round(Math.random() * (255 - ballStrength));
        let status = 0
        if (this.status == STATUSES.ASLEEP || this.status == STATUSES.FROZEN) {
            status = 25;
        } else if (this.status == STATUSES.POISONED || this.status == STATUSES.BURNED || this.status == STATUSES.PARALYZED) {
            status = 12;
        }
        random -= status;
        if (random <= 0) {
            return true;
        }
        let fortitude = this.maxHealth * 255;
        if (ballStrength == 55) {
            fortitude = Math.ceil(fortitude / 8);
        } else if (ballStrength == 105) {
            fortitude = Math.ceil(fortitude / 12);
        }
        let health = Math.ceil(this.health / 4);
        fortitude = Math.ceil(fortitude / health);
        if (fortitude > 255) {
            fortitude = 255;
        }
        if (this.catchRate < random) {
            return false;
        }
        let random2 = Math.ceil(Math.random() * 255);
        if (random2 <= fortitude) {
            return true;
        }
        return false;
    }
}