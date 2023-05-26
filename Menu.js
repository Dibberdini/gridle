class Menu {
    constructor() {
        this.w = 200
        this.h = 400;
        this.x = width - this.w;
        this.y = 50;
        this.margin = 30;
        this.index = 0;
        this.menuState = MENU_STATES.MAIN_MENU;
        this.lastState = STATE.WORLD;
    }

    draw() {
        push();

        if(this.menuState == MENU_STATES.MAIN_MENU) {
            stroke(100);
            strokeWeight(3);
            fill(50);
            rect(this.x, this.y, this.w, this.h);
            noStroke();
            fill(255);
            textSize(24);
            this.drawSelector(this.x + 12, (this.y + 12)+ (this.margin * this.index))
            text("Bestiary", this.x + this.margin, this.y + this.margin * 1);
            text("Monsters", this.x + this.margin, this.y + this.margin * 2);
            text("Settings", this.x + this.margin, this.y + this.margin * 3);
        } else if(this.menuState == MENU_STATES.MONSTER_MENU) {
            background(230);
            textSize(18)
            noStroke();
            let padding = 30
            let lineHeight = 60;
            let inset = 80;
            for(let i = 0; i < player.monsters.length; i++) {
                fill(0);
                let monster = player.monsters[i]
                text(monster.name, inset, (i*lineHeight)+padding);
                text("Lvl: " + monster.strength, 400, (i*lineHeight)+padding)
                text(monster.health + "/" + monster.maxHealth, 400, (i*lineHeight)+padding*2);
                text("HP: ", inset + 5, (i*lineHeight)+padding*2);
                fill(255,0,0);
                rect(inset + 15, (i*lineHeight) + padding*2, 200, 20);
            }
        }


        pop();
    }

    drawSelector(x,y) {
        noStroke();
        fill(255);
        triangle(x, y, x + 10, y + 10, x, y + 20);
    }

    changeIndex(value) {
        if(value == "up" && this.index != 0) {
            this.index--;
        } else if(value == "down" && this.index != 2) {
            this.index++;
        }
    }

    openMenu() {
        this.lastState = state;
        state = STATE.PAUSED;
    }

    inputB() {
        if(this.menuState != MENU_STATES.MAIN_MENU && this.lastState == STATE.WORLD) {
            this.menuState = MENU_STATES.MAIN_MENU
        } else {
            state = this.lastState;
        }
    }

    inputA() {
        if(this.menuState == MENU_STATES.MAIN_MENU) {
            if(this.index = 1) {
                this.menuState = MENU_STATES.MONSTER_MENU;
            }
        }
    }
}