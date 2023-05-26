class DialogManager {
    constructor() {
        this.currentDialogue = [];
        this.lastState;
        this.activeBattleDialogue = false;
    }

    draw() {
        //Draw dialog box
        push();
        strokeWeight(3);
        stroke(0);
        fill(180);
        rect(0, height-140, width-1.5, 138.5)

        //Draw dialog
        textSize(32);
        noStroke();
        fill(0);
        text(this.currentDialogue[1], 25, height-115, width-25);
        pop();      
    }

    async load(dialogue) {
        this.lastState = state;
        this.currentDialogue = dialogue.map((x) => x);
        state = STATE.DIALOGUE;
        if(this.currentDialogue[0] == DIALOGUE_TYPE.BATTLE) {
            this.activeBattleDialogue = true;
            state = this.lastState;
        } else if(this.currentDialogue[0] == DIALOGUE_TYPE.TIMED) {
            await sleep(1000);
            state = this.lastState;
        }
    }

    inputA() {
        if(this.currentDialogue.length > 2) {
            this.currentDialogue.shift();
            this.currentDialogue.shift();
        } else {
            state = this.lastState;
        }
    }

    inputB() {
        if(this.currentDialogue.length > 2) {
            this.currentDialogue.shift();
            this.currentDialogue.shift();
        } else {
            state = this.lastState;
        }
    }
}