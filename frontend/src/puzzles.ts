export interface Puzzle {
  word1: string
  word2: string
  answer: string
}

// Hand-curated puzzles.
// WORD1 + answer = compound word  |  answer + WORD2 = compound word
// e.g. FIRE + WORK + SHOP → FIREWORK · WORKSHOP
const HAND_PUZZLES: Puzzle[] = [
  { word1: 'FIRE', word2: 'SHOP', answer: 'WORK' },        // FIREWORK · WORKSHOP
  { word1: 'EYE', word2: 'PARK', answer: 'BALL' },         // EYEBALL · BALLPARK
  { word1: 'HAND', word2: 'DOWN', answer: 'SHAKE' },       // HANDSHAKE · SHAKEDOWN
  { word1: 'OVER', word2: 'OUT', answer: 'LOOK' },         // OVERLOOK · LOOKOUT
  { word1: 'SUN', word2: 'POT', answer: 'FLOWER' },        // SUNFLOWER · FLOWERPOT
  { word1: 'BOOK', word2: 'WORK', answer: 'CASE' },        // BOOKCASE · CASEWORK
  { word1: 'DOOR', word2: 'BOY', answer: 'BELL' },         // DOORBELL · BELLBOY
  { word1: 'BUTTER', word2: 'WHEEL', answer: 'FLY' },      // BUTTERFLY · FLYWHEEL
  { word1: 'FOOT', word2: 'BOOK', answer: 'NOTE' },        // FOOTNOTE · NOTEBOOK
  { word1: 'HEAD', word2: 'HOUSE', answer: 'LIGHT' },      // HEADLIGHT · LIGHTHOUSE
  { word1: 'TOOTH', word2: 'FIRE', answer: 'BRUSH' },      // TOOTHBRUSH · BRUSHFIRE
  { word1: 'SNOW', word2: 'ROOM', answer: 'BALL' },        // SNOWBALL · BALLROOM
  { word1: 'MASTER', word2: 'SET', answer: 'MIND' },       // MASTERMIND · MINDSET
  { word1: 'OVER', word2: 'TABLE', answer: 'TIME' },       // OVERTIME · TIMETABLE
  { word1: 'BACK', word2: 'WORK', answer: 'GROUND' },      // BACKGROUND · GROUNDWORK
  { word1: 'WATER', word2: 'OUT', answer: 'FALL' },        // WATERFALL · FALLOUT
  { word1: 'BIRTH', word2: 'DREAM', answer: 'DAY' },       // BIRTHDAY · DAYDREAM
  { word1: 'SAND', word2: 'WALL', answer: 'STONE' },       // SANDSTONE · STONEWALL
  { word1: 'BOOK', word2: 'HOLE', answer: 'WORM' },        // BOOKWORM · WORMHOLE
  { word1: 'DOOR', word2: 'LADDER', answer: 'STEP' },      // DOORSTEP · STEPLADDER
  { word1: 'STAR', word2: 'BOWL', answer: 'FISH' },        // STARFISH · FISHBOWL
  { word1: 'CAMP', word2: 'PLACE', answer: 'FIRE' },       // CAMPFIRE · FIREPLACE
  { word1: 'BLACK', word2: 'HOUSE', answer: 'BIRD' },      // BLACKBIRD · BIRDHOUSE
  { word1: 'HAIR', word2: 'BACK', answer: 'CUT' },         // HAIRCUT · CUTBACK
  { word1: 'BUTTER', word2: 'MAN', answer: 'MILK' },       // BUTTERMILK · MILKMAN
  { word1: 'THUNDER', word2: 'HOLE', answer: 'BOLT' },     // THUNDERBOLT · BOLTHOLE
  { word1: 'CARD', word2: 'ROOM', answer: 'BOARD' },       // CARDBOARD · BOARDROOM
  { word1: 'OUT', word2: 'WALK', answer: 'SIDE' },         // OUTSIDE · SIDEWALK
  { word1: 'DRAGON', word2: 'AWAY', answer: 'FLY' },       // DRAGONFLY · FLYAWAY
  { word1: 'ARM', word2: 'MAN', answer: 'CHAIR' },         // ARMCHAIR · CHAIRMAN
  { word1: 'BACK', word2: 'AGE', answer: 'PACK' },         // BACKPACK · PACKAGE
  { word1: 'NECK', word2: 'BREAK', answer: 'TIE' },        // NECKTIE · TIEBREAK
  { word1: 'SWORD', word2: 'CAKE', answer: 'FISH' },       // SWORDFISH · FISHCAKE
  { word1: 'BUTTER', word2: 'CAKE', answer: 'CUP' },       // BUTTERCUP · CUPCAKE
  { word1: 'FINGER', word2: 'OUT', answer: 'PRINT' },      // FINGERPRINT · PRINTOUT
  { word1: 'SHOE', word2: 'WORK', answer: 'LACE' },        // SHOELACE · LACEWORK
  { word1: 'WORK', word2: 'LIFT', answer: 'SHOP' },        // WORKSHOP · SHOPLIFT
  { word1: 'SAND', word2: 'PIPE', answer: 'BAG' },         // SANDBAG · BAGPIPE
  { word1: 'PASS', word2: 'PLAY', answer: 'WORD' },        // PASSWORD · WORDPLAY
  { word1: 'LAND', word2: 'DOWN', answer: 'MARK' },        // LANDMARK · MARKDOWN
  { word1: 'OVER', word2: 'WORD', answer: 'PASS' },        // OVERPASS · PASSWORD
  { word1: 'GATE', word2: 'SIDE', answer: 'WAY' },         // GATEWAY · WAYSIDE
  { word1: 'BACK', word2: 'SHOW', answer: 'SLIDE' },       // BACKSLIDE · SLIDESHOW
  { word1: 'OVER', word2: 'GOWN', answer: 'NIGHT' },       // OVERNIGHT · NIGHTGOWN
  { word1: 'DAY', word2: 'DOWN', answer: 'BREAK' },        // DAYBREAK · BREAKDOWN
  { word1: 'UNDER', word2: 'WORK', answer: 'GROUND' },     // UNDERGROUND · GROUNDWORK
  { word1: 'EYE', word2: 'BEAT', answer: 'BROW' },         // EYEBROW · BROWBEAT
  { word1: 'SUN', word2: 'OUT', answer: 'BURN' },          // SUNBURN · BURNOUT
  { word1: 'PLAY', word2: 'WORK', answer: 'GROUND' },      // PLAYGROUND · GROUNDWORK
  { word1: 'NECK', word2: 'WORK', answer: 'LACE' },        // NECKLACE · LACEWORK
  { word1: 'FLASH', word2: 'PACK', answer: 'BACK' },       // FLASHBACK · BACKPACK
]

// Auto-generated puzzles (run `cd backend && python generate_puzzles.py` to populate).
import { GENERATED_PUZZLES } from './puzzles_generated'

export const ALL_PUZZLES: Puzzle[] = [...HAND_PUZZLES, ...GENERATED_PUZZLES]
