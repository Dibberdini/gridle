class BattleManager {
    constructor() {
        this.activeEnemy;
        this.activeMonster;
        this.selections = [
            ["Fight", 400, 470],
            ["Items", 520, 470],
            ["Switch", 400, 520],
            ["Flee", 520, 520]
        ];
        this.fightSelections = [
            ["Scramble", 50, 470],
            ["Scramble", 200, 470],
            ["Scramble", 50, 520],
            ["Scramble", 200, 520]
        ]
        this.selector = 0;
        this.fight = false;
        this.playerTurn = true;
    }

    encounter(monsterList, strength) {
        //Pick a random monster from the zone list
        var monster = new Monster(monsterList[Math.floor(Math.random() * monsterList.length)]);
        //Set the monster to an appropriate strength-level
        monster.setStrength(strength);

        this.startBattle([monster]);
    }

    trainerBattle(trainerInfo) {
        this.startBattle(trainerInfo.monsters);
    }

    startBattle(monsters) {
        this.selector = 0;
        this.activeEnemy = monsters[0];
        //Set player monster to first conscious monster
        for (let i = 0; i < player.monsters.length; i++) {
            if (!player.monsters[i].dead) {
                this.activeMonster = player.monsters[i];
                break;
            }
        }

        if (this.activeMonster.speed > this.activeEnemy.speed) {
            this.playerTurn = true;
        } else {
            this.playerTurn = false;
            dialogue.clear();
            this.performEnemyTurn();
        }

        state = STATE.BATTLE;

    }

    draw() {
        background(255);

        //Draw monsters
        this.activeEnemy.draw(true);
        this.activeMonster.draw(false);

        //If applicable, draw battle dialogue instead of menu
        if (!this.playerTurn) {
            dialogue.draw();
            return;
        }
        if (this.activeMonster.outstandingEXP > 0) {
            return;
        }

        //Draw bottom box
        push();
        fill(180);
        stroke(0);
        strokeWeight(3);
        rect(0, height - 140, width - 1.5, 138.5);
        pop();

        //Draw Menu Selections
        push();
        textSize(22);
        textStyle(BOLD);
        strokeWeight(2);
        for (let i = 0; i < this.selections.length; i++) {
            text(
                this.selections[i][0],
                this.selections[i][1],
                this.selections[i][2]);
        }
        line(360, 400, 360, 538.5)

        //If fight has been selected draw the attack-moves
        if (this.fight) {
            for (let i = 0; i < this.selections.length; i++) {
                if (this.activeMonster.moveSet[i]) {
                    text(
                        this.activeMonster.moveSet[i].name,
                        this.fightSelections[i][1],
                        this.fightSelections[i][2]);
                }
            }
        }
        pop();

        //Draw selector either at current move or menu choice
        if (this.fight) {
            this.drawSelector(this.fightSelections[this.selector][1] - 12, this.fightSelections[this.selector][2] - 35);
        } else {
            this.drawSelector(this.selections[this.selector][1] - 12, this.selections[this.selector][2] - 35)
        }

    }

    updateSelector(dir) {
        let newSelection = this.selector + dir;
        newSelection = constrain(newSelection, 0, 3);

        //If in fight-mode check if there is a move here
        if (this.fight) {
            if (this.activeMonster[newSelection]) {
                this.selector = newSelection;
            }
            else {
                return;
            }
        }

        this.selector = newSelection;
    }

    async inputA() {
        if (this.fight && this.playerTurn) {
            this.playerTurn = false;
            let move = this.activeMonster.moveSet[this.selector]
            this.activeMonster.attackMove(move, this.activeEnemy);

            //Setup message to display while move is carried out.
            let message = this.activeMonster.name + " used " + move.name + "!";
            dialogue.load([{ type: "battle", line: message }]);
            //Wait until animation is finished, then check if opponent died.
            while (this.activeEnemy.outstandingDamage > 0) {
                await sleep(100);
            }
            if (this.activeEnemy.dead) {
                //Calculate won EXP, and award it to monster
                let EXPGain = Math.ceil(Math.pow(this.activeEnemy.strength, 2.3) * this.activeMonster.prototype.growth + 20);
                if (this.activeEnemy.owner != "wild") {
                    EXPGain *= 1.5;
                }
                this.activeMonster.gainEXP(EXPGain);
                while (this.activeMonster.outstandingEXP > 0) {
                    await sleep(100);
                }
                //Show EXP-gain dialogue
                let EXP_Message = this.activeMonster.name + " gained " + EXPGain + " experience!";
                await dialogue.load([{ type: "timed", line: EXP_Message, time: 1000 }])

                this.fight = false;
                state = STATE.WORLD;
            } else {
                await sleep(800)
                this.performEnemyTurn();
            }
        } else {
            if (this.selector == 0) {
                this.fight = true;
            } else if (this.selector == 2) {
                state = STATE.PAUSED;
                menu.lastState = STATE.BATTLE;
                menu.menuState = MENU_STATES.MONSTER_MENU;
                this.selector = 0;
            } else if (this.selector == 3) {
                state = STATE.WORLD;
            }
        }
    }

    inputB() {
        if (this.fight) {
            this.fight = false;
            this.selector = 0;
        }
    }

    drawSelector(x, y) {
        push();
        noStroke();
        fill(255);
        triangle(x, y, x + 10, y + 10, x, y + 20);
        pop();
    }

    async performEnemyTurn() {
        let move;
        if (this.activeEnemy.owner == "wild") {
            //Select random move from wild monsters moveset
            move = (this.activeEnemy.moveSet[Math.floor(Math.random() * this.activeEnemy.moveSet.length)]);
            this.activeEnemy.attackMove(move, this.activeMonster);
        }

        //Setup message to display while move is carried out.
        let message = "Enemy " + this.activeEnemy.name + " used " + move.name + "!";
        dialogue.load([{ type: "battle", line: message }]);

        while (this.activeMonster.outstandingDamage > 0) {
            await sleep(100);
        }
        if (this.activeMonster.health <= 0) {
            this.activeMonster.dead = true;
            await dialogue.load([{ type: "timed", line: `${this.activeMonster.name}` + " fainted!", time: 1000 }])
            for (let i = 0; i < player.monsters.length; i++) {
                if (player.monsters[i]) {
                    if (!player.monsters[i].dead) {
                        this.activeMonster = player.monsters[i]
                        this.fight = false;
                        this.selector = 0;
                        await dialogue.load([{ type: "timed", line: `${this.activeMonster.name}` + " you're up!", time: 1000 }])
                        break;
                    }
                }
                if (i == player.monsters.length - 1) {
                    await dialogue.load([{ type: "timed", line: "You've run out of monsters!", time: 1000 }]);
                    this.fight = false;
                    state = STATE.WORLD;
                    resuscitate();
                }
            }
        }

        await sleep(800);
        this.playerTurn = true;
    }
}