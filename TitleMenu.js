class TitleMenu {
    constructor() {

    }

    static draw() {
        push();
        background(0);
        fill(255);
        textSize(30);
        textAlign(CENTER, CENTER);
        text("Continue", width / 2, 400);
        text("New Game", width / 2 + 4, 450);

        let x = 0;
        let y = 0
        switch (index) {
            case 0:
                x = 205;
                y = 385;
                break;
            case 1:
                x = 205;
                y = 435;
                break;
            default:
                break;
        }
        triangle(x, y, x + 10, y + 10, x, y + 20);

        pop();
    }

    static continue() {
        if (getItem("save")) {
            loadSave();
            state = STATE.WORLD
        }
    }

    static newGame() {
        newWorld();
        state = STATE.WORLD
    }
}