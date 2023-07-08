function preload() {
  defaultZone = loadJSON("./data/maps/map1.json");
  savedZone = null;
  if (getItem("save")) {
    savedZone = loadJSON(`./data/maps/${getItem("save").zone}`);
  }
  globalMonsterList = loadJSON("./data/monsters.json");
  globalMoveList = loadJSON("./data/moves.json");
  globalCharacterList = loadJSON("./data/characters.json");

  globalSpriteList = { tiles: {}, models: {}, monsters: {} };
  SPRITES.tiles.forEach(spritePath => {
    let spriteName = spritePath.split(".")[0];
    loadImage("./data/sprites/" + spritePath, sprite => {
      globalSpriteList.tiles[`${spriteName}`] = sprite
    });
  });
  SPRITES.models.forEach(spritePath => {
    let spriteName = spritePath.split(".")[0];
    loadImage("./data/sprites/models/" + spritePath, sprite => {
      globalSpriteList.models[`${spriteName}`] = sprite
    });
  });
  SPRITES.monsters.forEach(spritePath => {
    let spriteName = spritePath.split(".")[0];
    loadImage("./data/sprites/battle/" + spritePath, sprite => {
      globalSpriteList.monsters[`${spriteName}`] = sprite
    });
  });


  myFont = loadFont("./data/Minecraftia-Regular.ttf");
  worldData = { characters: {}, pickedItems: {}, player: {} };
  titleCard = loadImage("./data/sprites/title/1.png");
}

function setup() {
  walkNumber = 0;
  let zone;
  player = { step: [0, 0] };
  index = 0;
  textFont(myFont);
  createCanvas(600, 540);
  dialogue = new DialogManager();
  entities = [];
  grid = new Grid();
  frameRate(60);
  tick = 0;
  tickRate = 15;
  state = STATE.TITLE;
  menu = new Menu();
  battle = new BattleManager();
  animationFrame = 0;
  settings = {};

  //Mobile settings
  if (windowWidth < 600) {
    resize();
  }

  debug = false;
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
    if (tick % 5 == 0) {
      walkNumber++;
      if (walkNumber > 2) {
        walkNumber = 0;
      }
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
  } else if (state == STATE.ANIMATION) {
    animationFrame++;
  } else if (state == STATE.TITLE) {
    TitleMenu.draw();
  }

  if (debug) {
    drawDebugInfo();
  }
}

function getInput() {
  if (keyIsDown(KEYS.UP)) {
    if (player.direction == DIRECTION.NORTH) {
      player.stopping = false;
      player.move(DIRECTION.NORTH);
    } else {
      player.setDirection(DIRECTION.NORTH);
    }
  } else if (keyIsDown(KEYS.RIGHT)) {
    if (player.direction == DIRECTION.EAST) {
      player.stopping = false;
      player.move(DIRECTION.EAST);
    } else {
      player.setDirection(DIRECTION.EAST);
    }
  } else if (keyIsDown(KEYS.DOWN)) {
    if (player.direction == DIRECTION.SOUTH) {
      player.stopping = false;
      player.move(DIRECTION.SOUTH);
    } else {
      player.setDirection(DIRECTION.SOUTH);
    }
  } else if (keyIsDown(KEYS.LEFT)) {
    if (player.direction == DIRECTION.WEST) {
      player.stopping = false;
      player.move(DIRECTION.WEST);
    } else {
      player.setDirection(DIRECTION.WEST);
    }
  }
}
function keyReleased() {
  switch (keyCode) {
    case KEYS.UP:
      player.stopping = true;
      if (player.step[0] == 0 && player.step[1] == 0) {
        player.moving = false;
      }
      break;
    case KEYS.RIGHT:
      player.stopping = true;
      if (player.step[0] == 0 && player.step[1] == 0) {
        player.moving = false;
      }
      break;
    case KEYS.DOWN:
      player.stopping = true;
      if (player.step[0] == 0 && player.step[1] == 0) {
        player.moving = false;
      }
      break;
    case KEYS.LEFT:
      player.stopping = true;
      if (player.step[0] == 0 && player.step[1] == 0) {
        player.moving = false;
      }
      break;
    default:
      break;
  }
}

function keyPressed() {
  switch (state) {
    case STATE.WORLD:
      worldInput();
      break;
    case STATE.BATTLE:
      battleInput();
      break;
    case STATE.PAUSED:
      pauseInput();
      break;
    case STATE.DIALOGUE:
      dialogueInput();
      break;
    case STATE.TITLE:
      titleInput();
      break;
    default:
      break;
  }
}

function worldInput() {
  if (keyCode == KEYS.START) {
    menu.openMenu();

  } else if (keyCode == KEYS.A_KEY && JSON.stringify(player.step) == "[0,0]") {
    target = grid.tiles[player.x + player.direction[0]][player.y + player.direction[1]];
    if (target.occupant instanceof Entity) {
      target.occupant.interact(player);
    }
  }
}

