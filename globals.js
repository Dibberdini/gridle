const TILE_WIDTH = 60;
const TILE_HEIGHT = 60;

const DIRECTION = {
    NORTH: [0, -1],
    EAST: [1, 0],
    SOUTH: [0, 1],
    WEST: [-1, 0]
}

const TileType = {
    EMPTY: "e",
    GRASS: "g",
    WALL: "w",
    TELEPORT: "t"
}

const create2dArray = (rows, columns) => [...Array(rows).keys()].map(i => Array(columns))

const STATE = {
    WORLD: "world",
    PAUSED: "paused",
    BATTLE: "battle",
    DIALOGUE: "dialogue",
    ANIMATION: "animation"
}

const KEYS = {
    START: 13,
    A_KEY: 65,
    B_KEY: 83
}

const DIALOGUE_TYPE = {
    STATEMENT: "statement",
    QUESTION: "question",
    REPLY_YES: "reply_yes",
    REPLY_NO: "reply_no",
    BATTLE: "battle",
    TIMED: "timed"
}

const CHARACTER_ROLES = {
    CITIZEN: "citizen",
    HEALER: "healer",
    FIGHTER: "fighter"
}

const MENU_STATES = {
    MAIN_MENU: "main",
    MONSTER_MENU: "monster",
    BESTIARY_MENU: "beast",
    SETTINGS_MENU: "settings",
    STATS_MENU: "stats",
    ITEM_MENU: "item"
}

const TEXT_SPEED = {
    NORMAL: 1,
    FAST: 2
}

const ITEMS = {
    MONSTERBALL: "ball_regular",
    POTION: "potion"
}

const STATUSES = {
    NONE: "none",
    POISONED: "psn",
    BURNED: "brn",
    PARALYZED: "plz",
    ASLEEP: "slp",
    FROZEN: "frz",

}

const SPRITES = [
    "0.png",
    "1.png",
    "2.png",
    "3.png",
    "4.png",
    "5.png",
    "6.png",
    "7.png",
    "8.png",
    "9.png",
    "E.png",
    "F.png",
    "G.png",
    "H.png",
    "I.png",
    "J.png",
    "K.png",
    "L.png",
    "M.png",
    "N.png",
    "O.png",
    "P.png",
    "V.gif",
    "W.png"
]