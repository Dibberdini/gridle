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
        ]
    }

    draw() {
        push();

        if (this.menuState == MENU_STATES.MAIN_MENU || this.menuState == MENU_STATES.ITEM_MENU) {
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

            if (this.menuState == MENU_STATES.ITEM_MENU) {
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
                    this.drawSelector(this.x - 45, this.y + 90 + 45 * (this.index - this.offset), 255);
                }

            } else {
                this.drawSelector(this.x + 16, (this.y + 20) + (this.margin * this.index), 255)
            }
        } else if (this.menuState == MENU_STATES.MONSTER_MENU) {
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
                text("Lvl: " + monster.strength, 400, (i * lineHeight) + padding)
                text(monster.health + "/" + monster.maxHealth, 400, (i * lineHeight) + padding * 2);
                text("HP: ", inset + 5, (i * lineHeight) + padding * 2);

                //Health bar
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

                this.drawSelector(width - 140, height - 105 + this.index * 35, 200);
            } else {
                this.drawSelector(50, 30 + this.index * padding * 2, 30);
            }
            if (this.switching) {
                this.drawSelector(50, 30 + this.lastIndex * padding * 2, 140)
            }
        }


        pop();
    }

    drawSelector(x, y, brightness) {
        noStroke();
        fill(brightness);
        triangle(x, y, x + 10, y + 10, x, y + 20);
    }

    indexUp() {
        if (this.menuState == MENU_STATES.MAIN_MENU && this.index != 0) {
            this.index--;
        } else if (this.menuState == MENU_STATES.MONSTER_MENU && this.index != 0) {
            this.index--;
        } else if (this.menuState == MENU_STATES.ITEM_MENU && this.index != 0) {
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
        } else if (this.menuState == MENU_STATES.ITEM_MENU && this.index < player.inventory.length - 1) {
            this.index++;
            if (this.index == this.offset + 5) {
                this.offset++;
            }
        }
    }

    openMenu() {
        this.lastState = state;
        state = STATE.PAUSED;
    }

    inputB() {
        if (this.menuState == MENU_STATES.MAIN_MENU) {
            state = this.lastState;
        } else if (this.menuState == MENU_STATES.ITEM_MENU) {
            this.index = 2;
            this.offset = 0;
            this.menuState = MENU_STATES.MAIN_MENU;
        } else if (this.menuState == MENU_STATES.MONSTER_MENU) {
            if (this.selected) {
                this.selected = false;
                this.index = this.lastIndex;
            } else if (this.switching) {
                this.switching = false;
                this.index = this.lastIndex;
            } else {
                if (this.lastState == STATE.BATTLE) {
                    this.menuState = MENU_STATES.MAIN_MENU;
                    this.index = 0;
                    state = this.lastState
                } else {
                    this.menuState = MENU_STATES.MAIN_MENU;
                    this.index = 1;
                }
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
            } else if (this.index == 4) {
                saveWorld();
                state = this.lastState;
                dialogue.load([{ type: "statement", line: "Game succesfully saved" }]);
            } else if (this.index == 5) {
                state = this.lastState;
            }
        } else if (this.menuState == MENU_STATES.ITEM_MENU) {
            if (player.inventory[this.index + this.offset].type == "cancel") {
                this.index = 2;
                this.offset = 0;
                this.menuState = MENU_STATES.MAIN_MENU;
            }
        } else if (this.menuState == MENU_STATES.MONSTER_MENU) {
            if (this.selected) {
                if (this.index == 0) {
                    console.log(player.monsters[this.lastIndex]);
                } else if (this.index == 1) {
                    if (this.lastState == STATE.BATTLE) {
                        this.selected = false;
                        this.index = 0;
                        await dialogue.load([{ type: "timed", line: `${player.monsters[this.lastIndex].name}, you're up!`, time: 1000 }])
                        state = this.lastState;
                        battle.changeMonster(player.monsters[this.lastIndex], false);
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
            } else {
                this.lastIndex = this.index;
                this.index = 0;
                this.selected = true;
            }
        }
    }
}