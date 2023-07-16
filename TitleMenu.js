class TitleMenu {
    constructor() {

    }

    static draw() {
        push();
        background(41);
        fill(255);
        textSize(30);
        textAlign(CENTER, CENTER);

        image(titleCard, 120, 100);
        text(`Continue`, width / 2, 400);
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

        if(buttonIsDown) {
            text(currentlyHeldButton, width/2, height/2);
        }

        pop();
    }

    static continue() {
        if (getItem("save")) {
            loadSave();
            state = STATE.WORLD
        }
    }

    static async newGame() {
        await newWorld();
        state = STATE.WORLD
    }
}