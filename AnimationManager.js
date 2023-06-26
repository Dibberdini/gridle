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
        let canvas = get();
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
}