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
    ANIMATION: "animation",
    TITLE: "title"
}

const KEYS = {
    START: 13,
    SELECT: 78,
    A_KEY: 65,
    B_KEY: 83,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
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
    ITEM_MENU: "item",
    BANK_MENU: "bank"
}

const TEXT_SPEED = {
    SLOW: 0.5,
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
    HEALING: "hel"
}

const GROWTH_RATES = {
    FAST: "fast",
    MEDIUM_FAST: "m_fast",
    MEDIUM_SLOW: "m_slow",
    SLOW: "slow"
}

const TYPES = {
    NORMAL: {},
    ADAM: { ADAM: 2, FELIX: 2, HEIBING: 0.5, MIKKEL: 0.5, MORTEN: 2, DIBBERN: 2 },
    ALEX: { OLAF: 2, JOAKIM: 0.5, HEIBING: 2, DAREIOS: 0.5, MIKKEL: 2, ALEX: 0.5, MORTEN: 0, DIBBERN: 0.5 },
    BING: { ADAM: 0.5, FELIX: 0.5, JOAKIM: 2, HEIBING: 2, DAREIOS: 0.5, ALEX: 0.5, MORTEN: 2 },
    DAREIOS: { OLAF: 0.5, JOAKIM: 0.5, HEIBING: 2, DAREIOS: 0.5, MIKKEL: 2, ALEX: 2, DIBBERN: 0.5 },
    DIBBERN: { OLAF: 2, ADAM: 0.5, JOAKIM: 0.5, HEIBING: 2, MIKKEL: 2, ALEX: 0.5, MORTEN: 0.5, DIBBERN: 2 },
    FELIX: { ADAM: 2, FELIX: 0.5, JOAKIM: 2, HEIBING: 0.5, DAREIOS: 2, MORTEN: 0.5, DIBBERN: 0.5 },
    JOAKIM: { OLAF: 2, FELIX: 2, JOAKIM: 0.5, HEIBING: 0.5, MIKKEL: 2, ALEX: 0.5, MORTEN: 0 },
    MIKKEL: { OLAF: 0.5, ADAM: 2, JOAKIM: 0, DAREIOS: 2, MIKKEL: 2, ALEX: 0.5, MORTEN: 0.5 },
    MORTEN: { OLAF: 0.5, ADAM: 2, FELIX: 0.5, JOAKIM: 0, MIKKEL: 0.5, MORTEN: 2, DIBBERN: 2 },
    OLAF: { OLAF: 0.5, FELIX: 0.5, JOAKIM: 2, MIKKEL: 2, ALEX: 2, DIBBERN: 0.5 }
}

const SPRITES = {
    models: [
        'birger_0.png', 'birger_1.png', 'birger_2.png', 'birger_3.png',
        'birger_4.png', 'birger_5.png', 'birger_6.png', 'birger_7.png',
        'birger_8.png', 'casper_0.png', 'casper_1.png', 'casper_2.png',
        'casper_3.png', 'casper_4.png', 'casper_5.png', 'casper_6.png',
        'casper_7.png', 'casper_8.png', 'generic1_0.png', 'generic1_1.png',
        'generic1_2.png', 'generic1_3.png', 'generic1_4.png', 'generic1_5.png',
        'generic1_6.png', 'generic1_7.png', 'generic1_8.png', 'generic2_0.png',
        'generic2_1.png', 'generic2_2.png', 'generic2_3.png', 'generic2_4.png',
        'generic2_5.png', 'generic2_6.png', 'generic2_7.png', 'generic2_8.png',
        'generic3_0.png', 'generic3_1.png', 'generic3_2.png', 'generic3_3.png',
        'generic3_4.png', 'generic3_5.png', 'generic3_6.png', 'generic3_7.png',
        'generic3_8.png', 'generic4_0.png', 'generic4_1.png', 'generic4_2.png',
        'generic4_3.png', 'generic4_4.png', 'generic4_5.png', 'generic4_6.png',
        'generic4_7.png', 'generic4_8.png', 'hjarvard_0.png', 'hjarvard_1.png',
        'hjarvard_2.png', 'hjarvard_3.png', 'hjarvard_4.png', 'hjarvard_5.png',
        'hjarvard_6.png', 'hjarvard_7.png', 'hjarvard_8.png', 'hjarvard_b.png',
        'hjarvard_f.png', 'hjarvard_s.png', 'isak_0.png', 'isak_1.png',
        'isak_2.png', 'isak_3.png', 'isak_4.png', 'isak_5.png',
        'isak_6.png', 'isak_7.png', 'isak_8.png', 'isak_b.png',
        'isak_f.png', 'isak_s.png', 'player_0.png', 'player_1.png',
        'player_2.png', 'player_3.png', 'player_4.png', 'player_5.png',
        'player_6.png', 'player_7.png', 'player_8.png', 'player_b.png',
        'player_f.png', 'player_s.png', 'underberg.png'
    ],
    monsters: [
        '001.png', '002.png', '003.png', '004.png',
        '005.png', '006.png', '007.png', '008.png',
        '009.png', '010.png', '011.png', '012.png',
        '013.png', '014.png', '015.png', '016.png',
        '017.png', '018.png', '019.png', '020.png',
        '021.png', '022.png', '023.png', '024.png',
        '025.png', '026.png', '027.png', '028.png',
        '029.png', '030.png', '031.png', '032.png',
        '033.png', '034.png', '035.png', '036.png',
        '037.png', '038.png', '039.png', '041.png',
        '042.png', '043.png', '044.png', '045.png',
        '046.png', '047.png', '048.png', '049.png'
    ],
    tiles: [
        '0.png', '1.png', '2.png',
        '3.png', '4.png', '5.png',
        '6.png', '7.png', '8.png',
        '9.png', 'E.png', 'F.png',
        'G.png', 'H.png', 'I.png',
        'J.png', 'K.png', 'L.png',
        'M.png', 'N.png', 'O.png',
        'P.png', 'Q.png', 'V.gif',
        'W.png'
    ]
}