function pauseInput() {
  if (keyCode == KEYS.UP) {
    menu.indexUp();
  } else if (keyCode == KEYS.DOWN) {
    menu.indexDown();
  } else if (keyCode == KEYS.START || keyCode == KEYS.B_KEY) {
    menu.inputB();
  } else if (keyCode == KEYS.A_KEY) {
    menu.inputA();
  } else if (keyCode == KEYS.LEFT) {
    menu.indexLeft();
  } else if (keyCode == KEYS.RIGHT) {
    menu.indexRight();
  }
}

function battleInput() {
  if (keyCode == KEYS.UP) {
    battle.updateSelector(-2);
  } else if (keyCode == KEYS.DOWN) {
    battle.updateSelector(2);
  } else if (keyCode == KEYS.LEFT) {
    battle.updateSelector(-1);
  } else if (keyCode == KEYS.RIGHT) {
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
  } else if (keyCode == KEYS.UP) {
    dialogue.indexUp();
  } else if (keyCode == KEYS.DOWN) {
    dialogue.indexDown();
  }
}

function titleInput() {
  switch (keyCode) {
    case KEYS.UP:
      if (index != 0) {
        index--;
      }
      break;
    case KEYS.DOWN:
      if (index != 1) {
        index++;
      }
      break;
    case KEYS.A_KEY:
      if (index == 0) {
        TitleMenu.continue();
      } else if (index == 1) {
        TitleMenu.newGame();
      }
      break;
    default:
      break;
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
  if (state == STATE.WORLD && player.tile) {
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
  //Save player
  worldData.player.id = player.id;
  worldData.player.x = Math.round(player.x);
  worldData.player.y = Math.round(player.y);
  worldData.player.direction = player.direction;
  worldData.player.money = player.money;
  worldData.player.monsters = player.monsters;
  worldData.player.bank = player.bank;
  worldData.player.inventory = player.inventory;

  //Save settings
  worldData.settings = settings;

  //Save questlevels of characters
  entities.forEach(entity => {
    if (entity instanceof Character) {
      if (!worldData.characters[`${entity.id}`]) {
        worldData.characters[`${entity.id}`] = {};
      }
      worldData.characters[`${entity.id}`].questLevel = entity.questLevel;
    }
  });

  //Save current world
  worldData.zone = zone.name;
}

function writeSave() {
  storeItem("save", worldData);
}

function addToPickedItems(item) {
  worldData.pickedItems[`${item.id}`] = true;
}

function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

function downloadSave() {
  let data = JSON.stringify(getItem("save"));
  download(data, 'gridle.json', 'text/plain');
}

function newWorld() {
  zone = defaultZone
  grid.loadZone(zone);
  player = new Player(8, 5, DIRECTION.SOUTH, "player", grid.tiles);
  entities.push(player);
  settings = { textSpeed: TEXT_SPEED.NORMAL };

  //Test parameters
  let firstmonster = new Monster(globalMonsterList.monsters[0]);
  let secondmonster = new Monster(globalMonsterList.monsters[2]);
  firstmonster.setLevel(5);
  secondmonster.setLevel(3);
  player.addMonster(firstmonster);
  player.addMonster(secondmonster);
  let t = player.inventory.pop();
  player.inventory.push({ type: ITEMS.MONSTERBALL, count: 5, name: "Ball" });
  player.inventory.push({ type: ITEMS.POTION, count: 5, name: "Potion" });
  player.inventory.push(t);

  saveWorld();
}

function loadSave() {
  worldData = getItem("save");
  zone = savedZone;
  grid.loadZone(zone);

  player = new Player(worldData.player.x, worldData.player.y, worldData.player.direction, "player", grid.tiles);
  player.id = worldData.player.id;
  player.money = worldData.player.money;
  player.inventory = worldData.player.inventory;

  worldData.player.monsters.forEach(monster => {
    let newMonster = new Monster(monster.prototype);
    newMonster.name = monster.name;
    newMonster.owner = monster.owner;
    newMonster.health = monster.health;
    newMonster.status = monster.status;
    newMonster.attack = monster.attack;
    newMonster.defence = monster.defence;
    newMonster.speed = monster.speed;
    newMonster.maxHealth = monster.maxHealth;
    newMonster.moveSet = monster.moveSet;
    newMonster.level = monster.level;
    newMonster.experience = monster.experience;
    newMonster.requiredEXP = monster.requiredEXP;

    player.monsters.push(newMonster);
  });

  worldData.player.bank.forEach(monster => {
    let newMonster = new Monster(monster.prototype);
    newMonster.name = monster.name;
    newMonster.owner = monster.owner;
    newMonster.health = monster.health;
    newMonster.status = monster.status;
    newMonster.attack = monster.attack;
    newMonster.defence = monster.defence;
    newMonster.speed = monster.speed;
    newMonster.maxHealth = monster.maxHealth;
    newMonster.moveSet = monster.moveSet;
    newMonster.level = monster.level;
    newMonster.experience = monster.experience;
    newMonster.requiredEXP = monster.requiredEXP;

    player.bank.push(newMonster);
  });

  entities.push(player);
  settings = worldData.settings;
  saveWorld();
}

function resize() {
  w = windowWidth;
  h = w * 0.9;
  document.body.getElementsByTagName("canvas")[0].style.cssText = `width: ${w}px; height: ${h}px`;
}