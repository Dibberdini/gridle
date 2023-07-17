function preload() {
  defaultZone = loadJSON("./data/maps/area_0.json");
  savedZone = null;
  if (getItem("save")) {
    savedZone = loadJSON(`./data/maps/${getItem("save").zone}`);
  }
  globalMonsterList = loadJSON("./data/monsters.json");
  globalMoveList = loadJSON("./data/moves.json");
  globalCharacterList = loadJSON("./data/characters.json");

  globalSpriteList = { tiles: {}, models: {}, monsters: {}, blockers: {} };
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
  SPRITES.blockers.forEach(spritePath => {
    let spriteName = spritePath.split(".")[0];
    loadImage("./data/sprites/blockers/" + spritePath, sprite => {
      globalSpriteList.blockers[`${spriteName}`] = sprite
    });
  });

  sounds = { battle: [] };
  SOUND_FILES.battle.forEach(battleTrack => {
    loadSound("./data/audio/" + battleTrack, loadedTrack => {
      sounds.battle.push(loadedTrack);
    })
  });
  sounds.overworld = loadSound("./data/audio/" + SOUND_FILES.overworld);
  sounds.indoors = loadSound("./data/audio/" + SOUND_FILES.indoors);
  sounds.encounter = loadSound("./data/audio/" + SOUND_FILES.encounter);


  myFont = loadFont("./data/Minecraftia-Regular.ttf");
  worldData = { characters: {}, pickedItems: {}, player: {} };
  titleCard = loadImage("./data/sprites/title/1.png");
}

function setup() {
  audio = sounds.overworld;
  volume = 0.5;
  audio.setVolume(volume);
  walkNumber = 0;
  let zone;
  player = { step: [0, 0] };
  index = 0;
  textFont(myFont);
  createCanvas(600, 540);
  dialogue = new DialogManager();
  entities = [];
  fps = 60;
  frameRate(fps);
  grid = new Grid();
  tick = 0;
  tickRate = 15;
  state = STATE.TITLE;
  menu = new Menu();
  battle = new BattleManager();
  animationFrame = 0;
  settings = {};
  loadingMap = false;

  //Mobile settings
  buttonIsDown = false;
  if (windowWidth < 600) {
    resize();
  }
  buttons = []
  currentlyHeldButton = "none";
  buttons.push(createDiv());
  let buttonUp = createButton("↑");
  buttonUp.mousePressed(buttonInputUp);
  buttonUp.key = KEYS.UP;
  buttonUp.elt.ontouchstart = function (event) { currentlyHeldButton = KEYS.UP };
  buttonUp.elt.ontouchend = function (event) { keyCode = KEYS.UP; keyReleased() };
  buttonUp.elt.onmousedown = function (event) { currentlyHeldButton = KEYS.UP };
  buttonUp.elt.onmouseup = function (event) { keyCode = KEYS.UP; keyReleased() };
  buttons.push(buttonUp);
  buttons.push(createDiv());
  let buttonLeft = createButton("←");
  buttonLeft.mousePressed(buttonInputLeft);
  buttonLeft.key = KEYS.LEFT;
  buttonLeft.elt.ontouchstart = function (event) { currentlyHeldButton = KEYS.LEFT };
  buttonLeft.elt.ontouchend = function (event) { keyCode = KEYS.LEFT; keyReleased() };
  buttonLeft.elt.onmousedown = function (event) { currentlyHeldButton = KEYS.LEFT };
  buttonUp.elt.onmouseup = function (event) { keyCode = KEYS.UP; keyReleased() };
  buttons.push(buttonLeft);
  let buttonDown = createButton("↓");
  buttonDown.mousePressed(buttonInputDown);
  buttonDown.key = KEYS.DOWN;
  buttonDown.elt.ontouchstart = function (event) { currentlyHeldButton = KEYS.DOWN };
  buttonDown.elt.ontouchend = function (event) { keyCode = KEYS.DOWN; keyReleased() };
  buttonDown.elt.onmousedown = function (event) { currentlyHeldButton = KEYS.DOWN };
  buttonUp.elt.onmouseup = function (event) { keyCode = KEYS.UP; keyReleased() };
  buttons.push(buttonDown);
  let buttonRight = createButton("→");
  buttonRight.mousePressed(buttonInputRight);
  buttonRight.key = KEYS.RIGHT;
  buttonRight.elt.ontouchstart = function (event) { currentlyHeldButton = KEYS.RIGHT };
  buttonRight.elt.ontouchend = function (event) { keyCode = KEYS.RIGHT; keyReleased() };
  buttonRight.elt.onmousedown = function (event) { currentlyHeldButton = KEYS.RIGHT };
  buttonUp.elt.onmouseup = function (event) { keyCode = KEYS.UP; keyReleased() };
  buttons.push(buttonRight);

  let inputDiv = createDiv();
  inputDiv.addClass("input");

  let arrowDiv = createDiv();
  arrowDiv.addClass("arrows");
  arrowDiv.parent(inputDiv);
  buttons.forEach(button => {
    button.parent(arrowDiv);
  });

  let dividerDiv = createDiv();
  dividerDiv.addClass("divider");
  dividerDiv.parent(inputDiv);

  let choiceDiv = createDiv();
  choiceDiv.addClass("choice");
  choiceDiv.parent(inputDiv);

  let buttonA = createButton("A");
  buttonA.mousePressed(buttonInputA);
  buttonA.key = KEYS.A_KEY;
  buttons.push(buttonA);
  buttonA.parent(choiceDiv);
  let fakebutton1 = createDiv();
  buttons.push(fakebutton1);
  fakebutton1.parent(choiceDiv)
  let buttonB = createButton("B");
  buttonB.mousePressed(buttonInputB);
  buttonB.key = KEYS.B_KEY;
  buttons.push(buttonB);
  buttonB.parent(choiceDiv);

  let buttonStart = createButton("STRT");
  buttonStart.mousePressed(buttonInputStart);
  buttonStart.key = KEYS.START;
  buttons.push(buttonStart);
  buttonStart.parent(choiceDiv);
  let fakebutton2 = createDiv();
  buttons.push(fakebutton2);
  fakebutton2.parent(choiceDiv)
  let buttonSelect = createButton("SEL");
  buttonSelect.mousePressed(buttonInputSelect);
  buttonSelect.key = KEYS.SELECT;
  buttons.push(buttonSelect);
  buttonSelect.parent(choiceDiv);

  buttons.forEach(button => {
    button.addClass("mobile");
    w = windowWidth * 0.1;
    button.size(w, w)
  });


  //Debug enable
  debug = true;
}

