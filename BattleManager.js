class BattleManager {
    constructor() {
        this.activeEnemy;
        this.activeMonster;
        this.selections = [
            ["Fight", 400, 450],
            ["Items", 520, 450],
            ["Monsters", 400, 500],
            ["Flee", 520, 500]
            ];
        this.fightSelections = [
            ["Scramble", 50, 450],
            ["Scramble", 200, 450],
            ["Scramble", 50, 500],
            ["Scramble", 200, 500]
        ]
        this.selector = 0;
        this.fight = false;
        this.playerTurn = true;
    }

    encounter(monsterList, strength) {
        //Pick a random monster from the zone list
        var monster = new Monster(monsterList[Math.floor(Math.random()*monsterList.length)]);
        //Set the monster to an appropriate strength-level
        monster.setStrength(strength);
        //Give the monster attack-moves
        var monsterMoveList = globalMonsterList.learnset.find(monsterMoves => monsterMoves.name == monster.species).moves;
        while(monsterMoveList.length > 0 && monster.moveSet < 3) {
            let highestMove = monsterMoveList.pop();
            if(monster.strength >= highestMove[0]) {
                monster.learnMove(highestMove[1]);
            }
        }

        this.startBattle([monster]);
    }

    trainerBattle(trainerInfo) {
        this.startBattle(trainerInfo.monsters);
    }

    startBattle(monsters) {
        this.selector = 0;
        this.activeEnemy = monsters[0];
        this.activeMonster = player.monsters[0];

        if(this.activeMonster.speed > this.activeEnemy.speed) {
            this.playerTurn = true;
        } else {
            this.playerTurn = false;
            this.performEnemyTurn;
        }

        state = STATE.BATTLE;

    }

    draw() {
        background(255);

        //Draw monsters
        this.activeEnemy.draw(true);
        this.activeMonster.draw(false);

        //If applicable, draw battle dialogue instead of menu
        if(!this.playerTurn) {
            dialogue.draw();
            return;
        }
        if(this.activeMonster.outstandingEXP > 0) {
            return;
        }

        //Draw bottom box
        push();
        fill(180);
        stroke(0);
        strokeWeight(3);
        rect(0, height-140, width-1.5, 138.5);
        pop();

        //Draw Menu Selections
        push();
        textSize(22);
        textStyle(BOLD);
        strokeWeight(2);
        for(let i = 0; i < this.selections.length; i++) {
            text(
                this.selections[i][0],
                this.selections[i][1],
                this.selections[i][2]);
        }
        line(360, 400, 360, 538.5)

        //If fight has been selected draw the attack-moves
        if(this.fight) {
            for(let i = 0; i < this.selections.length; i++) {
                if(this.activeMonster.moveSet[i]) {
                    text(
                        this.activeMonster.moveSet[i].name,
                        this.fightSelections[i][1],
                        this.fightSelections[i][2]);
                }
                }
        }
        pop();

        //
        if(this.fight) {
            this.drawSelector(this.fightSelections[this.selector][1] - 12, this.fightSelections[this.selector][2] - 20);
        } else {
            this.drawSelector(this.selections[this.selector][1] - 12, this.selections[this.selector][2] - 20)
        }
        
    }

    updateSelector(dir) {
        let newSelection = this.selector + dir;
        newSelection = constrain(newSelection, 0, 3);

        //If in fight-mode check if there is a move here
        if(this.fight) {
            if(this.activeMonster[newSelection]) {
                this.selector = newSelection;
            }
            else {
                return;
            }
        }

        this.selector = newSelection;
    }

    async inputA() {
        if(this.fight && this.playerTurn) {
            this.playerTurn = false;
            let move = this.activeMonster.moveSet[this.selector]
            this.activeMonster.attackMove(move, this.activeEnemy);

            //Setup message to display while move is carried out.
            let message = this.activeMonster.name + " used " + move.name + "!";
            dialogue.load(["battle", message]);

            while(this.activeEnemy.outstandingDamage > 0) {
                await sleep(100);
            }
            if(this.activeEnemy.dead) {
                //Calculate won EXP
                let EXPGain = Math.ceil(Math.pow(this.activeEnemy.strength, 2.3) * this.activeMonster.prototype.growth + 20);
                if(this.activeEnemy.owner != "wild") {
                    EXPGain *= 1.5;
                }
                this.activeMonster.gainEXP(EXPGain);
                while(this.activeMonster.outstandingEXP > 0) {
                    await sleep(100);
                }

                //Show EXP-gain dialogue
                let EXP_Message = this.activeMonster.name + " gained " + EXPGain + " experience!";
                await dialogue.load(["timed", EXP_Message])

                this.fight = false;
                dialogue.activeBattleDialogue = false;               
                state = STATE.WORLD;
            } else {
                await sleep(800)
                dialogue.activeBattleDialogue = false;
                this.performEnemyTurn();
            }
        } else {
            if(this.selector == 0) {
                this.fight = true;
            } else if(this.selector == 3) {
                state = STATE.WORLD;
            }
        }
    }

    inputB() {
        if(this.fight) {
            this.fight = false;
            this.selector = 0;
        }
    }

    drawSelector(x,y) {
        push();
        noStroke();
        fill(255);
        triangle(x, y, x + 10, y + 10, x, y + 20);
        pop();
    }

    async performEnemyTurn() {
        let move;
        if(this.activeEnemy.owner == "wild") {
            //Select random move from wild monsters moveset
            move = (this.activeEnemy.moveSet[Math.floor(Math.random()*this.activeEnemy.moveSet.length)]);
            this.activeEnemy.attackMove(move, this.activeMonster);
        }

        //Setup message to display while move is carried out.
        let message = "Enemy " + this.activeEnemy.name + " used " + move.name + "!";
        dialogue.load(["battle", message]);

        while(this.activeMonster.outstandingDamage > 0) {
            await sleep(100);
        }

        await sleep(800);
        dialogue.activeBattleDialogue = false;
        this.playerTurn = true;
    }
}