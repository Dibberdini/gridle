class DialogManager {
    constructor() {
        this.currentLine;
        this.currentDialogue;
        this.lastState;
        this.step = 0;
        this.speaker = null;
        this.index = 1;
        this.answer = null;

        this.options = ["No", "Yes"];
    }

    draw() {
        //Rolling text
        let stepDialogue = "";
        if (this.step < this.currentLine.line.length) {
            this.step += settings.textSpeed;
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
            let chars = 0;
            let charWidth = 25
            this.options.forEach(option => {
                if (option.length > chars) {
                    chars = option.length;
                }
            });
            let w = chars * charWidth + 10;
            let h = 35 * this.options.length;
            let x = width - 1.5 - w;
            let y = height - 140 - h;
            rect(x, y, w, h);
            textSize(24)
            fill(0);
            noStroke();
            for (let i = 0; i < this.options.length; i++) {
                text(this.options[i], x + 27, y + h + 5 - i * 30);
            }
            this.drawSelector(x + 10, y + h - 28 - this.index * 30);
        }

        //Draw dialog
        textSize(30);
        textLeading(50);
        noStroke();
        fill(0);
        text(stepDialogue, 25, height - 65, width - 25);

        pop();
    }

    async load(dialogue) {
        this.lastState = state;
        this.currentDialogue = dialogue.map((x) => x);
        this.currentLine = this.currentDialogue[0];
        state = STATE.DIALOGUE;

        await this.display();
    }

    async display() {
        this.continue = false;
        this.index = 1;
        this.step = 0;
        this.answer = null;

        if (this.currentLine.type == DIALOGUE_TYPE.BATTLE) {
            state = this.lastState;
            return;
        }

        //Wait until rolling text is done
        while (this.step < this.currentLine.line.length) {
            await sleep(5);
        }

        //If this is timed dialogue wait until the timer is done
        if (this.currentLine.type == DIALOGUE_TYPE.TIMED) {
            await sleep(this.currentLine.time);
            state = this.lastState;
            return;
        }

        //Otherwise, wait until continue is pressed;
        while (!this.continue) {
            await sleep(1);
        }

        //Check if this line advances relationship with character
        if (this.currentLine.gain) {
            this.speaker.setQuest(parseInt(this.currentLine.gain));
        }

        //If this is a question and the is 'no', skip the following yes-reply in the array.
        if (this.currentLine.type == DIALOGUE_TYPE.QUESTION && this.answer == "No") {
            this.currentDialogue.shift();
        } else if (this.currentLine.type == DIALOGUE_TYPE.REPLY_YES) {
            //If this line is a yes-reply skip the following no-reply in the array.
            this.currentDialogue.shift();
        }

        this.currentDialogue.shift();
        //Check if there are more lines.
        if (this.currentDialogue.length > 0) {
            this.currentLine = this.currentDialogue[0];
            this.display();
        } else {
            state = this.lastState;
            this.speaker = null;
        }
    }


    async speak(dialogue, speaker) {
        this.speaker = speaker;
        await this.load(dialogue);
    }

    async ask(newLine) {
        if (this.options[1] == "Yes") {
            this.index = 1;
        } else {
            this.index = 0;
        }
        this.continue = false;
        this.answer = null;
        this.lastState = state;
        this.step = 0;
        state = STATE.DIALOGUE;
        this.currentLine = { type: DIALOGUE_TYPE.QUESTION, line: newLine };

        while (this.step < this.currentLine.line.length) {
            await sleep(5);
        }

        while (!this.continue) {
            await sleep(1);
        }
        state = this.lastState;
        this.options = ["No", "Yes"];
        this.index = 1;
        return this.answer;
    }

    inputA() {
        //Check if rolling text is done.
        if (this.step >= this.currentLine.line.length) {
            this.continue = true;
            if (this.currentLine.type == DIALOGUE_TYPE.QUESTION) {
                this.answer = this.options[this.index];
            }
        } else {
            this.step = this.currentLine.line.length;
        }
    }

    inputB() {
        if (this.step >= this.currentLine.line.length) {
            if (this.currentLine.type == DIALOGUE_TYPE.QUESTION) {
                if (this.options[1] == "Yes") {
                    this.index = 1;
                    this.draw();
                    this.inputA();
                } else {
                    this.continue = true;
                    this.answer = false;
                }
            }
        } else {
            this.step = this.currentLine.line.length;
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
        if (this.index != 0 && this.step >= this.currentLine.line.length) {
            this.index--
        }
    }

    indexUp() {
        if (this.index != this.options.length - 1 && this.step >= this.currentLine.line.length) {
            this.index++;
        }
    }
}