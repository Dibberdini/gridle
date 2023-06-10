function preload() {
  zone = loadJSON("./data/maps/map1.json");
  globalMonsterList = loadJSON("./data/monsters.json");
  globalMoveList = loadJSON("./data/moves.json");
  globalCharacterList = loadJSON("./data/characters.json");
  globalSpriteList = [];
  SPRITES.forEach(spritePath => {
    loadImage("./data/sprites/" + spritePath, sprite => { globalSpriteList.push({ name: spritePath[0], img: sprite }) });
  });
  myFont = loadFont("./data/Minecraftia-Regular.ttf");
  worldData = { characters: {} };
}

function setup() {
  textFont(myFont);
  createCanvas(600, 540);
  dialogue = new DialogManager();
  entities = [];
  grid = new Grid();
  grid.loadZone(zone);
  player = new Player(2, 2, DIRECTION.EAST, 0, grid.tiles);
  worldData.player = player;
  entities.push(player);
  frameRate(60);
  tick = 0;
  tickRate = 15;
  state = STATE.WORLD;
  menu = new Menu();
  battle = new BattleManager();

  let firstmonster = new Monster(globalMonsterList.monsters[0]);
  let secondmonster = new Monster(globalMonsterList.monsters[1]);
  firstmonster.setStrength(5);
  secondmonster.setStrength(3);
  player.addMonster(firstmonster);
  player.addMonster(secondmonster);

  debug = true;
}

function draw() {
  if (state == STATE.WORLD) {
    background(0);
    //Update current tick, if appropriate get the current input.
    tick++;
    if (tick >= tickRate) {
      tick = 0;
      getInput();

      //Simulate Character entities
      entities.forEach(entity => {
        if (entity instanceof Character) {
          entity.work();
        }
      });
    }

    //Draw the world
    grid.draw();

    //Draw each entity
    entities.forEach(entity => {
      entity.update();
      entity.draw(player.x, player.y);
    });

  } else if (state == STATE.PAUSED) {
    background(0);
    grid.draw();

    entities.forEach(entity => {
      entity.draw(player.x, player.y);
    })

    menu.draw();
  } else if (state == STATE.BATTLE) {
    battle.draw();
  } else if (state == STATE.DIALOGUE) {
    dialogue.draw();
  }

  if (debug) {
    drawDebugInfo();
  }
}

function getInput() {
  if (keyIsDown(LEFT_ARROW)) {
    if (player.DIRECTION == DIRECTION.WEST) {
      player.move(DIRECTION.WEST);
    } else {
      player.setDirection(DIRECTION.WEST);
    }
  } else if (keyIsDown(RIGHT_ARROW)) {
    if (player.DIRECTION == DIRECTION.EAST) {
      player.move(DIRECTION.EAST);
    } else {
      player.setDirection(DIRECTION.EAST);
    }
  } else if (keyIsDown(UP_ARROW)) {
    if (player.DIRECTION == DIRECTION.NORTH) {
      player.move(DIRECTION.NORTH);
    } else {
      player.setDirection(DIRECTION.NORTH);
    }
  } else if (keyIsDown(DOWN_ARROW)) {
    if (player.DIRECTION == DIRECTION.SOUTH) {
      player.move(DIRECTION.SOUTH);
    } else {
      player.setDirection(DIRECTION.SOUTH);
    }
  }
}

function keyPressed() {
  if (state == STATE.WORLD) {
    worldInput();
  } else if (state == STATE.BATTLE) {
    if (battle.playerTurn) {
      battleInput();
    }
  } else if (state == STATE.PAUSED) {
    pauseInput();
  } else if (state == STATE.DIALOGUE) {
    dialogueInput();
  }
}

function worldInput() {
  if (keyCode == KEYS.START) {
    menu.openMenu();

  } else if (keyCode == KEYS.A_KEY && JSON.stringify(player.step) == "[0,0]") {
    target = grid.tiles[player.x + player.DIRECTION[0]][player.y + player.DIRECTION[1]];
    if (target.occupant instanceof Entity) {
      target.occupant.interact(player);
    }
  }
}

function pauseInput() {
  if (keyCode == UP_ARROW) {
    menu.indexUp();
  } else if (keyCode == DOWN_ARROW) {
    menu.indexDown();
  } else if (keyCode == KEYS.START || keyCode == KEYS.B_KEY) {
    menu.inputB();
  } else if (keyCode == KEYS.A_KEY) {
    menu.inputA();
  }
}

function battleInput() {
  if (keyCode == UP_ARROW) {
    battle.updateSelector(-2);
  } else if (keyCode == DOWN_ARROW) {
    battle.updateSelector(2);
  } else if (keyCode == LEFT_ARROW) {
    battle.updateSelector(-1);
  } else if (keyCode == RIGHT_ARROW) {
    battle.updateSelector(1);
  } else if (keyCode == KEYS.A_KEY) {
    battle.inputA();
  } else if (keyCode == KEYS.B_KEY) {
    battle.inputB();
  }
}

function dialogueInput() {
  if (keyCode == KEYS.A_KEY) {
    dialogue.inputA();
  } else if (keyCode == KEYS.B_KEY) {
    dialogue.inputB();
  } else if (keyCode == UP_ARROW) {
    dialogue.indexUp();
  } else if (keyCode == DOWN_ARROW) {
    dialogue.indexDown();
  }
}

function togglePause() {
  if (state == STATE.WORLD) {
    state = STATE.PAUSED;
  } else if (state == STATE.PAUSED) {
    state = STATE.WORLD;
  }
}

function drawDebugInfo() {
  push();
  // Draw FPS (rounded to 2 decimal places) at the bottom left of the screen
  let fps = frameRate();
  fill(255);
  stroke(0);
  textSize(12);
  text("FPS: " + fps.toFixed(2), 10, height);

  //Draw player pos
  if (player.tile) {
    textAlign(RIGHT);
    let pos = player.tile.x + ", " + player.tile.y
    text(pos, width - 10, height);
  }

  pop();
}

function sleep(millisecondsDuration) {
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  })
}

function warp(warpInfo) {
  saveWorld();
  entities = [player];
  loadJSON("./data/maps/" + warpInfo.map, (newZone) => {
    player.tile.clear = true;
    zone = newZone;
    grid.loadZone(newZone);
    player.x = warpInfo.pos[0];
    player.y = warpInfo.pos[1];
    player.tile = grid.tiles[player.x][player.y];
    player.tile.clear = false;
    player.tile.occupant = player;
    if (warpInfo.move) {
      player.setDirection(warpInfo.move);
      player.move(warpInfo.move);
    }
  })
}

function resuscitate() {
  player.x = zone.recover[0];
  player.y = zone.recover[1];
  player.tile.clear = true;
  player.tile = grid.tiles[zone.recover[0]][zone.recover[1]];
  player.tile.clear = false;

  //Heal all monsters
  player.healAllMonsters();
  background(0);

  dialogue.load([{ type: "statement", line: "You blacked out!" }]);
}

function saveWorld() {
  entities.forEach(entity => {
    if (entity instanceof Character) {
      if (!worldData.characters[`${entity.id}`]) {
        worldData.characters[`${entity.id}`] = {};
      }
      worldData.characters[`${entity.id}`].questLevel = entity.questLevel;
    }
  });
}