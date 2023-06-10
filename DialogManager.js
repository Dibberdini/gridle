class DialogManager {
    constructor() {
        this.currentLine;
        this.currentDialogue;
        this.lastState;
        this.step = 0;
        this.speaker = null;
        this.index = 0;
    }

    draw() {
        //Rolling text
        let stepDialogue = "";
        if (this.step < this.currentLine.line.length) {
            this.step += TEXT_SPEED.NORMAL;
            stepDialogue = this.currentLine.line.substring(0, this.step);
        } else {
            stepDialogue = this.currentLine.line;
        }
        push();

        //Draw dialog box
        strokeWeight(3);
        stroke(0);
        fill(180);
        rect(0, height - 140, width - 1.5, 138.5)

        //Draw reply box
        if (this.currentLine.type == DIALOGUE_TYPE.QUESTION) {
            rect(width - 100, height - 220, 98.5, 80)
            textSize(28)
            fill(0);
            noStroke();
            text("Yes", width - 65, height - 185);
            text("No", width - 65, height - 155);
            this.drawSelector(width - 83, height - 205 + this.index * 30);
        }

        //Draw dialog
        textSize(42);
        textLeading(50);
        noStroke();
        fill(0);
        text(stepDialogue, 25, height - 85, width - 25);

        pop();
    }

    async load(dialogue) {
        this.lastState = state;
        this.currentDialogue = dialogue.map((x) => x);
        this.currentLine = this.currentDialogue[0];
        this.step = 0;
        state = STATE.DIALOGUE;
        if (this.currentLine.type == DIALOGUE_TYPE.BATTLE) {
            state = this.lastState;
        } else if (this.currentLine.type == DIALOGUE_TYPE.TIMED) {
            await sleep(this.currentLine.time);
            state = this.lastState;
        }
    }

    speak(dialogue, speaker) {
        this.speaker = speaker;
        this.load(dialogue);
    }

    inputA() {
        //Check if rolling text is done.
        if (this.step >= this.currentLine.line.length) {
            //Check if this line advances relationship with character
            if (this.currentLine.gain) {
                this.speaker.setQuest(parseInt(this.currentLine.gain));
            }
            if (this.currentLine.type == DIALOGUE_TYPE.QUESTION) {
                //If this is a question and the index is at the 'no'-position, skip the following yes-reply in the array.
                if (this.index == 1) {
                    this.currentDialogue.shift();
                }
            } else if (this.currentLine.type == DIALOGUE_TYPE.REPLY_YES) {
                //If this line is a yes-reply skip the following no-reply in the array.
                this.currentDialogue.shift();
            }
            this.currentDialogue.shift();
            this.index = 0;
            //Check if there are more lines.
            if (this.currentDialogue.length > 0) {
                this.currentLine = this.currentDialogue[0];
                this.step = 0;
            } else {
                state = this.lastState;
                this.speaker = null;
            }
        } else {
            this.step = this.currentLine.line.length;
        }
    }

    inputB() {
        if (this.currentLine.type == "question" && this.step >= this.currentLine.line.length) {
            this.index = 1;
            this.draw();
            this.inputA();
        } else {
            this.inputA();
        }
    }

    clear() {
        this.currentLine = [];
    }

    drawSelector(x, y) {
        push();
        noStroke();
        fill(255);
        triangle(x, y, x + 10, y + 10, x, y + 20);
        pop();
    }

    indexDown() {
        if (this.index == 0 && this.step >= this.currentLine.line.length) {
            this.index = 1;
        }
    }

    indexUp() {
        if (this.index == 1 && this.step >= this.currentLine.line.length) {
            this.index = 0;
        }
    }
}