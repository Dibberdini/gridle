class Monster {
    constructor(monsterPrototype) {
        this.prototype = monsterPrototype;
        this.species = monsterPrototype.name;
        this.attack = monsterPrototype.attack;
        this.defence = monsterPrototype.defence;
        this.speed = monsterPrototype.speed;
        this.maxHealth = monsterPrototype.maxHealth;
        this.evasion = monsterPrototype.evasion;
        this.model = monsterPrototype.model;
        this.type = monsterPrototype.type;
        this.moveSet = [globalMoveList.moves[0]];
 
        this.name = monsterPrototype.name;
        this.experience = 0;
        this.strength = 1;
        this.health = this.maxHealth;
        this.dead = false;
        this.owner = "wild";

        this.outstandingDamage = 0;
        this.outstandingEXP = 0;
        this.requiredEXP;
        this.setRequiredEXP();
    }

    setStrength(strength) {
        this.attack *= strength;
        this.defence *= strength;
        this.speed *= strength;
        this.maxHealth *= strength;
        this.evasion *= strength;
        this.health *= strength;

        this.strength = strength;
        
        this.setRequiredEXP();
    }

    draw(isEnemy) {
        if(isEnemy) {
            this.drawModel(400, 60);
            this.drawStats(70, 60, false);
        } else {
            this.drawModel(100, 280);
            this.drawStats(380, 320, true);
        }
    }

    drawModel(x, y) {
        if(this.model == 0) {
            push();
            fill(0,250,0);
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
        text("Lvl: " + this.strength, x + 20, y + 25);

        //Update HP
        if(this.outstandingDamage > 0) {
            this.health--;
            this.outstandingDamage--;

            if(this.health <= 0) {
                this.health = 0;
                this.dead = true;
            }

            if(this.outstandingDamage <= 0) {
                this.outstandingDamage = 0;
            }
        }

        //Draw HP
        text("HP: ", x + 10, y + 50);
        if(fullStats) {
            textSize(16);
            text(this.health + "/" + this.maxHealth, x+53, y+39);
        }
        strokeWeight(2);
        noFill();
        rect(x+53, y+40, 120, 8);
        noStroke();
        fill(255,0,0);
        let percentageHealth = this.health / this.maxHealth * 120;
        rect(x+53, y+40, percentageHealth, 8);

        //Update XP
        if(this.outstandingEXP > 0) {
            this.experience++;
            this.outstandingEXP--;

            if(this.experience >= this.requiredEXP) {
                this.experience -= this.requiredEXP;
                this.gainStrength();
            }
        }

        //Draw XP
        let percentageXP = this.experience / this.requiredEXP * 130
        fill(51, 204, 255);
        rect(x+1,y+53, percentageXP, 8);

        //Draw Border
        stroke(0);
        strokeWeight(3);
        fill(0);
        line(x, y + 20, x, y+60);
        line(x, y+60, x+130, y+60);
        triangle(x + 130, y + 55, x + 140, y + 60, x + 130, y + 65);
        pop();
    }

    addName(name) {
        this.name = name;
    }

    async attackMove(move, target) {
        let crit = Math.ceil(Math.random() * 2);
        let damage = (((((2*this.strength*crit) / 5) + 2) * move.power * (this.attack / target.defence)) / 50) + 2;
        let random = Math.random() * 0.15 + 1;
        damage *= random;
        damage = Math.ceil(damage);

        target.takeDamage(damage);
    }

    takeDamage(damage) {
        this.outstandingDamage = damage;
    }

    heal(healAmount) {
        this.health += healAmount;
        if(this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }

    gainEXP(exp) {
        this.outstandingEXP += exp;
    }

    gainStrength() {
        this.strength++;
        this.setRequiredEXP();

        this.attack += this.prototype.attack;
        this.defence += this.prototype.defence;
        this.speed += this.prototype.speed;
        this.maxHealth += this.prototype.maxHealth;
        this.evasion += this.prototype.evasion;
        this.health += this.prototype.maxHealth;

        if(this.experience >= this.requiredEXP) {
            this.gainStrength();
        }
    }

    learnMove(moveName) {
        var newMove = globalMoveList.moves.find(move => move.name == moveName);
        if(this.moveSet.length < 3) {
            this.moveSet.push(newMove);
        }
    }

    setRequiredEXP() {
        this.requiredEXP = Math.ceil(1.6 * Math.pow(this.strength, 2.7) + 10);
    }
}