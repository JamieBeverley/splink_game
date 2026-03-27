export interface Puzzle {
  word1: string
  word2: string
  answers: string[]
}

// Hand-curated puzzles.
// WORD1 + answer = compound word  |  answer + WORD2 = compound word
// e.g. FIRE + WORK + SHOP → FIREWORK · WORKSHOP
const HAND_PUZZLES: Puzzle[] = [
  { word1: 'FIRE', word2: 'SHOP', answers: ['WORK'] },        // FIREWORK · WORKSHOP
  { word1: 'EYE', word2: 'PARK', answers: ['BALL'] },         // EYEBALL · BALLPARK
  { word1: 'HAND', word2: 'DOWN', answers: ['SHAKE'] },       // HANDSHAKE · SHAKEDOWN
  { word1: 'OVER', word2: 'OUT', answers: ['LOOK'] },         // OVERLOOK · LOOKOUT
  { word1: 'SUN', word2: 'POT', answers: ['FLOWER'] },        // SUNFLOWER · FLOWERPOT
  { word1: 'BOOK', word2: 'WORK', answers: ['CASE'] },        // BOOKCASE · CASEWORK
  { word1: 'DOOR', word2: 'BOY', answers: ['BELL'] },         // DOORBELL · BELLBOY
  { word1: 'BUTTER', word2: 'WHEEL', answers: ['FLY'] },      // BUTTERFLY · FLYWHEEL
  { word1: 'FOOT', word2: 'BOOK', answers: ['NOTE'] },        // FOOTNOTE · NOTEBOOK
  { word1: 'HEAD', word2: 'HOUSE', answers: ['LIGHT'] },      // HEADLIGHT · LIGHTHOUSE
  { word1: 'TOOTH', word2: 'FIRE', answers: ['BRUSH'] },      // TOOTHBRUSH · BRUSHFIRE
  { word1: 'SNOW', word2: 'ROOM', answers: ['BALL'] },        // SNOWBALL · BALLROOM
  { word1: 'MASTER', word2: 'SET', answers: ['MIND'] },       // MASTERMIND · MINDSET
  { word1: 'OVER', word2: 'TABLE', answers: ['TIME'] },       // OVERTIME · TIMETABLE
  { word1: 'BACK', word2: 'WORK', answers: ['GROUND'] },      // BACKGROUND · GROUNDWORK
  { word1: 'WATER', word2: 'OUT', answers: ['FALL'] },        // WATERFALL · FALLOUT
  { word1: 'BIRTH', word2: 'DREAM', answers: ['DAY'] },       // BIRTHDAY · DAYDREAM
  { word1: 'SAND', word2: 'WALL', answers: ['STONE'] },       // SANDSTONE · STONEWALL
  { word1: 'BOOK', word2: 'HOLE', answers: ['WORM'] },        // BOOKWORM · WORMHOLE
  { word1: 'DOOR', word2: 'LADDER', answers: ['STEP'] },      // DOORSTEP · STEPLADDER
  { word1: 'STAR', word2: 'BOWL', answers: ['FISH'] },        // STARFISH · FISHBOWL
  { word1: 'CAMP', word2: 'PLACE', answers: ['FIRE'] },       // CAMPFIRE · FIREPLACE
  { word1: 'BLACK', word2: 'HOUSE', answers: ['BIRD'] },      // BLACKBIRD · BIRDHOUSE
  { word1: 'HAIR', word2: 'BACK', answers: ['CUT'] },         // HAIRCUT · CUTBACK
  { word1: 'BUTTER', word2: 'MAN', answers: ['MILK'] },       // BUTTERMILK · MILKMAN
  { word1: 'THUNDER', word2: 'HOLE', answers: ['BOLT'] },     // THUNDERBOLT · BOLTHOLE
  { word1: 'CARD', word2: 'ROOM', answers: ['BOARD'] },       // CARDBOARD · BOARDROOM
  { word1: 'OUT', word2: 'WALK', answers: ['SIDE'] },         // OUTSIDE · SIDEWALK
  { word1: 'DRAGON', word2: 'AWAY', answers: ['FLY'] },       // DRAGONFLY · FLYAWAY
  { word1: 'ARM', word2: 'MAN', answers: ['CHAIR'] },         // ARMCHAIR · CHAIRMAN
  { word1: 'BACK', word2: 'AGE', answers: ['PACK'] },         // BACKPACK · PACKAGE
  { word1: 'NECK', word2: 'BREAK', answers: ['TIE'] },        // NECKTIE · TIEBREAK
  { word1: 'SWORD', word2: 'CAKE', answers: ['FISH'] },       // SWORDFISH · FISHCAKE
  { word1: 'BUTTER', word2: 'CAKE', answers: ['CUP'] },       // BUTTERCUP · CUPCAKE
  { word1: 'FINGER', word2: 'OUT', answers: ['PRINT'] },      // FINGERPRINT · PRINTOUT
  { word1: 'SHOE', word2: 'WORK', answers: ['LACE'] },        // SHOELACE · LACEWORK
  { word1: 'WORK', word2: 'LIFT', answers: ['SHOP'] },        // WORKSHOP · SHOPLIFT
  { word1: 'SAND', word2: 'PIPE', answers: ['BAG'] },         // SANDBAG · BAGPIPE
  { word1: 'PASS', word2: 'PLAY', answers: ['WORD'] },        // PASSWORD · WORDPLAY
  { word1: 'LAND', word2: 'DOWN', answers: ['MARK'] },        // LANDMARK · MARKDOWN
  { word1: 'OVER', word2: 'WORD', answers: ['PASS'] },        // OVERPASS · PASSWORD
  { word1: 'GATE', word2: 'SIDE', answers: ['WAY'] },         // GATEWAY · WAYSIDE
  { word1: 'BACK', word2: 'SHOW', answers: ['SLIDE'] },       // BACKSLIDE · SLIDESHOW
  { word1: 'OVER', word2: 'GOWN', answers: ['NIGHT'] },       // OVERNIGHT · NIGHTGOWN
  { word1: 'DAY', word2: 'DOWN', answers: ['BREAK'] },        // DAYBREAK · BREAKDOWN
  { word1: 'UNDER', word2: 'WORK', answers: ['GROUND'] },     // UNDERGROUND · GROUNDWORK
  { word1: 'EYE', word2: 'BEAT', answers: ['BROW'] },         // EYEBROW · BROWBEAT
  { word1: 'SUN', word2: 'OUT', answers: ['BURN'] },          // SUNBURN · BURNOUT
  { word1: 'PLAY', word2: 'WORK', answers: ['GROUND'] },      // PLAYGROUND · GROUNDWORK
  { word1: 'NECK', word2: 'WORK', answers: ['LACE'] },        // NECKLACE · LACEWORK
  { word1: 'FLASH', word2: 'PACK', answers: ['BACK'] },       // FLASHBACK · BACKPACK
]

// Auto-generated puzzles (run `cd backend && python generate_puzzles.py` to populate).
import { GENERATED_PUZZLES } from './puzzles_generated'

export const ALL_PUZZLES: Puzzle[] = [...HAND_PUZZLES, ...GENERATED_PUZZLES]
