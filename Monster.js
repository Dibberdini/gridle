class Monster {
    constructor(monsterPrototype) {
        this.prototype = monsterPrototype;
        this.species = monsterPrototype.name;
        this.attack = monsterPrototype.attack;
        this.defence = monsterPrototype.defence;
        this.speed = monsterPrototype.speed;
        this.special = monsterPrototype.special;
        this.maxHealth = monsterPrototype.maxHealth;

        this.model = monsterPrototype.id.toString().padStart(3, 0);

        this.type = monsterPrototype.type;
        this.catchRate = monsterPrototype.catchRate;
        this.moveSet = [];
        this.name = monsterPrototype.name;
        this.level = 1;
        this.experience = 0;
        this.requiredEXP = this.calculateRequiredEXP();
        this.health = this.maxHealth;
        this.dead = false;
        this.owner = "wild";
        this.status = STATUSES.NONE;
        this.critRate = monsterPrototype.speed / 2;

        this.EVs = { health: 0, attack: 0, defence: 0, special: 0, speed: 0 }
        this.IVs = { health: 0, attack: 0, defence: 0, special: 0, speed: 0 }
        this.IVs.health = Math.round(Math.random() * 15);
        this.IVs.attack = Math.round(Math.random() * 15);
        this.IVs.defence = Math.round(Math.random() * 15);
        this.IVs.special = Math.round(Math.random() * 15);
        this.IVs.speed = Math.round(Math.random() * 15);

        //Battle-stats
        this.cooldown = 0;
        this.evasion = 100;
        this.accuracy = 100;

        //Mutable parameters
        this.outstandingDamage = 0;
        this.outstandingEXP = 0;
        this.outstandingHealing = 0;
        this.loadedMove;
        this.loadedTarget;
    }

    setLevel(level) {
        this.level = level;
        this.calculateStats();
        this.requiredEXP = this.calculateRequiredEXP();
        //Give the monster attack-moves
        var monsterMoveList = globalMonsterList.learnset.find(monsterMoves => monsterMoves.id == this.prototype.id).moves;
        monsterMoveList = monsterMoveList.map((x) => x);
        while (monsterMoveList.length > 0 && this.moveSet.length < 4) {
            let highestMove = monsterMoveList.pop();
            if (this.level >= highestMove.level) {
                var newMove = globalMoveList.moves.find(move => move.id == highestMove.id);
                newMove = { ...newMove };
                newMove.maxPP = newMove.pp;
                this.moveSet.push(newMove);
            }
        }
    }

    async draw(isEnemy) {
        if (isEnemy) {
            this.drawModel(400, 60);
            await this.drawStats(70, 60, false);
        } else {
            this.drawModel(50, 220);
            await this.drawStats(380, 320, true);
        }
    }

    drawModel(x, y) {
        image(globalSpriteList.monsters[`${this.model}`], x, y, 180, 180);
    }

    async drawStats(x, y, fullStats) {
        push();
        fill(0);
        noStroke();
        //Draw Name
        textSize(24);
        text(this.name, x, y)

        //Draw Level
        text("Lvl: " + this.level, x + 20, y + 25);
        if (this.status != STATUSES.NONE) {
            text(this.status.toUpperCase(), x + 40, y + 25);
        }

        //Update HP
        if (this.outstandingDamage > 0) {
            this.health--;
            this.outstandingDamage--;

            if (this.health <= 0) {
                this.health = 0;
                this.cooldown = 0;
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
        stroke(0);
        noFill();
        rect(x + 53, y + 40, 120, 8);
        noStroke();
        fill(255, 0, 0);
        let percentageHealth = this.health / this.maxHealth * 120;
        rect(x + 53, y + 40, percentageHealth, 8);

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

        //Update XP
        if (this.outstandingEXP > 0) {
            this.experience++;
            this.outstandingEXP--;
        }

        pop();
    }

    addName(name) {
        this.name = name;
    }

    attackMove(move, target) {
        let moveInfo = {};
        let crit = 1;
        if ((Math.random * 255) < this.critRate) {
            moveInfo.crit = true;
            crit = 2;
        }
        let damage = (((((2 * this.level * crit) / 5) + 2) * move.power * (this.attack / target.defence)) / 50) + 2;
        damage = Math.ceil(damage);

        if (move.type == this.type[0] || move.type == this.type[1]) {
            damage *= 1.5;
        }
        if (TYPES[`${move.type}`][`${target.type}`]) {
            let effectiveness = TYPES[`${move.type}`][`${target.type}`];
            damage *= effectiveness;
            moveInfo.effectiveness = effectiveness;
        }
        let random = map(Math.random(), 0, 1, 217, 255) / 255;
        damage = Math.round(damage * random);

        let accuracy = move.accuracy * this.accuracy * target.evasion;
        constrain(accuracy, 0, 255);
        let randomA = Math.round(Math.random() * 255);
        let randomS = Math.round(Math.random() * 255);
        if (damage == 0 && effectiveness != 0) {
            randomS = 0;
        }

        if (randomA < accuracy) {
            target.takeDamage(damage);
            if (move.status) {
                if (move.status == STATUSES.HEALING) {
                    this.heal(this.maxHealth / 2);
                } else if (randomS < accuracy) {
                    target.setStatus(move.status);
                }
            }
            if (move.cooldown) {
                this.cooldown = move.cooldown;
                moveInfo.cooldown = true;
            }
        } else {
            moveInfo.missed = true;
        }
        moveInfo.damage = damage;
        return moveInfo;
    }

    resetBattleStats() {
        this.evasion = 100;
        this.accuracy = 100;
        this.cooldown = 0;
    }

    takeDamage(damage) {
        this.outstandingDamage = damage;
    }

    setStatus(status) {
        switch (status) {
            case STATUSES.PARALYZED:
                this.speed *= 0.25;
                break;
            case STATUSES.NONE:
                if (this.status == STATUSES.PARALYZED) {
                    this.speed *= 4;
                }
                break;
            default:
                break;
        }
        this.status = status;
    }

    statusEffect() {
        let effect = {};
        switch (this.status) {
            case STATUSES.PARALYZED:
                if (Math.random() < 0.25) {
                    effect.paralyzed = true;
                }
                break;
            case STATUSES.POISONED:
                if (Math.random() < 0.2) {
                    effect.unpoisoned = true;
                } else {
                    effect.poisoned = true;
                }
                break;
            case STATUSES.ASLEEP:
                if (Math.random() < 0.2) {
                    effect.awake = true;
                } else {
                    effect.asleep = true;
                }
                break;
            default:
                break;
        }
        return effect;
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
            return true;
        }
    }

    async levelUp() {
        this.experience -= this.requiredEXP;
        this.level++;
        this.requiredEXP = this.calculateRequiredEXP();
        this.calculateStats();

        if (state == STATE.BATTLE) {
            battle.draw();
        }
        await dialogue.load([{ type: "timed", line: `${this.name} rose to level ${this.level}`, time: 700 }]);

        var monsterMoveList = globalMonsterList.learnset.find(monsterMoves => monsterMoves.id == this.prototype.id).moves;
        for (let i = 0; i < monsterMoveList.length; i++) {
            if (monsterMoveList[i].level == this.level) {
                await this.learnMove(monsterMoveList[i].id);
            }
        }

        if (this.experience >= this.requiredEXP) {
            this.levelUp(showDialogue);
            return;
        }

        if (this.prototype.nextForm && this.level >= this.prototype.nextForm.level) {
            await this.evolve();
        }
    }

    async evolve() {
        if (!this.prototype.nextForm) {
            return;
        }

        let newPrototype = globalMonsterList.monsters.find(monster => monster.id == this.prototype.nextForm.id);
        let cancel = await AnimationManager.evolution(this.prototype, newPrototype, this.name);
        if (cancel) {
            await dialogue.load([{ type: "statement", line: `Huh? ${this.name} stopped evolving?` }]);
            return;
        }

        let newName = this.species;
        this.prototype = newPrototype;
        this.species = this.prototype.name;
        this.calculateStats();
        this.requiredEXP = this.calculateRequiredEXP();
        this.model = this.prototype.id.toString().padStart(3, 0);

        var monsterMoveList = globalMonsterList.learnset.find(monsterMoves => monsterMoves.id == this.prototype.id).moves;
        monsterMoveList = monsterMoveList.map((x) => x);
        while (monsterMoveList.length > 0 && this.moveSet.length < 4) {
            let highestMove = monsterMoveList.pop();
            if (this.level >= highestMove.level) {
                if (this.knowsMove(highestMove.id)) {
                    break;
                } else {
                    this.learnMove(highestMove.id);
                    break;
                }
            }
        }
        await dialogue.load([{ type: "statement", line: `${this.name} evolved into ${this.prototype.name}!` }]);

        if (this.name == newName) {
            this.name = this.species;
        }
    }

    knowsMove(moveId) {
        for (let i = 0; i < this.moveSet.length; i++) {
            if (this.moveSet[i].id == moveId) {
                return true;
            }
        }
        return false;
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

    async learnMove(moveId) {
        var newMove = globalMoveList.moves.find(move => move.id == moveId);
        newMove == { ...newMove };
        newMove.maxPP = newMove.pp;
        for (let i = 0; i < this.moveSet.length; i++) {
            if (this.moveSet[i].id == moveId) {
                await dialogue.load([
                    { type: "statement", line: `${this.name} is trying to learn ${newMove.name},` },
                    { type: "statement", line: "but it already knows it" }]);
                return;
            }
        }

        if (this.moveSet.length < 4) {
            this.moveSet.push(newMove);
            await dialogue.load([{ type: "statement", line: `${this.name} learned ${newMove.name}!` }]);
        } else {
            await this.tooManyMoves(moveId);
        }
    }

    async tooManyMoves(moveId) {
        var newMove = globalMoveList.moves.find(move => move.id == moveId);
        await dialogue.load([{ type: "statement", line: `${this.name} is trying to learn ${newMove.name},` }]);
        await dialogue.load([{ type: "statement", line: "but it already knows 4 moves." }]);
        let learn = await dialogue.ask("Delete a move to make room for this one?");
        if (learn == "No") {
            await dialogue.load([{ type: "statement", line: `${this.name} did not learn ${newMove.name}.` }]);
        } else {
            dialogue.options = [];
            for (let i = 0; i < this.moveSet.length; i++) {
                dialogue.options.push(this.moveSet[i].name);
            }
            let choice = await dialogue.ask("Which move should be forgotten?");
            if (choice == false) {
                this.tooManyMoves(moveId);
                return;
            } else {
                for (let i = 0; i < this.moveSet.length; i++) {
                    if (this.moveSet[i].name == choice) {
                        this.moveSet[i] = newMove;
                        break;
                    }
                }
                await dialogue.load([
                    { type: "statement", line: "Poof!" },
                    { type: "statement", line: `${this.name} forgot ${choice}, and...` },
                    { type: "statement", line: `${this.name} learned ${newMove.name}!` }]);
            }
        }
    }

    catch(ballStrength) {
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
        } else {
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