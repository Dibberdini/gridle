class AnimationManager {
    constructor() {

    }

    static async animationBoilerPlate() {
        //Setup animation variables
        let canvas = get();
        animationFrame = 0;
        let lastState = state;
        state = STATE.ANIMATION;

        //Draw animation
        push();
        while (animationFrame < 30) {
            image(canvas, 0, 0);


            await sleep(2);
        }
        pop();

        //Return to previous state
        state = lastState;
    }

    static async throwBall() {
        //Setup animation variables
        let canvas = get();
        animationFrame = 0;
        let lastState = state;
        state = STATE.ANIMATION;

        //Draw animation
        push();
        while (animationFrame < 40) {
            image(canvas, 0, 0);
            noStroke();
            ellipseMode(CENTER);
            fill(0, 0, 255);
            angleMode(DEGREES);
            let m = map(animationFrame, 0, 40, 0, 130);
            let x = animationFrame * 8 + 135;
            let y = sin(m) * -270 + 350;
            ellipse(x, y, 40);
            await sleep(2);
        }
        pop();

        //Return to previous state
        state = lastState;
    }

    static async beginBattle() {
        //Setup animation variables
        animationFrame = 0;
        let lastState = state;
        state = STATE.ANIMATION;

        //Draw animation
        push();
        while (animationFrame < 90) {
            noStroke();
            fill(0);
            let x = animationFrame % 10;
            let y = Math.floor(animationFrame / 10);
            rect(x * 60, y * 60, 60);

            await sleep(2);
        }
        pop();

        //Return to previous state
        state = lastState;
    }

    //Animation played during evolution. Returns false, if the evolution is cancelled.
    static async evolution(baseMonster, evolvedMonster, monsterName) {
        //Setup animation variables
        let canvas = get();
        animationFrame = 0;
        let lastState = state;
        state = STATE.ANIMATION;

        //Draw animation
        push();
        background(255);
        let duration = 8
        AnimationManager.drawMonster(baseMonster.model, width / 2 - 60, height / 2 - 60);
        await dialogue.load([{ type: "timed", line: `What? ${monsterName} is evolving!`, time: 1000 }]);
        let animationDelta = animationFrame;
        while (animationFrame < animationDelta + fps * duration) {
            if ((animationDelta - animationFrame) % 2 == 0) {
                background(255);
                let mapped = map(Math.random(), 0, 1, 0, fps * duration);
                if (mapped > -(animationDelta - animationFrame)) {
                    AnimationManager.drawMonster(baseMonster.model, width / 2 - 60, height / 2 - 60);
                } else {
                    AnimationManager.drawMonster(1, width / 2 - 60, height / 2 - 60)
                }
            }
            if (keyIsDown(KEYS.B_KEY)) {
                state = lastState;
                AnimationManager.drawMonster(baseMonster.model, width / 2 - 60, height / 2 - 60);
                return true;
            }

            await sleep(2);
        }
        AnimationManager.drawMonster(1, width / 2 - 60, height / 2 - 60);
        pop();

        //Return to previous state
        state = lastState;
        return false;
    }

    static drawMonster(model, x, y) {
        if (model == 0) {
            push();
            fill(0, 250, 0);
            noStroke();
            rect(x, y, 120, 120);
            pop();
        } else if (model == 1) {
            push();
            fill(250, 0, 0);
            noStroke();
            rect(x, y, 120, 120);
            pop();
        }
    }
}