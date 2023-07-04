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
        this.participatingMonsters = [];
        this.selectingItem = false;
    }

    encounter(monsterList, level) {
        //Pick a random monster from the zone list
        var monster = new Monster(monsterList[Math.floor(Math.random() * monsterList.length)]);
        //Set the monster to an appropriate strength-level
        monster.setLevel(level);

        this.startBattle([monster]);
    }

    trainerBattle(trainerInfo) {
        this.startBattle(trainerInfo.monsters);
    }

    async startBattle(monsters) {
        this.participatingMonsters = [];
        this.selector = 0;
        this.activeEnemy = monsters[0];
        //Set player monster to first conscious monster
        for (let i = 0; i < player.monsters.length; i++) {
            if (!player.monsters[i].dead) {
                this.activeMonster = player.monsters[i];
                this.participatingMonsters.push(this.activeMonster);
                break;
            }
        }

        this.calculateEnemyMove();
        this.playerTurn = true;
        await AnimationManager.beginBattle();
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

        //Draw selector either at current move or menu choice
        if (this.fight) {
            this.drawSelector(this.fightSelections[this.selector][1] - 12, this.fightSelections[this.selector][2] - 35);
        } else {
            this.drawSelector(this.selections[this.selector][1] - 12, this.selections[this.selector][2] - 35)
        }

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
        } else if (this.selectingItem) {
            menu.drawItemMenu();
            menu.drawCursor();
        }
        pop();

    }

    updateSelector(dir) {
        let newSelection = this.selector + dir;
        newSelection = constrain(newSelection, 0, 3);

        //If in fight-mode check if there is a move here
        if (this.fight) {
            if (this.activeMonster.moveSet[newSelection]) {
                this.selector = newSelection;
                return;
            }
            else {
                return;
            }
        } else if (this.selectingItem) {
            if (dir == 2) {
                menu.indexDown();
            } else if (dir == -2) {
                menu.indexUp();
            }
            return;
        }

        this.selector = newSelection;
    }

    async inputA() {
        if (this.fight && this.playerTurn) {
            let move = this.activeMonster.moveSet[this.selector];
            this.activeMonster.loadedMove = move;
            this.activeMonster.loadedTarget = this.activeEnemy;
            this.performTurn();
        } else if (this.selectingItem) {
            if (Item.getItemInfo(player.inventory[menu.index + menu.offset].type).hasBattleUse) {
                await menu.inputA();
                await menu.inputA();
                //Check that item didn't kill or catch enemy.
                if (this.activeEnemy.dead == false && this.activeEnemy.owner != player.id) {
                    console.log("lesgo");
                    console.log(this.activeEnemy.owner);
                    this.performTurn();
                }
            } else {
                await dialogue.load([{ type: "timed", line: "You can't use that here!", time: 800 }]);
            }
        } else {
            if (this.selector == 0) {
                this.fight = true;
            } else if (this.selector == 1) {
                this.selectingItem = true;
                menu.menuState = MENU_STATES.ITEM_MENU;
                menu.index = 0;
                menu.offset = 0;
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
        } else if (this.selectingItem) {
            this.selectingItem = false;
            menu.menuState = MENU_STATES.MAIN_MENU;
            menu.index = 0;
            menu.offset = 0;
        }
    }

    drawSelector(x, y) {
        push();
        noStroke();
        fill(255);
        triangle(x, y, x + 10, y + 10, x, y + 20);
        pop();
    }

    async changeMonster(newMonster, freeChange) {
        this.activeMonster = newMonster;
        this.activeEnemy.loadedTarget = this.activeMonster;
        if (this.participatingMonsters.includes(this.activeMonster)) {
            //Don't add monster to list of fighting monsters twice
        } else {
            this.participatingMonsters.push(this.activeMonster)
        }
        this.activeMonster.loadedMove = null;
        await dialogue.load([{ type: "timed", line: `${newMonster.name}, you're up!`, time: 1000 }])
        if (freeChange) {
            return;
        }
        this.performTurn();
    }

    async rewardEXP() {
        //Calculate won EXP
        let EXPGain = Math.ceil((this.activeEnemy.prototype.yield * this.activeEnemy.level / 7));
        if (this.activeEnemy.owner != "wild") {
            EXPGain *= 1.5;
        }
        EXPGain = Math.ceil(EXPGain / this.participatingMonsters.length);

        //Award EXP to each participating monster
        for (let i = 0; i < this.participatingMonsters.length; i++) {
            let monster = this.participatingMonsters[i];
            //Show EXP-gain dialogue
            let EXP_Message = monster.name + " gained " + EXPGain + " experience!";
            await dialogue.load([{ type: "timed", line: EXP_Message, time: 500 }]);

            if (Object.is(this.activeMonster, monster)) {
                monster.gainEXP(EXPGain);
                while (monster.outstandingEXP > 0) {
                    await sleep(5);
                    if (monster.checkLevelUp()) {
                        await monster.levelUp();
                    }
                }
                await sleep(500);
            } else {
                monster.experience += (EXPGain)
                monster.gainEV(this.activeEnemy);
                if (monster.checkLevelUp()) {
                    await monster.levelUp();
                }

            }
        }

    }

    async calculateEnemyMove() {
        let move;
        if (this.activeEnemy.owner == "wild") {
            //Select random move from wild monsters moveset
            move = (this.activeEnemy.moveSet[Math.floor(Math.random() * this.activeEnemy.moveSet.length)]);
            this.activeEnemy.loadedMove = move;
            this.activeEnemy.loadedTarget = this.activeMonster;
        }
    }

    async performTurn() {
        this.playerTurn = false;
        //Calculate turnorder based on combat participants' speed
        let turnOrder = [];
        if (this.activeEnemy.speed > this.activeMonster) {
            turnOrder.push(this.activeEnemy);
            turnOrder.push(this.activeMonster);
        } else {
            turnOrder.push(this.activeMonster);
            turnOrder.push(this.activeEnemy);
        }

        //For each monster in turnOrder perform their loaded moves, if they're alive.
        for (let i = 0; i < turnOrder.length; i++) {
            let monster = turnOrder[i];
            if (monster.loadedMove && !monster.dead) {
                let move = monster.attackMove(monster.loadedMove, monster.loadedTarget);

                //Setup message to display while move is carried out.
                let message = monster.name + " used " + monster.loadedMove.name + "!";
                if (monster.owner != player.id) {
                    message = "Enemy " + message;
                }
                dialogue.load([{ type: "battle", line: message }]);

                //Wait until animation is finished, then check if opponent died.
                while (monster.loadedTarget.outstandingDamage > 0 || dialogue.step < dialogue.currentLine.line.length) {
                    await sleep(50);
                }
                await sleep(400)
                if (move.crit) {
                    await dialogue.load([{ type: "timed", line: "It's a critical hit!", time: 800 }]);
                }
                if (move.effectiveness) {
                    if (move.effectiveness == 0.5) {
                        await dialogue.load([{ type: "timed", line: "It's not very effective...", time: 800 }]);
                    } else if (move.effectiveness == 2) {
                        await dialogue.load([{ type: "timed", line: "It's super effective!", time: 800 }]);
                    }
                }
            }
        }

        //If player's monster died -
        if (this.activeMonster.dead) {
            await dialogue.load([{ type: "timed", line: `${this.activeMonster.name}` + " fainted!", time: 1000 }])
            for (let i = 0; i < player.monsters.length; i++) {
                //- Find the next living monster, otherwise end battle.
                if (player.monsters[i] && !player.monsters[i].dead) {
                    this.changeMonster(player.monsters[i], true);
                    this.fight = false;
                    this.selector = 0;
                    await dialogue.load([{ type: "timed", line: `${this.activeMonster.name}` + " you're up!", time: 1000 }])
                    this.playerTurn = true;
                    break;
                } else if (i == player.monsters.length - 1) {
                    await dialogue.load([{ type: "timed", line: "You've run out of monsters!", time: 1000 }]);
                    this.returnToWorld()
                    resuscitate();
                }
            }
        } else if (this.activeEnemy.dead) {
            if (this.activeEnemy.owner == "wild") {
                await this.rewardEXP();
                this.returnToWorld();
            }
        } else {
            this.calculateEnemyMove();
            this.activeMonster.loadedMove = null;
            this.activeMonster.loadedTarget = null;
            this.playerTurn = true;
        }
    }

    async caughtMonster() {
        await dialogue.load([{ type: "timed", line: `Success! ${this.activeEnemy.name} was caught!`, time: 1000 }]);
        await player.addMonster(this.activeEnemy);
        this.returnToWorld();
    }

    returnToWorld() {
        this.fight = false;
        this.activeMonster.loadedMove = null;
        this.activeMonster.loadedTarget = null;
        this.activeEnemy.loadedMove = false;
        this.activeEnemy.loadedTarget = false;
        state = STATE.WORLD;
    }
}