function draw() {
  if (state == STATE.WORLD) {
    background(0);
    //Update current tick, if appropriate get the current input.
    tick++;
    if (tick >= tickRate) {
      tick = 0;
      //Simulate Character entities
      entities.forEach(entity => {
        if (entity instanceof Character) {
          entity.work();
        }
      });

      //move Player
      if (state == STATE.WORLD || !loadingMap) {
        getInput();
      }
    }
    if (tick % 5 == 0) {
      walkNumber++;
      if (walkNumber > 3) {
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
  } else if (state == STATE.ENCOUNTER) {
    background(0);
    tick++;
    if (tick >= tickRate) {
      tick = 0;
    }
    grid.draw();
    //Draw each entity
    entities.forEach(entity => {
      entity.update();
      entity.draw(player.x, player.y);
    });
  }

  if (debug) {
    drawDebugInfo();
  }
}

function getInput() {
  if (keyIsDown(KEYS.UP) || currentlyHeldButton == KEYS.UP) {
    if (player.direction == DIRECTION.NORTH) {
      player.move(DIRECTION.NORTH);
    } else {
      player.setDirection(DIRECTION.NORTH);
    }
  } else if (keyIsDown(KEYS.RIGHT) || currentlyHeldButton == KEYS.RIGHT) {
    if (player.direction == DIRECTION.EAST) {
      player.move(DIRECTION.EAST);
    } else {
      player.setDirection(DIRECTION.EAST);
    }
  } else if (keyIsDown(KEYS.DOWN) || currentlyHeldButton == KEYS.DOWN) {
    if (player.direction == DIRECTION.SOUTH) {
      player.move(DIRECTION.SOUTH);
    } else {
      player.setDirection(DIRECTION.SOUTH);
    }
  } else if (keyIsDown(KEYS.LEFT) || currentlyHeldButton == KEYS.LEFT) {
    if (player.direction == DIRECTION.WEST) {
      player.move(DIRECTION.WEST);
    } else {
      player.setDirection(DIRECTION.WEST);
    }
  } else {
    player.moving = false;
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
  if (keyCode == KEYS.SELECT) {
    toggleAudioVolume();
    return;
  }
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

async function titleInput() {
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
        await TitleMenu.newGame();
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
  let currentFPS = 1000 / deltaTime;
  fill(255);
  stroke(0);
  textSize(12);
  text("FPS: " + currentFPS.toFixed(2), 10, height);

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
  let wasIndoors = isIndoors();
  saveWorld();
  entities = [player];
  loadingMap = true;
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
    if (wasIndoors != isIndoors()) {
      if (isIndoors()) {
        playSound(sounds.indoors);
      } else {
        playSound(sounds.overworld);
      }
    }
    loadingMap = false;
  })
}

function resuscitate() {
  player.x = zone.recover[0];
  player.y = zone.recover[1];
  player.tile.clear = true;
  player.tile.occupant = null;
  player.tile = grid.tiles[zone.recover[0]][zone.recover[1]];
  player.tile.clear = false;
  player.tile.occupant = player;

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

async function newWorld() {
  zone = defaultZone;
  grid.loadZone(zone);
  player = new Player(0, 0, DIRECTION.SOUTH, "player", grid.tiles);
  entities.push(player);
  settings = { textSpeed: TEXT_SPEED.NORMAL };
  background(0);
  let starter = false;
  while (!starter) {
    dialogue.options = ["Arto-Adam", "Skolefoto-Bing", "Støvsuger-Mikkel"];
    starter = await dialogue.ask("Which bojsemon do you choose as your starter?")
  }
  let monster;
  switch (starter) {
    case "Arto-Adam":
      monster = new Monster(globalMonsterList.monsters[0])
      break;
    case "Skolefoto-Bing":
      monster = new Monster(globalMonsterList.monsters[3]);
      break;
    case "Støvsuger-Mikkel":
      monster = new Monster(globalMonsterList.monsters[6]);
      break;
    default:
      break;
  }
  monster.setLevel(5);
  player.addMonster(monster);
  background(0);
  await dialogue.load([{ type: "statement", line: `You picked ${monster.name}` }]);
  for (let i = 0; i < 10; i++) {
    player.addItem({ type: "ball_regular", name: "Ball" });
  }
  saveWorld();
  playSound(sounds.overworld);
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
  if (isIndoors()) {
    playSound(sounds.indoors);
  } else {
    playSound(sounds.overworld);
  }
}

function playSound(sound) {
  if (sound == "battle") {
    return;
  }
  if (audio.file == sounds.encounter.file || isBattlesound()) {
    audio.stop();
  } else {
    audio.pause();
  }
  audio = sound;
  if (sound.file == sounds.battle.file) {
    audio.setLoop(false);
  } else {
    audio.setLoop(true);
  }
  audio.setVolume(volume);
  audio.play();
}

function isBattlesound() {
  for (let i = 0; i < sounds.battle.length; i++) {
    if (sounds.battle[i].file == audio.file) {
      return true;
    }
  }
  return false;
}

function toggleAudioVolume() {
  if (volume == 0.5) {
    volume = 0;
  } else {
    volume = 0.5;
  }
  audio.setVolume(volume);
}

function isIndoors() {
  let indoorZones = ["area_2_1.json", "area_2_2.json", "area_3.json", "area_4_1.json"];

  for (let i = 0; i < indoorZones.length; i++) {
    if (zone.name == indoorZones[i]) {
      return true;
    }
  }
  return false;
}

//Mobile functions

function resize() {
  w = windowWidth;
  h = w * 0.9;
  document.body.getElementsByTagName("canvas")[0].style.cssText = `width: ${w}px; height: ${h}px`;
}

function buttonInputUp() {
  keyCode = KEYS.UP;
  keyPressed();
}

function buttonInputRight() {
  keyCode = KEYS.RIGHT;
  keyPressed();
}

function buttonInputDown() {
  keyCode = KEYS.DOWN;
  keyPressed();
}

function buttonInputLeft() {
  keyCode = KEYS.LEFT;
  keyPressed();
}

function buttonInputA() {
  keyCode = KEYS.A_KEY;
  keyPressed();
}

function buttonInputB() {
  keyCode = KEYS.B_KEY;
  keyPressed();
}

function buttonInputStart() {
  keyCode = KEYS.START;
  keyPressed();
}

function buttonInputSelect() {
  keyCode = KEYS.SELECT;
  keyPressed();
}

function touchStarted() {
  buttonIsDown = true;
}

function touchEnded() {
  buttonIsDown = false;
  currentlyHeldButton = "none";
}

function getCurrentButton() {
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i]._events.mousedown) {
      if (
        mouseX > buttons[i].position().x &&
        mouseX < buttons[i].position().x + buttons[i].width &&
        mouseY > buttons[i].position().y &&
        mouseY < buttons[i].position().y + buttons[i].height) {
        return buttons[i];
      }
    }
  }
  return null;
}

function buttonIsHeld(buttonToCheck) {
  if (getCurrentButton() == null) {
    return false;
  }
  let currentButton = getCurrentButton().key;
  if (buttonToCheck = currentButton) {
    return true;
  }
  return false;
}