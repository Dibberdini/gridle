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
    DIALOGUE: "dialogue"
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
    STATS_MENU: "stats"
}

const TEXT_SPEED = {
    NORMAL: 1,
    FAST: 2
}

const SPRITES = [

]