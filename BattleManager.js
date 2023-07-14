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
            ["Scramble", 50, 450],
            ["Scramble", 200, 450],
            ["Scramble", 50, 500],
            ["Scramble", 200, 500]
        ]
        this.selector = 0;
        this.fight = false;
        this.playerTurn = true;
        this.participatingMonsters = [];
        this.selectingItem = false;
        this.fleeAttempts = 0;
        this.enemyTrainer = null;
    }

    encounter(monsterList, zoneStrength) {
        //Pick a random monster from the zone list
        var monster = new Monster(monsterList[Math.floor(Math.random() * monsterList.length)]);
        //Set the monster to an appropriate strength-level
        let level = map(Math.random(), 0, 1, zoneStrength.min, zoneStrength.max);
        level = Math.round(level);
        monster.setLevel(level);

        this.startBattle([monster]);
    }

    trainerBattle(trainer) {
        this.enemyTrainer = trainer;
        this.startBattle(trainer.monsters);
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
        playSound(sounds.battle[Math.floor(Math.random() * sounds.battle.length)]);
        state = STATE.BATTLE;
        this.draw();
        if (this.activeEnemy.owner == "wild") {
            await dialogue.load([{ type: "statement", line: `A wild ${this.activeEnemy.name} appears!`, time: 1000 }]);
        } else {
            push();
            noStroke();
            fill(255);
            rect(0, 0, width, 220);
            rect(300, 0, width-300, 280);
            pop();
            await dialogue.load([{type: "statement", line: `Trainer ${this.enemyTrainer.name} challenges you!`, time: 1000}]);
            await dialogue.load([{type: "statement", line: `${this.enemyTrainer.name} sent out ${this.activeEnemy.name}.`, time: 1000}])
        }
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
            this.drawSelector(this.fightSelections[this.selector][1] - 12, this.fightSelections[this.selector][2] - 28);
        } else {
            this.drawSelector(this.selections[this.selector][1] - 12, this.selections[this.selector][2] - 35)
        }

        //If fight has been selected draw the attack-moves
        if (this.fight) {
            textSize(18);
            for (let i = 0; i < this.selections.length; i++) {
                if (this.activeMonster.moveSet[i]) {
                    text(
                        this.activeMonster.moveSet[i].name,
                        this.fightSelections[i][1],
                        this.fightSelections[i][2],
                        150,
                        80);
                }
            }
            textSize(22);
            let selectedMove = this.activeMonster.moveSet[this.selector]
            fill(180);
            rect(width - 240, height - 140, 238.5, 138.5);
            fill(0);
            text(`TYPE: ${selectedMove.type}`, 380, 470);
            text(`PP: ${selectedMove.pp}/${selectedMove.maxPP}`, 380, 500);
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
            if (move.pp > 0) {
                this.activeMonster.loadedMove = move;
                this.activeMonster.loadedTarget = this.activeEnemy;
                this.fleeAttempts = 0;
                move.pp--;
                this.performTurn();
            } else {
                await dialogue.load([{ type: "timed", line: "No more PP!", time: 1000 }]);
                if(this.hasNoMoves(this.activeMonster)) {
                    //TODO: Load a default move
                    this.fleeAttempts = 0;
                    this.performTurn();
                }
            }
        } else if (this.selectingItem) {
            if (Item.getItemInfo(player.inventory[menu.index + menu.offset].type).hasBattleUse) {
                await menu.inputA();
                await menu.inputA();
                this.activeMonster.loadedMove = null;
                this.activeMonster.loadedTarget = null;
                //Check that item didn't kill or catch enemy.
                if (this.activeEnemy.dead == false && this.activeEnemy.owner != player.id) {
                    this.performTurn();
                }
            } else {
                await dialogue.load([{ type: "timed", line: "You can't use that here!", time: 1000 }]);
            }
        } else if (this.playerTurn) {
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
                this.flee();
            }
        }
    }

    hasNoMoves(monster) {
        for(let i = 0; i < monster.moveSet.length; i++) {
            if(monster.moveSet[i].pp > 0) {
                return false;
            }
        }
        return true;
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
        //Calculate won EXP based on slain monster and number of participating monsters
        let EXPGain = (this.activeEnemy.prototype.yield * this.activeEnemy.level / 7);
        let expShare = 0;
        this.participatingMonsters.forEach(monster => {
            if (!monster.dead) {
                expShare++;
            }
        });
        EXPGain = EXPGain / expShare;

        //OPTIONAL: random modifier. Exclude if unbalanced.
        let random = map(Math.random(), 0, 1, 217, 255) / 255;
        EXPGain = random * EXPGain;

        if (this.activeEnemy.owner != "wild") {
            EXPGain *= 1.5;
        }

        //Award EXP to each participating monster
        EXPGain = Math.ceil(EXPGain);
        for (let i = 0; i < this.participatingMonsters.length; i++) {
            let monster = this.participatingMonsters[i];
            if (!monster.dead) {
                //Show EXP-gain dialogue
                let EXP_Message = monster.name + " gained " + EXPGain + " experience!";
                await dialogue.load([{ type: "timed", line: EXP_Message, time: 500 }]);
            }

            if (Object.is(this.activeMonster, monster)) {
                monster.gainEXP(EXPGain);
                while (monster.outstandingEXP > 0) {
                    await sleep(5);
                    if (monster.checkLevelUp()) {
                        await monster.levelUp();
                    }
                }
                await sleep(500);
            } else if (!monster.dead) {
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
        } else {
            //TODO: Implement proper battle-AI
            move = (this.activeEnemy.moveSet[Math.floor(Math.random() * this.activeEnemy.moveSet.length)]);
            this.activeEnemy.loadedMove = move;
            this.activeEnemy.loadedTarget = this.activeMonster;
        }
    }

    async flee() {
        if(this.activeEnemy.owner != "wild") {
            await dialogue.load([{type:"timed", line: "Cannot run from a trainer battle", time: 1000}])
            this.performTurn();
            return;
        }
        if (this.activeMonster.speed > this.activeEnemy.speed) {
            await dialogue.load([{ type: "timed", line: "Got away safely.", time: 1000 }]);
            this.fleeAttempts = 0;
            this.returnToWorld();
            return;
        }

        let odds = (this.activeMonster.speed * 32) / ((this.activeEnemy.speed / 4) % 256) + 30 * this.fleeAttempts;
        if (odds > 255 || odds > (Math.random() * 255)) {
            await dialogue.load([{ type: "timed", line: "Escape attempt failed!", time: 1000 }]);
            this.performTurn();
        } else {
            await dialogue.load([{ type: "timed", line: "Got away safely.", time: 1000 }]);
            this.fleeAttempts = 0;
            this.returnToWorld();
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
            await this.monsterMove(monster);
        }

        //If player's monster died -
        if (this.activeMonster.dead) {
            await dialogue.load([{ type: "timed", line: `${this.activeMonster.name}` + " fainted!", time: 1000 }])
            //- Find the next living monster, otherwise end battle.
            let nextMonsterIndex = this.hasLivingMonsters(player);
            if (nextMonsterIndex != -1) {
                await this.changeMonster(player.monsters[nextMonsterIndex], true);
                this.fight = false;
                this.selector = 0;
                this.playerTurn = true;
            } else {
                await dialogue.load([{ type: "timed", line: "You've run out of monsters!", time: 1000 }]);
                if(this.activeEnemy.owner != "wild") {
                    this.enemyTrainer.healAllMonsters();
                    this.enemyTrainer.resetPos();
                }
                this.returnToWorld()
                resuscitate();
            }
        } else if (this.activeEnemy.dead) {
            await this.rewardEXP();
            if (this.activeEnemy.owner == "wild") {
                this.returnToWorld();
            } else {
                let nextMonsterIndex = this.hasLivingMonsters(this.enemyTrainer);
                if(nextMonsterIndex != -1) {
                    this.activeEnemy = this.enemyTrainer.monsters[nextMonsterIndex];
                    this.calculateEnemyMove();
                    await dialogue.load([{type: "timed",line: `${this.enemyTrainer.name} sent out ${this.activeEnemy.name}`, time: 1000}]);
                    this.playerTurn = true;
                    this.fight = false;
                    this.selector = 0;
                } else {
                    await dialogue.load([{type: "timed", line: `${this.enemyTrainer.name} was defeated!`, time: 1000}])
                    this.enemyTrainer.questLevel = 100;
                    this.returnToWorld();
                }
            }
        } else {
            this.calculateEnemyMove();
            this.activeMonster.loadedMove = null;
            this.activeMonster.loadedTarget = null;
            this.playerTurn = true;
        }
    }

    async monsterMove(monster) {
        let statusEffect = monster.statusEffect();
        if (statusEffect.paralyzed) {
            await dialogue.load([{ type: "statement", line: `${monster.name} is fully paralyzed!` }]);
            return;
        }
        if (statusEffect.asleep) {
            await dialogue.load([{ type: "statement", line: `${monster.name} is fast asleep.` }]);
            return;
        } else if (statusEffect.awake) {
            await dialogue.load([{ type: "statement", line: `${monster.name} woke up!` }]);
        }
        if (monster.loadedMove && !monster.dead && monster.cooldown == 0) {
            let move = monster.attackMove(monster.loadedMove, monster.loadedTarget);

            //Setup message to display while move is carried out.
            let message = monster.name + " used " + monster.loadedMove.name + "!";
            if (monster.owner != player.id) {
                message = "Enemy " + message;
            }
            dialogue.load([{ type: "battle", line: message }]);

            //Wait until animation is finished.
            while (monster.loadedTarget.outstandingDamage > 0 || dialogue.step < dialogue.currentLine.line.length || monster.outstandingHealing > 0) {
                await sleep(10);
            }
            await sleep(800)
            if (move.missed) {
                await dialogue.load([{ type: "timed", line: `${monster.name} missed!`, time: 1000}]);
            } else if (move.effectiveness && move.effectiveness == 0) {
                await dialogue.load([{ type: "timed", line: "It has no effect...", time: 1000 }]);
            } else {
                if (move.crit) {
                    await dialogue.load([{ type: "timed", line: "It's a critical hit!", time: 1000 }]);
                }
                if (move.effectiveness) {
                    if (move.effectiveness == 0.5) {
                        await dialogue.load([{ type: "timed", line: "It's not very effective...", time: 1000 }]);
                    } else if (move.effectiveness == 2) {
                        await dialogue.load([{ type: "timed", line: "It's super effective!", time: 1000 }]);
                    }
                }
                if(move.status) {
                    await dialogue.load([{type: "timed", line: `${monster.loadedTarget.name} was inflicted with ${move.status.toUpperCase()}`, time: 1000}])
                }
            }
        } else if (monster.cooldown > 0) {
            await dialogue.load([{ type: "timed", line: `${monster.name} is recovering from ${monster.loadedMove.name}`, time: 1000 }]);
            monster.cooldown--;
        }
        if (statusEffect.poisoned) {
            Math.ceil(monster.takeDamage(monster.maxHealth / 16));
            await dialogue.load([{ type: "battle", line: `${monster.name} is poisoned` }])
            //Wait until animation is finished.
            while (monster.loadedTarget.outstandingDamage > 0 || dialogue.step < dialogue.currentLine.line.length || monster.outstandingHealing > 0) {
                await sleep(5);
            }
        } else if (statusEffect.unpoisoned) {
            monster.setStatus(STATUSES.NONE);
            await dialogue.load([{ type: "statement", line: `${monster.name} is no longer poisoned!` }]);
        }
    }

    async caughtMonster() {
        await dialogue.load([{ type: "timed", line: `Success! ${this.activeEnemy.name} was caught!`, time: 1000 }]);
        await player.addMonster(this.activeEnemy);
        this.returnToWorld();
    }

    returnToWorld() {
        player.monsters.forEach(monster => {
            monster.resetBattleStats();
        });
        this.fight = false;
        this.activeMonster.loadedMove = null;
        this.activeMonster.loadedTarget = null;
        this.activeEnemy.loadedMove = false;
        this.activeEnemy.loadedTarget = false;
        this.selector = 0;
        let sound;
        if(isIndoors()) {
            sound = sounds.indoors;
        } else {
            sound = sounds.overworld;
        }
        playSound(sound);
        state = STATE.WORLD;
    }

    hasLivingMonsters(trainer) {
        for (let i = 0; i < trainer.monsters.length; i++) {
            //- Find the next living monster, otherwise end battle.
            if (trainer.monsters[i] && trainer.monsters[i].dead == false) {
                return i;
            } else if (i == trainer.monsters.length - 1) {
                return -1;
            }
        }
    }
}