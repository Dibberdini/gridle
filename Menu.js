class Menu {
    constructor() {
        this.w = 200
        this.x = width - this.w;
        this.y = 50;
        this.margin = 37;
        this.index = 0;
        this.lastIndex = 0;
        this.menuState = MENU_STATES.MAIN_MENU;
        this.lastState = STATE.WORLD;
        this.selected = false;
        this.switching = false;
        this.offset = 0;
        this.loadedItem = null;
        this.loadedMonster = null;
        this.withdrawing = false;
        this.depositing = false;

        this.mainMenuSelections = [
            "Bojstiary",
            "Monsters",
            "Items",
            "Settings",
            "Save",
            "Cancel"
        ];
        this.monsterMenuSelections = [
            "Stats",
            "Switch",
            "Cancel"
        ];
        this.itemMenuSelections = [
            "Use",
            "Toss",
            "Cancel"
        ]
    }

    draw() {
        push();
        switch (this.menuState) {
            case MENU_STATES.MAIN_MENU:
                this.drawMainMenu();
                break;
            case MENU_STATES.ITEM_MENU:
                this.drawMainMenu();
                this.drawItemMenu();
                break;
            case MENU_STATES.SETTINGS_MENU:
                this.drawSettingsMenu();
                break;
            case MENU_STATES.MONSTER_MENU:
                this.drawMonsterMenu();
                break;
            case MENU_STATES.STATS_MENU:
                this.drawStatsMenu();
                break;
            case MENU_STATES.BANK_MENU:
                this.drawBankMenu();
                break;
            default:
                break;
        }
        this.drawCursor();
        pop();
    }

    drawSelector(x, y, brightness) {
        noStroke();
        fill(brightness);
        triangle(x, y, x + 10, y + 10, x, y + 20);
    }

    drawMainMenu() {
        stroke(100);
        strokeWeight(3);
        fill(50);
        rect(this.x, this.y, this.w, (this.mainMenuSelections.length + 0.5) * 37);
        noStroke();
        fill(255);
        textSize(24);

        for (let i = 0; i < this.mainMenuSelections.length; i++) {
            text(this.mainMenuSelections[i], this.x + this.margin, this.y + 17 + this.margin * (i + 1));
        }
    }

    drawSettingsMenu() {
        background(230);
        stroke(0);
        fill(80);
        rect(20, 20, width - 40, 150);
        rect(40, height - 90, 125, 60);
        fill(230);
        textSize(20);
        text("Text Speed", 220, 60);
        textSize(30);
        text("SLOW", 70, 120);
        text("NORMAL", 230, 120);
        text("FAST", 430, 120);

        text("EXIT", 70, height - 30);
    }

    drawItemMenu() {
        fill(50);
        stroke(100);
        rect(this.x - 70, this.y + 70, this.w + 69, 250);
        noStroke();
        fill(255);
        textSize(24);
        for (let i = 0; i < 5; i++) {
            if (player.inventory[i + this.offset]) {
                text(player.inventory[i + this.offset].name, this.x - 30, this.y + 125 + 45 * i);
                textAlign(RIGHT);
                text(player.inventory[i + this.offset].count, this.x + 180, this.y + 125 + 45 * i)
                textAlign(LEFT);
            }
        }
        if (this.selected) {
            fill(100);

            rect(width - 150, height - (40 * this.itemMenuSelections.length), 150, 40 * this.itemMenuSelections.length);
            for (let i = 0; i < this.itemMenuSelections.length; i++) {
                noStroke();
                fill(255);
                textSize(26);
                text(this.itemMenuSelections[i], width - 120, height + 50 - (40 * this.itemMenuSelections.length) + i * 35);

            }
        }
    }

    drawMonsterMenu() {
        background(230);
        let padding = 30
        let lineHeight = 60;
        let inset = 80;
        let inset2 = 125;
        let healthLength = 200;
        for (let i = 0; i < player.monsters.length; i++) {
            textSize(18)
            noStroke();
            fill(0);
            let monster = player.monsters[i]
            //Monster stats
            text(monster.name, inset, (i * lineHeight) + padding);
            text("Lvl: " + monster.level, 400, (i * lineHeight) + padding)
            text(monster.health + "/" + monster.maxHealth, 400, (i * lineHeight) + padding * 2);
            text("HP: ", inset + 5, (i * lineHeight) + padding * 2);
            if(monster.status != STATUSES.NONE) {
                text(monster.status.toUpperCase(), 490,(i * lineHeight) + padding * 2);
            }

            //Health bar
            if (monster.outstandingHealing > 0) {
                monster.outstandingHealing--;
                monster.health++;
                if (monster.health > monster.maxHealth) {
                    monster.health = monster.maxHealth;
                    monster.outstandingHealing = 0;
                }
            }

            fill(255, 0, 0);
            let percentageHealth = monster.health / monster.maxHealth * healthLength
            rect(inset2, (i * lineHeight) + padding * 1.5, percentageHealth, 20);
            stroke(0);
            strokeWeight(2);
            line(inset2, (i * lineHeight) + padding * 1.5 + 5, inset2, (i * lineHeight) + padding * 1.5 + 20);
            line(inset + 45, (i * lineHeight) + padding * 1.5 + 20, inset2 + healthLength, (i * lineHeight) + padding * 1.5 + 20);
            line(inset2 + healthLength, (i * lineHeight) + padding * 1.5 + 20, inset2 + healthLength, (i * lineHeight) + padding * 1.5 + 5);
        }
        //If selected draw monster options
        if (this.selected) {
            fill(100);
            rect(width - 150, height - 120, 150, 120);
            for (let i = 0; i < this.monsterMenuSelections.length; i++) {
                noStroke();
                fill(255);
                textSize(26);
                text(this.monsterMenuSelections[i], width - 120, height - 70 + i * 35);
            }
        }
    }

    drawStatsMenu() {
        push();
        let monster = this.loadedMonster;
        background(230);
        textSize(26);
        let lineHeight = 35
        text(`${monster.name}   //   ${monster.species}`, 20, 40);
        text(`Attack: ${monster.attack}`, 30, 10 + lineHeight * 2);
        text(`Defence: ${monster.defence}`, 30, 10 + lineHeight * 3);
        text(`Speed: ${monster.speed}`, 30, 10 + lineHeight * 4);
        text(`Special: ${monster.special}`, 30, 10 + lineHeight * 5);
        text(`Health: ${monster.health}/${monster.maxHealth}`, 30, 10 + lineHeight * 6);

        text(`Moves`, 300, 400);
        for (let i = 0; i < monster.moveSet.length; i++) {
            text(`${monster.moveSet[i].name}`, 320, 400 + (i + 1) * lineHeight);
        }

        text(`Type`, 20, 400);
        if (monster.type[0]) {
            text(`${monster.type[0]}`, 30, 400 + lineHeight);
        }
        if (monster.type[1]) {
            text(`${monster.type[1]}`, 100, 400 + lineHeight);
        }

        monster.drawModel(width - 250, 40);

        pop();
    }

    drawBankMenu() {
        push();
        textSize(24);
        background(230);
        let monsters = [];
        if (this.withdrawing) {
            monsters = player.bank;
        } else if (this.depositing) {
            monsters = player.monsters;
        }

        if (monsters.length > 0) {
            for (let i = 0; i < 8; i++) {
                if (monsters[i + this.offset]) {
                    text(`LVL: ${monsters[i + this.offset].level}  |  ${monsters[i + this.offset].name}`, 80, 100 + i * 40);
                }
            }
            if (this.offset > 0) {
                triangle(40, 40, 45, 35, 50, 40);
            }
            if (monsters.length > this.offset + 8) {
                triangle(40, 400, 45, 405, 50, 400);
            }
        } else {
            text("Withdraw", 250, 300);
            text("Deposit", 250, 350);
            text("Cancel", 250, 400);
        }
        pop();
    }

    drawCursor() {
        switch (this.menuState) {
            case MENU_STATES.MAIN_MENU:
                this.drawSelector(this.x + 16, (this.y + 20) + (this.margin * this.index), 255);
                break;
            case MENU_STATES.ITEM_MENU:
                if (this.selected) {
                    this.drawSelector(width - 140, height - (35 * this.itemMenuSelections.length) + this.index * 35, 200);
                    // this.drawSelector(this.x - 45, this.y + 90 + 45 * (this.lastIndex - this.offset), 255);
                } else {
                    this.drawSelector(this.x - 45, this.y + 90 + 45 * (this.index - this.offset), 255);
                }
                break;
            case MENU_STATES.MONSTER_MENU:
                if (this.selected) {
                    this.drawSelector(width - 140, height - 105 + this.index * 35, 200);
                } else {
                    this.drawSelector(50, 30 + this.index * 30 * 2, 30);
                }
                if (this.switching) {
                    this.drawSelector(50, 30 + this.lastIndex * 30 * 2, 140)
                }
                break;
            case MENU_STATES.SETTINGS_MENU:
                let opacity = 140;
                this.index == 0 ? opacity = 255 : opacity = 140;
                switch (settings.textSpeed) {
                    case TEXT_SPEED.SLOW:
                        this.drawSelector(53, 78, opacity);
                        break;
                    case TEXT_SPEED.NORMAL:
                        this.drawSelector(213, 78, opacity);
                        break;
                    case TEXT_SPEED.FAST:
                        this.drawSelector(413, 78, opacity);
                        break;
                    default:
                        break;
                }
                this.index == 1 ? opacity = 255 : opacity = 140;
                this.drawSelector(53, height - 72, opacity);
                break;
            case MENU_STATES.BANK_MENU:
                if (this.withdrawing || this.depositing) {
                    this.drawSelector(55, 65 + (this.index - this.offset) * 40, 0);
                } else {
                    this.drawSelector(230, 264 + this.index * 51, 0);
                }
                break;
            default:
                break;
        }
    }

    indexUp() {
        if (this.menuState == MENU_STATES.MAIN_MENU && this.index != 0) {
            this.index--;
        } else if (this.menuState == MENU_STATES.MONSTER_MENU && this.index != 0) {
            this.index--;
        } else if (this.menuState == MENU_STATES.ITEM_MENU && this.index != 0) {
            this.index--;
            if (this.index == this.offset - 1 && !this.selected) {
                this.offset--;
            }
        } else if (this.menuState == MENU_STATES.SETTINGS_MENU && this.index != 0) {
            this.index--;
        } else if (this.menuState == MENU_STATES.BANK_MENU && this.index != 0) {
            this.index--;
            if (this.index == this.offset - 1) {
                this.offset--;
            }
        }
    }

    indexDown() {
        if (this.menuState == MENU_STATES.MAIN_MENU && this.index != this.mainMenuSelections.length - 1) {
            this.index++;
        } else if (this.menuState == MENU_STATES.MONSTER_MENU) {
            if (this.selected && this.index != this.monsterMenuSelections.length - 1) {
                this.index++;
            } else if (!this.selected && this.index != player.monsters.length - 1) {
                this.index++;
            }
        } else if (this.menuState == MENU_STATES.ITEM_MENU) {
            if (this.selected && this.index < this.itemMenuSelections.length - 1) {
                this.index++;
            } else if (!this.selected && this.index < player.inventory.length - 1) {
                this.index++;
                if (this.index == this.offset + 5) {
                    this.offset++;
                }
            }
        } else if (this.menuState == MENU_STATES.SETTINGS_MENU && this.index != 1) {
            this.index++;
        } else if (this.menuState == MENU_STATES.BANK_MENU) {
            if (this.withdrawing && this.index < player.bank.length - 1) {
                this.index++;
                if (this.index == this.offset + 8) {
                    this.offset++;
                }
            } else if (this.depositing && this.index < player.monsters.length - 1) {
                this.index++;
                if (this.index == this.offset + 8) {
                    this.offset++;
                }
            } else if (!this.withdrawing && !this.depositing && this.index < 2) {
                this.index++;
            }
        }
    }

    indexLeft() {
        if (this.menuState == MENU_STATES.SETTINGS_MENU) {
            switch (this.index) {
                case 0:
                    switch (settings.textSpeed) {
                        case TEXT_SPEED.NORMAL:
                            settings.textSpeed = TEXT_SPEED.SLOW;
                            break;
                        case TEXT_SPEED.FAST:
                            settings.textSpeed = TEXT_SPEED.NORMAL;
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
    }

    indexRight() {
        if (this.menuState == MENU_STATES.SETTINGS_MENU) {
            switch (this.index) {
                case 0:
                    switch (settings.textSpeed) {
                        case TEXT_SPEED.SLOW:
                            settings.textSpeed = TEXT_SPEED.NORMAL;
                            break;
                        case TEXT_SPEED.NORMAL:
                            settings.textSpeed = TEXT_SPEED.FAST;
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
    }

    openMenu() {
        this.lastState = state;
        state = STATE.PAUSED;
    }

    inputB() {
        if (this.menuState == MENU_STATES.MAIN_MENU) {
            state = STATE.WORLD;
        } else if (this.menuState == MENU_STATES.ITEM_MENU) {
            if (this.selected) {
                this.index = this.lastIndex;
                this.selected = false;
            } else {
                this.index = 2;
                this.offset = 0;
                this.menuState = MENU_STATES.MAIN_MENU;
            }
        } else if (this.menuState == MENU_STATES.SETTINGS_MENU) {
            this.index = 3;
            this.menuState = MENU_STATES.MAIN_MENU;
        } else if (this.menuState == MENU_STATES.MONSTER_MENU) {
            if (this.selected) {
                this.selected = false;
                this.index = this.lastIndex;
            } else if (this.switching) {
                this.switching = false;
                this.index = this.lastIndex;
            } else if (this.lastState == STATE.BATTLE) {
                this.menuState = MENU_STATES.MAIN_MENU;
                this.index = 0;
                battle.selectingItem = false;
                state = this.lastState
            } else if (this.loadedItem) {
                this.loadedItem = null;
                this.menuState = MENU_STATES.ITEM_MENU
                this.index = this.lastIndex;
            } else {
                this.menuState = MENU_STATES.MAIN_MENU;
                this.index = 1;
            }
        } else if (this.menuState == MENU_STATES.STATS_MENU) {
            this.loadedMonster = null;
            this.menuState = MENU_STATES.MONSTER_MENU;
        } else if (this.menuState == MENU_STATES.BANK_MENU) {
            if (this.withdrawing) {
                this.withdrawing = false;
                this.offset = 0;
            } else if (this.depositing) {
                this.depositing = false;
                this.offset = 0;
            } else {
                this.index = this.lastIndex;
                this.menuState = MENU_STATES.MAIN_MENU;
                state = STATE.WORLD;
            }
        }
    }

    async inputA() {
        if (this.menuState == MENU_STATES.MAIN_MENU) {
            if (this.index == 1) {
                this.menuState = MENU_STATES.MONSTER_MENU;
                this.lastIndex = this.index;
                this.index = 0;
            } else if (this.index == 2) {
                this.menuState = MENU_STATES.ITEM_MENU;
                this.index = 0;
            } else if (this.index == 3) {
                this.menuState = MENU_STATES.SETTINGS_MENU;
                this.index = 0;
            } else if (this.index == 4) {
                saveWorld();
                if (getItem("save")) {
                    let continueSave = await dialogue.ask("This will overwrite current save. Continue?")
                    if (continueSave == "No") {
                        state = this.lastState;
                        return;
                    }
                }
                writeSave();
                state = this.lastState;
                dialogue.load([{ type: "statement", line: "Game succesfully saved" }]);
            } else if (this.index == 5) {
                state = this.lastState;
            }
        } else if (this.menuState == MENU_STATES.ITEM_MENU) {
            if (this.selected) {
                let selectedItem = player.inventory[this.lastIndex + this.offset];
                switch (this.itemMenuSelections[this.index]) {
                    case "Use":
                        let useCase = Item.getItemInfo(selectedItem.type);
                        if (state == STATE.BATTLE && useCase.hasBattleUse) {
                            await Item.useItem(selectedItem.type, this.lastIndex + this.offset);
                        } else if (useCase.hasWorldUse) {
                            await Item.useItem(selectedItem.type, this.lastIndex + this.offset);
                        } else {
                            await dialogue.load([{ type: "statement", line: "You can't use that here!" }]);
                        }
                        break;
                    case "Toss":
                        player.removeItem(this.lastIndex + this.offset);
                    default:
                        break;
                }
                this.selected = false;
                if (this.menuState == MENU_STATES.ITEM_MENU) {
                    this.index = this.lastIndex;
                }
            } else {
                let itemType = player.inventory[this.index + this.offset].type;
                if (itemType == "cancel") {
                    this.index = 2;
                    this.offset = 0;
                    this.menuState = MENU_STATES.MAIN_MENU;
                } else {
                    if (Item.getItemInfo(itemType).hasWorldUse) {
                        this.itemMenuSelections = ["Use", "Toss", "Cancel"];
                    }
                    this.selected = true;
                    this.lastIndex = this.index;
                    this.index = 0;
                }
            }
        } else if (this.menuState == MENU_STATES.MONSTER_MENU) {
            if (this.selected) {
                if (this.index == 0) {
                    this.loadedMonster = player.monsters[this.lastIndex];
                    this.menuState = MENU_STATES.STATS_MENU;
                } else if (this.index == 1) {
                    if (this.lastState == STATE.BATTLE) {
                        if(player.monsters[this.lastIndex] != battle.activeMonster) {
                            this.selected = false;
                            this.index = 0;
                            battle.draw();
                            state = this.lastState;
                            battle.changeMonster(player.monsters[this.lastIndex], false);
                        } else {
                            this.selected = false;
                            this.index = 0;
                            state = this.lastState
                            await dialogue.load([{type: "timed", line: `${battle.activeMonster.name} is already out!`, time: 800}]);
                        }
                    } else {
                        this.switching = true;
                        this.selected = false;
                        this.index = 0;
                    }
                } else if (this.index == 2) {
                    this.index = this.lastIndex;
                    this.selected = false;
                }
            } else if (this.switching) {
                let temp = player.monsters[this.lastIndex];
                player.monsters[this.lastIndex] = player.monsters[this.index];
                player.monsters[this.index] = temp;
                this.index = this.lastIndex;
                this.switching = false;
            } else if (this.loadedItem) {
                let selectedMonster = player.monsters[this.index];
                if (this.loadedItem.heal) {
                    if (selectedMonster.health < selectedMonster.maxHealth) {
                        selectedMonster.heal(this.loadedItem.heal);
                        while (selectedMonster.outstandingHealing > 0) {
                            await sleep(10);
                        }
                        await sleep(500);
                        state = this.lastState;
                        battle.selectingItem = false;
                        player.removeItem(this.lastIndex + this.offset);
                    } else {
                        await dialogue.load([{ type: "statement", line: `${selectedMonster.name} is already at full health.` }]);
                    }
                }
                this.loadedItem = null;
                this.menuState = MENU_STATES.ITEM_MENU;
                this.index = this.lastIndex;
            } else {
                this.lastIndex = this.index;
                this.index = 0;
                this.selected = true;
            }
        } else if (this.menuState == MENU_STATES.SETTINGS_MENU && this.index == 1) {
            this.index = 3;
            this.menuState = MENU_STATES.MAIN_MENU;
        } else if (this.menuState == MENU_STATES.BANK_MENU) {
            if (this.withdrawing) {
                if (player.monsters.length < 6) {
                    let monster = player.bank.splice(this.index, 1)[0];
                    player.monsters.push(monster);
                    await dialogue.load([{ type: "statement", line: `${monster.name} was withdrawn.` }]);
                } else {
                    await dialogue.load([{ type: "statement", line: "Cannot have a team of more than 6 monsters!" }]);
                }
                this.withdrawing = false;
                this.index = 0;
                this.offset = 0;
            } else if (this.depositing) {
                if (player.monsters.length > 1) {
                    let monster = player.monsters.splice(this.index, 1)[0];
                    player.bank.push(monster);
                    await dialogue.load([{ type: "statement", line: `${monster.name} was deposited.` }]);
                } else {
                    await dialogue.load([{ type: "statement", line: "Must have at least one monster!" }]);
                }
                this.depositing = false;
                this.index = 0;
                this.offset = 0;
            } else {
                if (this.index == 0) {
                    if (player.bank.length > 0) {
                        this.index = 0;
                        this.withdrawing = true;
                    } else {
                        await dialogue.load([{ type: "statement", line: "Bank is empty!" }]);
                    }
                } else if (this.index == 1) {
                    this.index = 0;
                    this.depositing = true;
                } else if (this.index == 2) {
                    this.menuState = MENU_STATES.MAIN_MENU;
                    this.index = this.lastIndex;
                    this.state = STATE.WORLD;
                }
            }
        }
    }
}