// La scena di gioco: la notte intera. Il gatto si muove, i nemici arrivano secondo la tabella delle ondate
// (piccioni, poi zanzare, pantegane e cornacchie in picchiata), a un terzo e a due terzi della notte arrivano
// i due capi (il gabbiano che carica, il gabbiano reale che urla), le armi partono
// da sole (graffio, coda a frusta, pelo che vola, miagolio), le crocchette fanno salire di livello e a ogni livello si sceglie
// una carta (LevelUpScene); ogni tanto un nemico eliminato lascia un supplì, che cura; le casse del tesoro mostrano le carte vinte (ChestScene). Il gatto ha sette vite; all'alba, dopo la durata scelta nel titolo (5, 10 o 15 minuti),
// si vince (EndScene).
// Le regole stanno in src/logic/ e sono testate; i numeri in src/data/; qui si disegna e si collega.
//
// Contenuti:
// - campi: lo stato della partita
// - init, create, createStill, createPlay: la durata dal titolo, la scena ferma della misura o la partita
// - createAnimations, makeStreetTexture, createInput, createHud: animazioni, strada infinita con erba e tombino, comandi, interfaccia
// - update e regenerate, moveCat, moveEnemies (con la picchiata della cornacchia e le spinte leggere tra nemici), moveFlocks e recallFlock (i gruppi che restano gruppi: stormo, sciame, fila), walk (chi cammina da solo), crowdPushes, kindOf, scream (l'urlo del reale), recall e spawnCenter (chi è rimasto lontano torna vicino), moveKibbles, expireFur, scrollWorld, spawnOnSchedule (le orde): un fotogramma di gioco
// - spawnGroup, hordePoint, dress: un gruppo di nemici di un tipo, dal lato dell'onda; lo sprite del pool rivestito da capo
// - i capi: spawnBossOnSchedule, spawnBoss, makeRoom, e più sotto dropBossChest, drawBossBars, hurt
// - le armi: fireWeapons, scratch, tail, fur, furHit, meow (l'onda che spinge via), damageEnemy, killEnemy
// - crescere: collect, openLevelUp, pullAllKibbles, applyCard, gainCard
// - il supplì a terra: dropSnack, moveSnacks, eatSnack
// - casse e mappa: spawnChestOnSchedule, takeChest, onChestClosed, drawMinimap, openMap
// - vite, pausa e fine: onTouch (la folla fa male), hurt, afterHit, loseLife, onResume, openPause, endRun; una scena
//   sopra la partita alla volta (halt)
// - l'interfaccia: drawHud, drawJoystick, createDebug, updateDebug
import * as Phaser from "phaser";
import { CARDS, FALLBACK_CARDS } from "../data/cards";
import {
  BOSS, BOSS_ORDER, BOSSES, CARD_WEIGHTS, CAT, CHEST, CROWD, ENEMIES, FALLBACK, FUR_LEVELS, HORDE, KIBBLE, MEOW, MEOW_LEVELS, PIGEON,
  RUN, SCRATCH_LEVELS, SNACK, SPAWN, TAIL_LEVELS,
  type BossId, type EnemyId, type EnemyKind, type FoeKind, type GroupConfig, type ScreamConfig,
} from "../data/balance";
import { BOSS_TEXTS, TEXTS } from "../data/texts";
import { inArc } from "../logic/arc";
import { bossHealth, dueBoss } from "../logic/boss";
import { drawCards, luckyWeights } from "../logic/cards";
import { chestPoint, chestTimes, openChest } from "../logic/chest";
import { diveStep, startDive, type DiveState } from "../logic/dive";
import { dashStep, peckStep, startDash, startPeck, zigzag, type DashState, type PeckState } from "../logic/patterns";
import { formatClock } from "../logic/clock";
import { createHalt, type Halt } from "../logic/halt";
import { inReach, knockback } from "../logic/knockback";
import { DEFAULT_NIGHT } from "../logic/night";
import { contactHit, createHealth, heal, isDead, protect, regenerate, takeHit, type Health } from "../logic/health";
import { chase, joystickVector, keyboardVector, type Vec } from "../logic/movement";
import { toMinimap } from "../logic/minimap";
import { addXp, xpToNext, type XpState } from "../logic/progression";
import { createRng, type Rng } from "../logic/rng";
import { inScream, screamStep, startScream, windupProgress, type ScreamState } from "../logic/scream";
import { crowding, largestClump, separation, withPush } from "../logic/separation";
import { dropsSnack, isHungry } from "../logic/snack";
import { nextSide, sidePoint, spawnPoint, tooFar, type Side } from "../logic/spawn";
import { centroid, flockSlot, followSlot, groupPushes, groupRadius, swarmSlot, trailTarget } from "../logic/flock";
import { computeStats, tuneWeapon, type Stats } from "../logic/stats";
import { farthestIndex, preferredIndex } from "../logic/targeting";
import { dueSpawns, hordeTime, scaleRow, spawnPlan } from "../logic/waves";
import type { ChestData } from "./ChestScene";
import { toggleFullscreen } from "./fullscreen";
import { hintDone } from "../logic/hint";
import { alignedPosition } from "../logic/pixelAlign";
import type { EndData } from "./EndScene";
import type { LevelUpData } from "./LevelUpScene";
import type { MapData } from "./MapScene";
import { FONT } from "./font";

type Sprite = Phaser.Physics.Arcade.Sprite;

// la spinta di chi non ne riceve: in mira, in picchiata, o senza vicini
const NO_PUSH: Vec = { x: 0, y: 0 };
// Lo stato comune di un gruppo: lo scatto della fila di pantegane, la sosta dello stormo di piccioni, e un numero
// suo tra 0 e 1 (phase), così due gruppi non ondeggiano e non beccano nello stesso istante.
interface FlockState {
  dash: DashState;
  peck: PeckState;
  phase: number;
}
// lo spazio tra chi nasce insieme in un gruppo senza forma sua (le cornacchie): come la scatola della pantegana
const LOOSE_SPACING = 14;
// di quanto al massimo un gruppo riportato vicino nasce più in fuori: con 70 il centro resta sotto i 420 pixel del
// ritorno (SPAWN.recallDistance) anche nell'angolo della cornice, a circa 394 (margine 32 + 140: 326 e 221 dal centro)
const RECALL_SPREAD = 70;
// Una riga del diario dei capi, per il debug: tempi in millisecondi di notte.
interface BossLogEntry {
  id: BossId;
  nato: number;
  caduto: number | null;
  vita: number;
  richiami: number;
}

// Il joystick che compare sotto il pollice: quanto spingere per la velocità piena, in pixel della scena.
const JOYSTICK_RADIUS = 24;
// Distanza dai bordi per tutto ciò che sta fisso sullo schermo: sul telefono gli angoli sono arrotondati
// e in orizzontale c'è il foro della fotocamera (lezione della scritta di prova della tappa 1b).
const SAFE = 12;
// Le cose fisse sullo schermo con i bordi su pixel interi, perché non tremino mentre la telecamera segue il gatto
// (src/logic/pixelAlign.ts). x e y sono quelle volute, con l'origine già scelta; il testo va rimesso dopo setText.
type Pinnable = { width: number; height: number; originX: number; originY: number; setPosition(x: number, y: number): unknown };
function pin<T extends Pinnable>(o: T, x: number, y: number): T {
  o.setPosition(alignedPosition(x, o.width, o.originX), alignedPosition(y, o.height, o.originY));
  return o;
}
// Il lampione si ripete ogni tanto, in un punto diverso di ogni riquadro di strada.
const LAMP_CHUNK = { width: 320, height: 240 };
// Il pulsante della pausa, in alto a destra: grande abbastanza per il pollice.
const PAUSE_SIZE = 18;
// I ciuffi spariscono poco oltre il bordo dello schermo.
const FUR_MARGIN = 16;
// La minimappa, a destra sotto i nemici presi: 20 pixel dal centro al bordo, per 400 pixel di mondo.
// Si tocca (o M) per la mappa grande.
const MINIMAP = { half: 20, range: 400 };
// L'anello del miagolio, nell'ultimo fotogramma, arriva a 13 pixel e mezzo dal centro del suo disegno da 32:
// lo sprite si ingrandisce di raggio diviso questo numero, così l'anello che si vede è il bordo vero dell'onda.
const MEOW_RING = 13.5;
// La barra della vita di un capo, in basso al centro: larga abbastanza da vederla calare.
const BOSS_BAR = { width: 120, height: 5 };

export class GameScene extends Phaser.Scene {
  private cat!: Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private kibbles!: Phaser.Physics.Arcade.Group;
  private furs!: Phaser.Physics.Arcade.Group;
  private chests!: Phaser.Physics.Arcade.Group;
  private snacks!: Phaser.Physics.Arcade.Group;
  private minimap!: Phaser.GameObjects.Graphics;
  private minimapCenter: Vec = { x: 0, y: 0 };
  private effects!: Phaser.GameObjects.Group;
  private ground!: Phaser.GameObjects.TileSprite;
  private lamps: Phaser.GameObjects.Image[] = [];
  private hud!: Phaser.GameObjects.Graphics;
  // i capi: i cerchi dell'urlo nel mondo, le barre della vita fisse sullo schermo con il nome sopra
  private bossFx!: Phaser.GameObjects.Graphics;
  private bossBars!: Phaser.GameObjects.Graphics;
  private bossNames: Phaser.GameObjects.Text[] = [];
  private hearts: Phaser.GameObjects.Image[] = [];
  private levelText!: Phaser.GameObjects.Text;
  private clockText!: Phaser.GameObjects.Text;
  private killsText!: Phaser.GameObjects.Text;
  private hintText: Phaser.GameObjects.Text | null = null;
  // il gatto si è mosso almeno una volta: la scritta d'inizio ha fatto il suo lavoro
  private moved = false;
  private joystickGfx!: Phaser.GameObjects.Graphics;
  private keys!: Record<"up" | "down" | "left" | "right" | "w" | "a" | "s" | "d", Phaser.Input.Keyboard.Key>;

  private health: Health = createHealth(CAT.maxHealth);
  private lives = RUN.lives;
  private livesLost = 0;
  private xp: XpState = { level: 1, xp: 0 };
  // a che livello è ogni carta presa, per id
  private levels: Record<string, number> = {};
  private stats: Stats = computeStats({});
  private rng: Rng = Math.random;
  // il supplì ha un dado suo: non prende numeri dalla fila di nascite e carte
  private snackRng: Rng = Math.random;
  // quando è caduto l'ultimo supplì (in millisecondi di notte), quanti ne sono caduti e quanti mangiati
  private lastSnackAt = -Infinity;
  private snacksDropped = 0;
  private snacksEaten = 0;
  private pendingLevels = 0;
  // chi tiene ferma la partita (scelta al livello, cassa, pausa, mappa): una scena sopra alla volta
  private halt: Halt = createHalt();
  // l'ultima direzione in cui il gatto si è mosso, in radianti: la coda a frusta colpisce da quella parte
  private facing = 0;
  private nextFire = { scratch: 0, tail: 0, fur: 0, meow: 0 };
  // il tempo di notte passato, in millisecondi di gioco: si ferma con la pausa e con la scelta delle carte;
  // è anche l'orologio di armi, ciuffi e invulnerabilità
  private elapsed = 0;
  private duration = RUN.durationMs;
  // i minuti della notte scelti nel titolo (3 con ?corta): decidono la durata e quale record si gioca
  private nightMinutes = DEFAULT_NIGHT;
  // per ogni tipo di nemico, da che momento dell'orologio delle orde tocca di nuovo a lui (dueSpawns, hordeTime)
  private nextSpawnAt: Partial<Record<EnemyId, number>> = {};
  // l'onda di adesso: quale giro di HORDE.cycleMs e da che lato arriva
  private hordeCycle = -1;
  private hordeSide: Side = "left";
  // i gruppi vivi (src/logic/flock.ts): per ognuno il passo comune, lo scatto della fila o la sosta dello stormo
  private flocks = new Map<number, FlockState>();
  private nextFlock = 0;
  // quando nascono le casse di questa notte (chestTimes), e quante ne sono già nate
  private chestSchedule: number[] = [];
  private chestsSpawned = 0;
  private chestsTaken = 0;
  // i capi vivi adesso, quanti ne sono nati, e il diario per il debug (quando è nato e quando è caduto ognuno,
  // quanta vita gli resta, quante volte è stato riportato vicino)
  private bosses: Sprite[] = [];
  private bossesSpawned = 0;
  // quanti nemici sono nati: dà a ognuno un numero suo (jitter), così un gruppo nato insieme non ondeggia e non si
  // ferma a beccare tutto nello stesso istante
  private born = 0;
  private bossLog: BossLogEntry[] = [];
  private points = 0;
  private kills = 0;
  // quante volte un nemico rimasto lontano è stato riportato vicino: si legge solo nel debug
  private recalls = 0;
  // quanti nemici ha spinto via il miagolio: anche questo si legge solo nel debug
  private pushes = 0;
  private joystick: { pointerId: number; start: Vec; current: Vec } | null = null;
  private over = false;
  private invincible = false;
  private debugText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super("Game");
  }

  // create: costruisce la scena, una volta per partita.
  init(data?: { minutes?: number }) {
    this.nightMinutes = data?.minutes ?? DEFAULT_NIGHT;
  }

  create() {
    this.over = false;
    this.health = createHealth(CAT.maxHealth);
    this.lives = RUN.lives;
    this.livesLost = 0;
    this.xp = { level: 1, xp: 0 };
    this.levels = {};
    this.stats = computeStats({});
    this.pendingLevels = 0;
    this.halt = createHalt();
    this.facing = 0;
    this.elapsed = 0;
    this.nextSpawnAt = {};
    this.hordeCycle = -1;
    this.hordeSide = "left";
    this.flocks = new Map();
    this.nextFlock = 0;
    this.chestsTaken = 0;
    this.chestsSpawned = 0;
    this.lastSnackAt = -Infinity;
    this.snacksDropped = 0;
    this.snacksEaten = 0;
    this.bosses = [];
    this.bossesSpawned = 0;
    this.born = 0;
    this.bossLog = [];
    this.bossNames = [];
    this.points = 0;
    this.kills = 0;
    this.recalls = 0;
    this.pushes = 0;
    this.joystick = null;
    this.lamps = [];
    this.hearts = [];
    this.debugText = null;
    this.hintText = null;
    this.moved = false;
    this.invincible = false;

    if (this.registry.get("misura")) {
      this.createStill();
      // Un segno sul canvas per la prova di fumo (tests/e2e): la scena ferma è costruita.
      this.game.canvas.dataset.scena = "pronta";
    } else {
      this.createPlay();
      this.game.canvas.dataset.scena = "partita";
    }
  }

  // La scena ferma della tappa 1a, per la misura con ?misura: il gatto sotto il lampione e niente altro.
  private createStill() {
    const { width, height } = this.scale;
    this.add.tileSprite(0, 0, width, height, "casella").setOrigin(0, 0);
    for (const [x, y] of [[96, 64], [352, 176], [224, 224]]) this.add.image(x, y, "tombino").setOrigin(0, 0);
    for (const [x, y] of [[48, 192], [416, 48], [304, 96]]) this.add.image(x, y, "erba").setOrigin(0, 0);
    this.add.image(width / 2 + 16, height / 2 - 16, "lampione");
    this.add.sprite(width / 2, height / 2, "gatto", 0);
  }

  private createPlay() {
    const { width, height } = this.scale;
    const params = new URLSearchParams(location.search);
    this.createAnimations();
    // Il seme: con ?seme=123 nell'indirizzo la partita estrae sempre le stesse carte e le stesse nascite.
    const seedParam = params.get("seme");
    const seed = seedParam ? Number(seedParam) : Date.now();
    this.rng = createRng(seed);
    // lo stesso seme, mescolato con un numero fisso: un secondo dado, che non prende numeri dal primo
    this.snackRng = createRng(seed ^ 0x5bd1e995);
    // La durata scelta nel titolo; per provare, con ?corta la notte dura 3 minuti qualunque sia la scelta.
    // Le ondate seguono la frazione di notte passata (spawnPlan): in 5 minuti arrivano alla stessa ondata finale dei 15.
    if (params.has("corta")) this.nightMinutes = RUN.shortDurationMs / 60_000;
    this.duration = this.nightMinutes * 60_000;
    this.chestSchedule = chestTimes(this.duration, CHEST.perNight);

    // Il terreno: una striscia di strada con tombino ed erba, ripetuta all'infinito.
    // È fisso sullo schermo e scorre il disegno, invece di muoversi: così la strada non finisce mai.
    this.ground = this.add.tileSprite(0, 0, width, height, this.makeStreetTexture()).setOrigin(0, 0).setScrollFactor(0);
    for (let i = 0; i < 9; i++) this.lamps.push(this.add.image(0, 0, "lampione").setDepth(1));

    this.cat = this.physics.add.sprite(0, 0, "gatto", 0);
    this.cat.setSize(10, 10).setDepth(10);
    this.cameras.main.startFollow(this.cat, true);

    // I pool: gruppi con un tetto. Gli oggetti si prendono con get() e si rimettono via con disableBody,
    // senza crearli e distruggerli ogni volta.
    this.enemies = this.physics.add.group({ maxSize: SPAWN.maxEnemies });
    this.kibbles = this.physics.add.group({ maxSize: KIBBLE.maxOnGround });
    this.snacks = this.physics.add.group({ maxSize: SNACK.maxOnGround });
    this.furs = this.physics.add.group({ maxSize: 60 });
    // un posto in più per ogni capo: la sua cassa nasce anche se due stanno già aspettando
    this.chests = this.physics.add.group({ maxSize: CHEST.maxOnGround + BOSS_ORDER.length });
    this.effects = this.add.group({ maxSize: 60 });
    this.bossFx = this.add.graphics().setDepth(3);

    // Chi urta chi: solo queste cinque coppie, perché Arcade controlla soltanto le coppie dichiarate. I nemici tra
    // loro non si urtano (si scostano con le spinte leggere di moveEnemies), e graffio, coda e miagolio colpiscono
    // con i loro conti, non con la fisica. Le categorie di collisione di Phaser (setCollisionCategory) filtrano solo
    // dentro una coppia già dichiarata: qui non toglierebbero niente.
    this.physics.add.overlap(this.cat, this.enemies, (_c, enemy) => this.onTouch(enemy as Sprite));
    this.physics.add.overlap(this.cat, this.kibbles, (_c, kibble) => this.collect(kibble as Sprite));
    this.physics.add.overlap(this.cat, this.snacks, (_c, snack) => this.eatSnack(snack as Sprite));
    this.physics.add.overlap(this.cat, this.chests, (_c, chest) => this.takeChest(chest as Sprite));
    this.physics.add.overlap(this.furs, this.enemies, (fur, enemy) => this.furHit(fur as Sprite, enemy as Sprite));
    this.nextFire = { scratch: 0, tail: 0, fur: 0, meow: 0 };

    this.events.off("card-picked");
    this.events.on("card-picked", (id: string) => this.applyCard(id));
    this.events.off("chest-closed");
    this.events.on("chest-closed", () => this.onChestClosed());
    // dopo una carta o una pausa la partita riprende: un attimo di protezione per riprendere in mano il gatto
    this.events.off(Phaser.Scenes.Events.RESUME, this.onResume, this);
    this.events.on(Phaser.Scenes.Events.RESUME, this.onResume, this);
    // quando la scheda o l'app passano in secondo piano, la partita si mette in pausa da sola
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.openPause, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off(Phaser.Core.Events.HIDDEN, this.openPause, this));

    this.createInput();
    this.createHud();
    if (params.has("debug")) this.createDebug();
  }

  private createAnimations() {
    if (this.anims.exists("gatto-cammina")) return;
    const strip = (key: string, start: number, end: number) => this.anims.generateFrameNumbers(key, { start, end });
    this.anims.create({ key: "gatto-cammina", frames: strip("gatto", 1, 4), frameRate: 10, repeat: -1 });
    this.anims.create({ key: "piccione-cammina", frames: strip("piccione", 0, 1), frameRate: 4, repeat: -1 });
    this.anims.create({ key: "zanzara-cammina", frames: strip("zanzara", 0, 1), frameRate: 12, repeat: -1 });
    this.anims.create({ key: "pantegana-cammina", frames: strip("pantegana", 0, 1), frameRate: 6, repeat: -1 });
    // il gabbiano batte le ali mentre si avvicina; il gabbiano reale ha due pose, fermo e urla, scelte in scream
    this.anims.create({ key: "gabbiano-cammina", frames: strip("gabbiano", 0, 1), frameRate: 5, repeat: -1 });
    // la cornacchia non ha un'animazione: un fotogramma in volo e uno in picchiata, scelti in moveEnemies
    this.anims.create({ key: "crocchetta-brilla", frames: strip("crocchetta", 0, 1), frameRate: 2, repeat: -1 });
    this.anims.create({ key: "cassa-brilla", frames: strip("cassa", 0, 1), frameRate: 2, repeat: -1 });
    // il supplì: fermo, poi con la croce rossa della cura sopra
    this.anims.create({ key: "suppli-brilla", frames: strip("suppli", 0, 1), frameRate: 2, repeat: -1 });
    this.anims.create({ key: "graffio", frames: strip("graffio", 0, 2), frameRate: 15, repeat: 0 });
    this.anims.create({ key: "coda", frames: strip("coda", 0, 2), frameRate: 15, repeat: 0 });
    this.anims.create({ key: "pelo-vola", frames: strip("pelo", 0, 1), frameRate: 8, repeat: -1 });
    this.anims.create({ key: "miagolio", frames: strip("miagolio", 0, 2), frameRate: 12, repeat: 0 });
  }

  // Disegna una volta sola la striscia di strada: sampietrini, un tombino e due ciuffi d'erba con la crepa.
  private makeStreetTexture(): string {
    const key = "strada";
    if (this.textures.exists(key)) return key;
    const cols = 12;
    const rows = 9;
    const canvas = this.textures.createCanvas(key, cols * 16, rows * 16);
    if (!canvas) return "casella";
    const ctx = canvas.getContext();
    const img = (k: string) => this.textures.get(k).getSourceImage() as CanvasImageSource;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) ctx.drawImage(img("casella"), x * 16, y * 16);
    ctx.drawImage(img("tombino"), 7 * 16, 2 * 16);
    ctx.drawImage(img("erba"), 2 * 16, 6 * 16);
    ctx.drawImage(img("erba"), 10 * 16, 7 * 16);
    canvas.refresh();
    return key;
  }

  private createInput() {
    const kb = this.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys({
        up: "UP", down: "DOWN", left: "LEFT", right: "RIGHT", w: "W", a: "A", s: "S", d: "D",
      }) as typeof this.keys;
      // Esc tenuto premuto (in Chrome si esce così dallo schermo intero) manda ripetizioni: non contano
      kb.on("keydown-ESC", (e: KeyboardEvent) => {
        if (!e.repeat) this.openPause();
      });
      kb.on("keydown-P", this.openPause, this);
      kb.on("keydown-M", this.openMap, this);
      kb.on("keydown-F", () => toggleFullscreen(this));
    }
    // Due dita insieme: uno sul joystick, l'altro libero per la pausa.
    this.input.addPointer(1);
    this.joystickGfx = this.add.graphics().setScrollFactor(0).setDepth(90);
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      // in tutto lo schermo, a destra o a sinistra: pausa e pulsanti di debug fermano il tocco prima che arrivi qui
      if (this.over || this.joystick) return;
      this.joystick = { pointerId: p.id, start: { x: p.x, y: p.y }, current: { x: p.x, y: p.y } };
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (this.joystick?.pointerId === p.id) this.joystick.current = { x: p.x, y: p.y };
    });
    const release = (p: Phaser.Input.Pointer) => {
      if (this.joystick?.pointerId === p.id) this.joystick = null;
    };
    this.input.on("pointerup", release);
    this.input.on("pointerupoutside", release);
  }

  // L'interfaccia, tutta lontana dagli angoli: vita, esperienza, livello e cuori a sinistra; l'orologio in alto
  // al centro; pausa e nemici presi a destra; la riga dei primi secondi in basso.
  private createHud() {
    const { width, height } = this.scale;
    // un fondo scuro mezzo trasparente: barre e livello si leggono anche sopra la luce di un lampione
    this.add.rectangle(SAFE - 4, SAFE - 4, 96, 34, 0x0e0c16, 0.55).setOrigin(0, 0).setScrollFactor(0).setDepth(99);
    this.hud = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.levelText = this.add.text(SAFE + 64, SAFE - 1, "", FONT).setScrollFactor(0).setDepth(100);
    for (let i = 0; i < RUN.lives; i++) {
      this.hearts.push(pin(this.add.image(0, 0, "vita").setScrollFactor(0).setDepth(100), SAFE + 5 + i * 11, SAFE + 21));
    }
    this.clockText = pin(this.add.text(0, 0, "00:00", { ...FONT, fontSize: "16px" }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100), width / 2, SAFE);

    const px = width - SAFE - PAUSE_SIZE;
    const pause = this.add.rectangle(px, SAFE, PAUSE_SIZE, PAUSE_SIZE, 0x0e0c16, 0.7).setOrigin(0, 0).setStrokeStyle(1, 0xcfe0ff).setScrollFactor(0).setDepth(100).setInteractive();
    this.add.rectangle(px + 6, SAFE + 5, 2, 8, 0xffffff).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
    this.add.rectangle(px + 10, SAFE + 5, 2, 8, 0xffffff).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
    pause.on("pointerdown", (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.openPause();
    });
    pin(this.add.image(0, 0, "uccisioni").setScrollFactor(0).setDepth(100), width - SAFE - 6, SAFE + PAUSE_SIZE + 12);
    this.killsText = this.add.text(width - SAFE - 16, SAFE + PAUSE_SIZE + 8, "0", FONT).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    // la minimappa: un quadrato che si tocca per la mappa grande; il tocco non arriva al joystick
    this.minimapCenter = { x: width - SAFE - MINIMAP.half, y: SAFE + PAUSE_SIZE + 26 + MINIMAP.half };
    const side = MINIMAP.half * 2;
    const zone = this.add.rectangle(this.minimapCenter.x, this.minimapCenter.y, side + 6, side + 6, 0x000000, 0).setScrollFactor(0).setDepth(100).setInteractive();
    zone.on("pointerdown", (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.openMap();
    });
    this.minimap = this.add.graphics().setScrollFactor(0).setDepth(100);

    // le barre dei capi: due posti, uno sopra l'altro, in basso al centro; si vedono solo con un capo vivo
    this.bossBars = this.add.graphics().setScrollFactor(0).setDepth(100);
    for (let i = 0; i < BOSS_ORDER.length; i++) {
      this.bossNames.push(this.add.text(width / 2, height - SAFE - 9 - i * 18, "", { ...FONT, backgroundColor: "#0e0c16" }).setOrigin(0.5, 1).setPadding(3, 1, 3, 1).setScrollFactor(0).setDepth(100).setVisible(false));
    }

    this.hintText = pin(this.add.text(0, 0, TEXTS.hint, { ...FONT, backgroundColor: "#0e0c16" }).setOrigin(0.5, 1).setPadding(4, 3, 4, 3).setScrollFactor(0).setDepth(100), width / 2, height - SAFE - 8);
    this.drawHud();
  }

  update(_time: number, delta: number) {
    if (!this.cat || this.over) return;
    // L'orologio di tutto è il tempo della notte (elapsed): si ferma durante la scelta delle carte e la pausa
    // e corre quattro volte con «veloce», quindi armi, invulnerabilità, ciuffi e ondate restano d'accordo tra loro.
    // this.time.now no: è l'ora vera, che corre anche in pausa.
    const step = delta * this.time.timeScale;
    this.elapsed += step;
    const time = this.elapsed;
    if (this.elapsed >= this.duration) {
      this.endRun(true);
      return;
    }
    this.regenerate(step);
    this.moveCat(time);
    this.moveEnemies();
    this.moveKibbles();
    this.moveSnacks();
    this.expireFur();
    this.fireWeapons(time);
    this.spawnOnSchedule();
    this.spawnBossOnSchedule();
    this.spawnChestOnSchedule();
    this.scrollWorld();
    this.drawMinimap();
    this.drawBossBars();
    this.drawJoystick();
    pin(this.clockText.setText(formatClock(this.elapsed)), this.scale.width / 2, SAFE);
    if (this.hintText && hintDone(this.moved, this.elapsed, RUN.hintMs)) {
      // svanisce in un attimo invece di sparire di colpo
      const hint = this.hintText;
      this.hintText = null;
      this.tweens.add({ targets: hint, alpha: 0, duration: 300, onComplete: () => hint.destroy() });
    }
    if (this.debugText) this.updateDebug();
  }

  // pancia piena: la vita torna piano; la barra si ridisegna solo quando cambia di un punto
  private regenerate(ms: number) {
    const before = Math.floor(this.health.current);
    this.health = regenerate(this.health, this.stats.regenPerSecond, ms);
    if (Math.floor(this.health.current) !== before) this.drawHud();
  }

  private moveCat(time: number) {
    const dir = this.joystick
      ? joystickVector(this.joystick.start, this.joystick.current, JOYSTICK_RADIUS)
      : keyboardVector({
          left: !!(this.keys?.left.isDown || this.keys?.a.isDown),
          right: !!(this.keys?.right.isDown || this.keys?.d.isDown),
          up: !!(this.keys?.up.isDown || this.keys?.w.isDown),
          down: !!(this.keys?.down.isDown || this.keys?.s.isDown),
        });
    const speed = CAT.speed * this.stats.speedMultiplier;
    this.cat.setVelocity(dir.x * speed, dir.y * speed);
    if (dir.x !== 0 || dir.y !== 0) {
      this.moved = true;
      this.facing = Math.atan2(dir.y, dir.x);
      this.cat.anims.play("gatto-cammina", true);
      if (dir.x !== 0) this.cat.setFlipX(dir.x < 0);
    } else {
      this.cat.anims.stop();
      this.cat.setFrame(0);
    }
    // durante l'invulnerabilità il gatto lampeggia
    const blinking = time < this.health.invulnerableUntil;
    this.cat.setAlpha(blinking && Math.floor(time / 80) % 2 === 0 ? 0.3 : 1);
  }

  // Chi non ha un attacco suo cammina a modo suo (walk): la zanzara ondeggia, la pantegana va a scatti, il piccione
  // si ferma a beccare. Chi ha la picchiata (la cornacchia, e il
  // gabbiano con la sua carica) segue le fasi di src/logic/dive.ts e cambia fotogramma quando prende la mira e
  // si lancia. Il gabbiano reale segue quelle dell'urlo (scream, qui sotto).
  // Chi va verso il gatto riceve anche la spinta leggera dei vicini (crowdPushes): si scosta invece di finire
  // sopra un altro. In mira, in picchiata e spinti dal miagolio no: lì la strada è già decisa.
  private moveEnemies() {
    const target = { x: this.cat.x, y: this.cat.y };
    this.bossFx.clear();
    const pushes = this.crowdPushes();
    this.moveFlocks(target, pushes);
    for (const child of this.enemies.getChildren()) {
      const enemy = child as Sprite;
      // chi sta in un gruppo lo muove moveFlocks
      if (!enemy.active || enemy.getData("flock") !== null) continue;
      if (tooFar(enemy, target, SPAWN.recallDistance)) this.recall(enemy);
      // chi è stato spinto dal miagolio scivola all'indietro finché dura la spinta: qui nessuno gli cambia la velocità
      if (this.elapsed < ((enemy.getData("pushedUntil") as number | undefined) ?? 0)) continue;
      const from = { x: enemy.x, y: enemy.y };
      const speed = (enemy.getData("speed") as number | undefined) ?? PIGEON.speed;
      const kind = this.kindOf(enemy);
      if (kind.scream) {
        this.scream(enemy, kind.scream, from, target, speed);
        continue;
      }
      if (!kind.dive) {
        const v = this.walk(enemy, kind, from, target, speed);
        const moved = withPush(v, pushes.get(enemy) ?? NO_PUSH, speed, CROWD.push);
        enemy.setVelocity(moved.x, moved.y);
        // guarda il gatto, non dove lo spingono né dove ondeggia: così non si gira avanti e indietro. La pantegana
        // guarda dove corre, che in uno scatto è una linea dritta
        const look = kind.dash ? v.x : target.x - from.x;
        if (look !== 0) enemy.setFlipX(look < 0);
        continue;
      }
      const step = diveStep(enemy.getData("dive") as DiveState, from, target, this.elapsed, speed, kind.dive);
      enemy.setData("dive", step.state);
      // la spinta solo mentre si avvicina: in picchiata va a 190, e withPush la riporterebbe alla sua velocità
      if (step.state.phase === "approach") {
        const moved = withPush(step.velocity, pushes.get(enemy) ?? NO_PUSH, speed, CROWD.push);
        enemy.setVelocity(moved.x, moved.y);
      } else {
        enemy.setVelocity(step.velocity.x, step.velocity.y);
      }
      // chi ha un'animazione (il gabbiano) batte le ali mentre si avvicina; in mira e in picchiata il disegno
      // è fermo sul secondo fotogramma, e quello è l'avviso
      const flap = `${kind.key}-cammina`;
      if (step.state.phase === "approach" && this.anims.exists(flap)) {
        enemy.anims.play(flap, true);
      } else {
        const attacking = step.state.phase === "aim" || step.state.phase === "dive";
        enemy.anims.stop();
        enemy.setFrame(attacking ? 1 : 0);
      }
      // ferma, guarda il gatto; in volo, guarda dove va
      const lookX = step.velocity.x !== 0 ? step.velocity.x : target.x - from.x;
      enemy.setFlipX(lookX < 0);
    }
  }

  // I gruppi che restano gruppi (src/logic/flock.ts). Il gruppo ha un centro, la media dei vivi, che si muove a modo
  // suo: lo stormo cammina e becca tutto insieme, il centro dello sciame ondeggia verso il gatto, la prima della fila
  // decide lo scatto. Ognuno rincorre il suo posto: nello stormo intorno al centro, nello sciame girandogli intorno,
  // nella fila dietro a quella davanti. Un gruppo rimasto troppo lontano torna vicino tutto insieme.
  private moveFlocks(target: Vec, pushes: Map<Sprite, Vec>) {
    const members = new Map<number, Sprite[]>();
    for (const child of this.enemies.getChildren()) {
      const enemy = child as Sprite;
      const id = enemy.getData("flock") as number | null;
      if (!enemy.active || id === null) continue;
      const list = members.get(id);
      if (list) list.push(enemy);
      else members.set(id, [enemy]);
    }
    // i gruppi senza più nessuno vivo si dimenticano
    for (const id of this.flocks.keys()) if (!members.has(id)) this.flocks.delete(id);
    const live: { group: Sprite[]; state: FlockState; kind: FoeKind; cfg: GroupConfig; center: Vec; radius: number }[] = [];
    for (const [id, group] of members) {
      const state = this.flocks.get(id);
      const kind = this.kindOf(group[0]);
      const cfg = kind.group;
      if (!state || !cfg) continue;
      // in ordine di posto: la prima della fila è quella col posto più basso tra le vive
      group.sort((a, b) => (a.getData("slot") as number) - (b.getData("slot") as number));
      const center = centroid(group.map((e) => ({ x: e.x, y: e.y })));
      if (tooFar(center, target, SPAWN.recallDistance)) {
        this.recallFlock(group, center, state);
        continue;
      }
      // quanto è largo: lo stormo come la sua spirale, lo sciame come il suo giro; la fila stretta, così passa tra gli altri
      const radius = cfg.formation === "flock" ? groupRadius(group.length, cfg.spacing) : cfg.formation === "swarm" ? (cfg.radius ?? cfg.spacing) : cfg.spacing;
      live.push({ group, state, kind, cfg, center, radius });
    }
    const apart = groupPushes(live.map((g) => g.center), live.map((g) => g.radius), CROWD.groupGap);
    live.forEach(({ group, state, kind, cfg, center }, g) => {
      const speed = (group[0].getData("speed") as number | undefined) ?? kind.speed;
      const maxSpeed = speed * cfg.catchUp;
      // il passo comune del gruppo
      let pace: Vec;
      if (cfg.formation === "line" && kind.dash) {
        const step = dashStep(state.dash, { x: group[0].x, y: group[0].y }, target, this.elapsed, speed, kind.dash);
        state.dash = step.state;
        pace = step.velocity;
      } else if (cfg.formation === "swarm" && kind.zigzag) {
        pace = zigzag(center, target, speed, this.elapsed + state.phase * kind.zigzag.periodMs, kind.zigzag);
      } else if (kind.peck) {
        const step = peckStep(state.peck, this.elapsed, kind.peck, state.phase);
        state.peck = step.state;
        pace = step.moving ? chase(center, target, speed) : NO_PUSH;
      } else {
        pace = chase(center, target, speed);
      }
      // gli altri gruppi lo scostano: intorno al gatto i gruppi restano più staccati
      pace = withPush(pace, apart[g], speed, CROWD.push);
      // nello stormo i posti si centrano sui vivi: chi cade lascia un buco, non sposta il gruppo
      const slots = group.map((e) => flockSlot(e.getData("slot") as number, cfg.spacing));
      const mid = centroid(slots);
      group.forEach((enemy, i) => {
        // chi è stato spinto dal miagolio scivola all'indietro finché dura la spinta
        if (this.elapsed < ((enemy.getData("pushedUntil") as number | undefined) ?? 0)) return;
        const pos = { x: enemy.x, y: enemy.y };
        let v: Vec;
        if (cfg.formation === "line") {
          v = i === 0 ? pace : followSlot(pos, trailTarget(group[i - 1], pos, cfg.spacing), pace, maxSpeed, cfg.pull);
        } else if (cfg.formation === "swarm") {
          const orbit = swarmSlot(enemy.getData("slot") as number, this.elapsed, cfg.radius ?? cfg.spacing * 2, cfg.periodMs ?? 2500);
          v = followSlot(pos, { x: center.x + orbit.x, y: center.y + orbit.y }, pace, maxSpeed, cfg.pull);
        } else {
          v = followSlot(pos, { x: center.x + slots[i].x - mid.x, y: center.y + slots[i].y - mid.y }, pace, maxSpeed, cfg.pull);
        }
        const moved = withPush(v, pushes.get(enemy) ?? NO_PUSH, maxSpeed, CROWD.push);
        enemy.setVelocity(moved.x, moved.y);
        // guarda il gatto; la pantegana guarda dove corre
        const look = cfg.formation === "line" ? v.x : target.x - pos.x;
        if (look !== 0) enemy.setFlipX(look < 0);
      });
    });
  }

  // Un gruppo rimasto troppo lontano torna in un punto di nascita nuovo tutto insieme, con la sua forma: sono gli
  // stessi nemici, con la vita che avevano, solo spostati. Il punto va in fuori di quanto il gruppo è largo, come alla
  // nascita, perché nessuno spunti in vista; al massimo RECALL_SPREAD, così il centro resta sotto la distanza del
  // ritorno anche con una fila lunga o uno rimasto indietro, e non torna di nuovo al fotogramma dopo.
  private recallFlock(group: Sprite[], center: Vec, state: FlockState) {
    const spread = Math.min(RECALL_SPREAD, Math.max(...group.map((e) => Math.hypot(e.x - center.x, e.y - center.y))));
    const cam = this.cameras.main;
    const p = spawnPoint({ x: cam.midPoint.x, y: cam.midPoint.y }, this.scale.width / 2, this.scale.height / 2, SPAWN.margin + 2 * spread, this.rng);
    for (const enemy of group) enemy.body?.reset(enemy.x + p.x - center.x, enemy.y + p.y - center.y);
    state.dash = startDash();
    this.recalls += group.length;
  }

  // Come cammina chi non ha un attacco suo e non sta in un gruppo (src/logic/patterns.ts): la zanzara ondeggia, la
  // pantegana va a scatti, il piccione si ferma ogni tanto a beccare; chi non ha un modo suo va dritto sul gatto.
  private walk(enemy: Sprite, kind: FoeKind, from: Vec, target: Vec, speed: number): Vec {
    const jitter = (enemy.getData("jitter") as number | undefined) ?? 0;
    if (kind.zigzag) return zigzag(from, target, speed, this.elapsed + jitter * kind.zigzag.periodMs, kind.zigzag);
    if (kind.dash) {
      const step = dashStep((enemy.getData("dash") as DashState | undefined) ?? startDash(), from, target, this.elapsed, speed, kind.dash);
      enemy.setData("dash", step.state);
      return step.velocity;
    }
    if (kind.peck) {
      const step = peckStep((enemy.getData("peck") as PeckState | undefined) ?? startPeck(), this.elapsed, kind.peck, jitter);
      enemy.setData("peck", step.state);
      return step.moving ? chase(from, target, speed) : { x: 0, y: 0 };
    }
    return chase(from, target, speed);
  }

  // Le spinte leggere di questo fotogramma: per ogni nemico della folla (i capi no), quanto lo scostano i vicini.
  // Lunghe al massimo 1: moveEnemies le moltiplica per la velocità di ognuno e per CROWD.push.
  private crowdPushes(): Map<Sprite, Vec> {
    const crowd = this.crowd();
    const pushes = separation(crowd.map((e) => ({ x: e.x, y: e.y })), CROWD.radius, 1);
    const out = new Map<Sprite, Vec>();
    crowd.forEach((e, i) => out.set(e, pushes[i]));
    return out;
  }

  // Che nemico è questo sprite: un capo, uno dei quattro nemici, o il piccione di riserva.
  private kindOf(enemy: Sprite): FoeKind & { key: string; scream?: ScreamConfig } {
    const id = enemy.getData("kind") as string | undefined;
    return BOSSES[id as BossId] ?? ENEMIES[id as EnemyId] ?? PIGEON;
  }

  // Un passo del gabbiano reale: si avvicina, a tiro si ferma e carica l'urlo (secondo fotogramma, e il cerchio
  // rosso che si allarga fino al bordo dell'urlo è l'avviso), poi urla: il gatto dentro il raggio prende il colpo.
  private scream(boss: Sprite, cfg: ScreamConfig, from: Vec, target: Vec, speed: number) {
    const before = (boss.getData("scream") as ScreamState | undefined) ?? startScream();
    const step = screamStep(before, from, target, this.elapsed, speed, cfg);
    boss.setData("scream", step.state);
    boss.setVelocity(step.velocity.x, step.velocity.y);
    boss.setFrame(step.state.phase === "windup" ? 1 : 0);
    boss.setFlipX(target.x - from.x < 0);
    const progress = windupProgress(step.state, this.elapsed, cfg);
    if (progress > 0) {
      this.bossFx.lineStyle(1, 0xcfe0ff, 0.45).strokeCircle(from.x, from.y, cfg.radius);
      this.bossFx.fillStyle(0xe23a4f, 0.18).fillCircle(from.x, from.y, cfg.radius * progress);
      this.bossFx.lineStyle(1, 0xe23a4f, 0.9).strokeCircle(from.x, from.y, cfg.radius * progress);
    }
    if (!step.burst) return;
    // l'urlo: un lampo sull'area, e il colpo se il gatto è ancora dentro
    const flash = this.add.circle(from.x, from.y, cfg.radius, 0xffffff, 0.5).setDepth(3);
    this.tweens.add({ targets: flash, alpha: 0, duration: 220, onComplete: () => flash.destroy() });
    if (inScream(from, target, cfg.radius)) this.hurt((boss.getData("damage") as number | undefined) ?? this.kindOf(boss).damage);
  }

  // Un nemico rimasto troppo lontano torna in un punto di nascita nuovo, appena fuori dallo schermo: è lo stesso
  // nemico, con la vita che aveva, solo spostato. Così chi viene seminato non occupa un posto lontano dal gatto.
  private recall(enemy: Sprite) {
    const p = this.spawnCenter();
    enemy.body?.reset(p.x, p.y);
    // una cornacchia o un capo ripartono dall'avvicinamento, qualunque cosa stessero facendo
    enemy.setData("dive", startDive());
    enemy.setData("scream", startScream());
    // la pantegana ripunta il gatto dal punto nuovo
    enemy.setData("dash", startDash());
    this.recalls++;
    const log = enemy.getData("log") as BossLogEntry | null | undefined;
    if (log) log.richiami++;
  }

  // Un punto nella cornice appena fuori dallo schermo, intorno alla vista di adesso.
  private spawnCenter(): Vec {
    const cam = this.cameras.main;
    return spawnPoint({ x: cam.midPoint.x, y: cam.midPoint.y }, this.scale.width / 2, this.scale.height / 2, SPAWN.margin, this.rng);
  }

  // Le crocchette stanno ferme finché il gatto non entra nel raggio della calamita: allora gli volano incontro.
  private moveKibbles() {
    const radius = KIBBLE.magnetRadius * this.stats.magnetMultiplier;
    const target = { x: this.cat.x, y: this.cat.y };
    for (const child of this.kibbles.getChildren()) {
      const k = child as Sprite;
      if (!k.active) continue;
      if (!k.getData("pulled")) {
        if (Phaser.Math.Distance.Between(k.x, k.y, target.x, target.y) > radius) continue;
        k.setData("pulled", true);
      }
      const v = chase({ x: k.x, y: k.y }, target, KIBBLE.pullSpeed);
      k.setVelocity(v.x, v.y);
    }
  }

  // I ciuffi volano finché escono dallo schermo (o colpiscono un nemico, in furHit).
  private expireFur() {
    const view = this.cameras.main.worldView;
    for (const child of this.furs.getChildren()) {
      const f = child as Sprite;
      if (!f.active) continue;
      if (f.x < view.left - FUR_MARGIN || f.x > view.right + FUR_MARGIN || f.y < view.top - FUR_MARGIN || f.y > view.bottom + FUR_MARGIN) {
        f.disableBody(true, true);
      }
    }
  }

  // Il terreno scorre con la telecamera; i lampioni si spostano nei riquadri intorno alla vista.
  private scrollWorld() {
    const cam = this.cameras.main;
    this.ground.setTilePosition(cam.scrollX, cam.scrollY);
    const cx = Math.floor(cam.midPoint.x / LAMP_CHUNK.width);
    const cy = Math.floor(cam.midPoint.y / LAMP_CHUNK.height);
    let i = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const gx = cx + dx;
        const gy = cy + dy;
        // un punto fisso per ogni riquadro, sempre lo stesso: tornando indietro il lampione è dove l'avevi lasciato
        const h = Math.abs((gx * 73856093) ^ (gy * 19349663));
        const x = gx * LAMP_CHUNK.width + 48 + (h % (LAMP_CHUNK.width - 96));
        const y = gy * LAMP_CHUNK.height + 36 + ((h >> 8) % (LAMP_CHUNK.height - 72));
        this.lamps[i++].setPosition(x, y);
      }
    }
  }

  // Le ondate: la riga della tabella per questo momento della notte dice chi c'è; ogni tipo ha il suo orologio,
  // e quando tocca a lui nasce il suo gruppo (dueSpawns). Con le orde (HORDE) l'orologio corre a onde (hordeTime),
  // i gruppi sono più grandi e più rari (scaleRow), e ogni onda arriva da un lato solo, mai lo stesso di fila.
  private spawnOnSchedule() {
    const plan = spawnPlan(this.elapsed / this.duration);
    const cycle = Math.floor(this.elapsed / HORDE.cycleMs);
    if (cycle !== this.hordeCycle) {
      this.hordeCycle = cycle;
      this.hordeSide = nextSide(this.hordeSide, this.rng());
    }
    const clock = hordeTime(this.elapsed, HORDE.cycleMs, HORDE.arriveMs);
    const due = dueSpawns(scaleRow(plan.row, HORDE.sizeScale), this.nextSpawnAt, clock);
    this.nextSpawnAt = due.nextAt;
    for (const { kind, size } of due.spawns) this.spawnGroup(kind, size, plan);
  }

  // Un gruppo di nemici dello stesso tipo, nato vicino in un mucchietto (flockSlot) fuori dallo schermo, dal lato
  // dell'onda di adesso. Chi ha una forma sua (stormo, sciame, fila) resta in gruppo: lo muove moveFlocks.
  // scale moltiplica danno e velocità: cresce con la notte (spawnPlan). La picchiata non accelera: resta schivabile.
  private spawnGroup(id: EnemyId, size: number, scale: { damageScale: number; speedScale: number } = spawnPlan(this.elapsed / this.duration)) {
    if (this.over) return;
    const kind: EnemyKind = ENEMIES[id];
    const spacing = kind.group?.spacing ?? LOOSE_SPACING;
    const center = this.hordePoint(groupRadius(size, spacing));
    const flock = kind.group ? this.nextFlock++ : null;
    if (flock !== null) this.flocks.set(flock, { dash: startDash(), peck: startPeck(), phase: (flock * 0.6180339887) % 1 });
    for (let i = 0; i < size; i++) {
      const offset = flockSlot(i, spacing);
      const enemy = this.enemies.get(center.x + offset.x, center.y + offset.y, kind.key) as Sprite | null;
      if (!enemy) return;
      this.dress(enemy, kind, kind.health, scale);
      enemy.setData("flock", flock);
      enemy.setData("slot", i);
    }
  }

  // Un punto sul lato dell'onda di adesso, a caso lungo il lato, spostato in fuori di `radius`: il raggio del gruppo,
  // perché nessuno nasca dentro la vista.
  private hordePoint(radius: number): Vec {
    const cam = this.cameras.main;
    const center = { x: cam.midPoint.x, y: cam.midPoint.y };
    return sidePoint(center, this.scale.width / 2, this.scale.height / 2, SPAWN.margin + 2 * radius, this.hordeSide, this.rng());
  }

  // Lo sprite esce dal pool: prima poteva essere un altro nemico, anche un capo grande il doppio, quindi
  // immagine, scatola delle collisioni e dati si rimettono tutti.
  private dress(enemy: Sprite, kind: FoeKind & { key: string }, health: number, scale: { damageScale: number; speedScale: number }) {
    enemy.anims.stop();
    enemy.setTexture(kind.key, 0);
    enemy.enableBody(true, enemy.x, enemy.y, true, true);
    enemy.setSize(kind.body.width, kind.body.height).setAlpha(1).setDepth(5);
    enemy.setData("kind", kind.key);
    enemy.setData("hp", health);
    enemy.setData("damage", Math.round(kind.damage * scale.damageScale));
    enemy.setData("speed", kind.speed * scale.speedScale);
    enemy.setData("dive", startDive());
    enemy.setData("scream", startScream());
    enemy.setData("dash", startDash());
    enemy.setData("peck", startPeck());
    // la parte decimale dei multipli della sezione aurea: numeri tra 0 e 1 ben sparpagliati, senza dado
    enemy.setData("jitter", (this.born++ * 0.6180339887) % 1);
    enemy.setData("log", null);
    enemy.setData("pushedUntil", 0);
    enemy.setData("hitReadyAt", 0);
    // fuori da ogni gruppo finché spawnGroup non lo mette nel suo (i capi restano soli)
    enemy.setData("flock", null);
    enemy.setData("slot", 0);
    const walk = `${kind.key}-cammina`;
    if (!kind.dive && this.anims.exists(walk)) enemy.anims.play(walk, true);
  }

  // I capi: ognuno nasce una volta, al suo momento della notte (dueBoss), in qualunque durata.
  private spawnBossOnSchedule() {
    const times = BOSS_ORDER.map((id) => BOSSES[id].at);
    const i = dueBoss(times, this.bossesSpawned, this.elapsed / this.duration);
    if (i === -1) return;
    this.bossesSpawned++;
    this.spawnBoss(BOSS_ORDER[i]);
  }

  // Un capo nasce da fuori dello schermo come gli altri, ma il suo posto è garantito: con il pool pieno
  // prende quello del nemico più lontano. La vita segue la durata della notte (bossHealth).
  private spawnBoss(id: BossId) {
    if (this.over) return;
    const kind = BOSSES[id];
    const p = this.spawnCenter();
    let boss = this.enemies.get(p.x, p.y, kind.key) as Sprite | null;
    if (!boss && this.makeRoom()) boss = this.enemies.get(p.x, p.y, kind.key) as Sprite | null;
    if (!boss) return;
    const health = bossHealth(kind.health, this.nightMinutes, BOSS.fullNightMinutes);
    this.dress(boss, kind, health, spawnPlan(this.elapsed / this.duration));
    boss.setDepth(6);
    this.bosses.push(boss);
    const log: BossLogEntry = { id, nato: Math.round(this.elapsed), caduto: null, vita: health, richiami: 0 };
    this.bossLog.push(log);
    boss.setData("log", log);
    const { width } = this.scale;
    const note = pin(this.add.text(0, 0, BOSS_TEXTS[id].arrives, { ...FONT, color: "#ffc85a", backgroundColor: "#0e0c16" }).setOrigin(0.5, 0).setPadding(4, 3, 4, 3).setScrollFactor(0).setDepth(150), width / 2, SAFE + 26);
    this.time.delayedCall(BOSS.announceMs, () => note.destroy());
  }

  // Libera un posto nel pool togliendo il nemico più lontano dal gatto, mai un capo. Non lascia crocchette
  // e non conta tra i presi: è solo uscito di scena.
  private makeRoom(): boolean {
    let farthest: Sprite | null = null;
    let best = -1;
    for (const e of this.aliveEnemies()) {
      if (this.bosses.includes(e)) continue;
      const d = Phaser.Math.Distance.Between(e.x, e.y, this.cat.x, this.cat.y);
      if (d > best) {
        best = d;
        farthest = e;
      }
    }
    if (!farthest) return false;
    farthest.disableBody(true, true);
    return true;
  }

  // Ogni arma ha il suo orologio: quando arriva il suo momento parte, e il prossimo colpo si sposta avanti.
  // I numeri di ogni arma passano da tuneWeapon: riflessi pronti accorcia l'attesa, pelo gonfio allunga
  // portata e raggio.
  private fireWeapons(time: number) {
    const w = this.stats.weapons;
    if (w.scratch > 0 && time >= this.nextFire.scratch) {
      const lv = tuneWeapon(SCRATCH_LEVELS[Math.min(w.scratch, SCRATCH_LEVELS.length) - 1], this.stats);
      this.scratch(lv);
      this.nextFire.scratch = time + lv.cooldownMs;
    }
    if (w.tail > 0 && time >= this.nextFire.tail) {
      const lv = tuneWeapon(TAIL_LEVELS[Math.min(w.tail, TAIL_LEVELS.length) - 1], this.stats);
      this.tail(lv);
      this.nextFire.tail = time + lv.cooldownMs;
    }
    if (w.fur > 0 && time >= this.nextFire.fur) {
      const lv = tuneWeapon(FUR_LEVELS[Math.min(w.fur, FUR_LEVELS.length) - 1], this.stats);
      this.fur(lv);
      this.nextFire.fur = time + lv.cooldownMs;
    }
    if (w.meow > 0 && time >= this.nextFire.meow) {
      const lv = tuneWeapon(MEOW_LEVELS[Math.min(w.meow, MEOW_LEVELS.length) - 1], this.stats);
      this.meow(lv);
      this.nextFire.meow = time + lv.cooldownMs;
    }
  }

  private aliveEnemies(): Sprite[] {
    return this.enemies.getChildren().filter((c) => c.active) as Sprite[];
  }

  // I nemici vivi senza i capi: sono loro che fanno folla, e che si spingono tra loro.
  private crowd(): Sprite[] {
    return this.aliveEnemies().filter((e) => !BOSSES[e.getData("kind") as BossId]);
  }

  private playEffect(key: string, x: number, y: number, rotation = 0, scale = 1, alpha = 1) {
    const fx = this.effects.get(x, y, key) as Phaser.GameObjects.Sprite | null;
    if (!fx) return;
    fx.setActive(true).setVisible(true).setDepth(20).setRotation(rotation).setScale(scale).setAlpha(alpha);
    fx.play(key);
    fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.effects.killAndHide(fx));
  }

  // Il graffio: colpisce il capo, se è a tiro; altrimenti il nemico più vicino, se è abbastanza vicino.
  // I nemici fanno mucchio intorno al gatto: senza questa scelta il graffio non arriverebbe mai al capo.
  private scratch(lv: (typeof SCRATCH_LEVELS)[number]) {
    const alive = this.aliveEnemies();
    const isBoss = alive.map((e) => this.bosses.includes(e));
    const i = preferredIndex({ x: this.cat.x, y: this.cat.y }, alive, isBoss, lv.range);
    if (i === -1) return;
    this.playEffect("graffio", alive[i].x, alive[i].y);
    this.damageEnemy(alive[i], lv.damage);
  }

  // La coda a frusta: un arco davanti al gatto, nella direzione in cui si è mosso per ultimo.
  private tail(lv: (typeof TAIL_LEVELS)[number]) {
    const origin = { x: this.cat.x, y: this.cat.y };
    // lo sprite dell'arco guarda in su: si gira di un quarto di giro in più per puntarlo nella direzione del gatto
    const ahead = lv.radius * 0.45;
    this.playEffect("coda", origin.x + Math.cos(this.facing) * ahead, origin.y + Math.sin(this.facing) * ahead, this.facing + Math.PI / 2, lv.radius / 28);
    for (const enemy of this.aliveEnemies()) {
      if (inArc(origin, this.facing, lv.halfAngle, lv.radius, { x: enemy.x, y: enemy.y })) this.damageEnemy(enemy, lv.damage);
    }
  }

  // Il pelo che vola: ciuffi in tutte le direzioni, a raggiera, partendo da un angolo sempre diverso,
  // fino al bordo dello schermo.
  private fur(lv: (typeof FUR_LEVELS)[number]) {
    const start = this.rng() * Math.PI * 2;
    for (let i = 0; i < lv.count; i++) {
      const angle = start + (i * Math.PI * 2) / lv.count;
      const f = this.furs.get(this.cat.x, this.cat.y, "pelo") as Sprite | null;
      if (!f) return;
      f.enableBody(true, this.cat.x, this.cat.y, true, true);
      f.setSize(10, 10).setDepth(15).setRotation(angle);
      f.setVelocity(Math.cos(angle) * lv.speed, Math.sin(angle) * lv.speed);
      f.setData("damage", lv.damage);
      f.anims.play("pelo-vola", true);
    }
  }

  private furHit(fur: Sprite, enemy: Sprite) {
    if (!fur.active || !enemy.active) return;
    fur.disableBody(true, true);
    this.damageEnemy(enemy, fur.getData("damage") as number);
  }

  // Il miagolio: un'onda tonda intorno al gatto. Chi è dentro prende poco danno e viene spinto via
  // (src/logic/knockback.ts): per un attimo scivola all'indietro, poi riparte verso il gatto. Una cornacchia
  // spinta perde la picchiata e ricomincia dall'avvicinamento. I capi prendono il danno ma restano dove sono.
  private meow(lv: (typeof MEOW_LEVELS)[number]) {
    const origin = { x: this.cat.x, y: this.cat.y };
    // ingrandito tre o quattro volte il disegno diventa pesante: un po' trasparente lascia vedere il gatto e chi gli sta addosso
    this.playEffect("miagolio", origin.x, origin.y, 0, lv.radius / MEOW_RING, 0.75);
    for (const enemy of this.aliveEnemies()) {
      const at = { x: enemy.x, y: enemy.y };
      if (!inReach(origin, at, lv.radius)) continue;
      const push = lv.push * (this.bosses.includes(enemy) ? MEOW.bossPush : 1);
      this.damageEnemy(enemy, lv.damage);
      const v = knockback(origin, at, lv.radius, push, MEOW.pushMs);
      if (!enemy.active || !v) continue;
      enemy.setVelocity(v.x, v.y);
      enemy.setData("pushedUntil", this.elapsed + MEOW.pushMs);
      enemy.setData("dive", startDive());
      this.pushes++;
    }
  }

  private damageEnemy(enemy: Sprite, baseDamage: number) {
    const hp = (enemy.getData("hp") as number) - baseDamage * this.stats.damageMultiplier;
    enemy.setData("hp", hp);
    if (hp <= 0) {
      this.killEnemy(enemy);
      return;
    }
    enemy.setAlpha(0.5);
    this.time.delayedCall(80, () => enemy.active && enemy.setAlpha(1));
  }

  // Un nemico eliminato lascia una crocchetta dove cade: vale di più se il nemico era duro.
  private killEnemy(enemy: Sprite) {
    const { x, y } = enemy;
    const kind = this.kindOf(enemy);
    enemy.disableBody(true, true);
    this.kills++;
    this.killsText.setText(String(this.kills));
    if (this.bosses.includes(enemy)) this.dropBossChest(enemy, x, y);
    this.dropSnack(x, y);
    // non tutti la lasciano sempre: la zanzara solo ogni tanto (kibbleChance)
    if (kind.kibbleChance < 1 && this.rng() >= kind.kibbleChance) return;
    const k = this.kibbles.get(x, y, "crocchetta") as Sprite | null;
    if (!k) return;
    k.enableBody(true, x, y, true, true);
    k.setSize(8, 8).setDepth(4).setVelocity(0, 0).setData("pulled", false).setData("xp", kind.xp);
    k.anims.play("crocchetta-brilla", true);
  }

  // Un capo caduto lascia una cassa del tesoro dove cade (tripla per il gabbiano reale), oltre alla crocchetta.
  private dropBossChest(boss: Sprite, x: number, y: number) {
    const kind = BOSSES[boss.getData("kind") as BossId];
    this.bosses = this.bosses.filter((b) => b !== boss);
    const log = boss.getData("log") as BossLogEntry | null | undefined;
    if (log) {
      log.caduto = Math.round(this.elapsed);
      log.vita = 0;
    }
    const chest = this.chests.get(x, y, "cassa") as Sprite | null;
    if (!chest) return;
    chest.enableBody(true, x, y, true, true);
    chest.setSize(14, 12).setDepth(4).setData("triple", kind.tripleChest);
    chest.anims.play("cassa-brilla", true);
  }

  private collect(kibble: Sprite) {
    if (!kibble.active || this.over) return;
    kibble.disableBody(true, true);
    const { state, levelsGained } = addXp(this.xp, (kibble.getData("xp") as number | undefined) ?? KIBBLE.xp);
    this.xp = state;
    this.pendingLevels += levelsGained;
    this.drawHud();
    // con la partita già ferma (una cassa presa nello stesso istante) la scelta aspetta che riprenda (openLevelUp)
    if (this.pendingLevels > 0) this.openLevelUp();
  }

  // Si sale di livello: la partita si ferma e sopra compare la scelta tra tre carte. Se la partita è già ferma
  // (una cassa, la pausa, la mappa, o un'altra scelta nello stesso istante) il livello aspetta: lo riapre onResume.
  private openLevelUp() {
    if (this.over || this.pendingLevels <= 0 || !this.halt.stop("LevelUp")) return;
    this.pendingLevels--;
    this.joystick = null;
    this.joystickGfx.clear();
    this.pullAllKibbles();
    const choices = drawCards(CARDS, this.levels, this.rng, luckyWeights(CARD_WEIGHTS, this.stats.rareWeightBonus), FALLBACK_CARDS);
    const data: LevelUpData = { choices, levels: { ...this.levels } };
    this.scene.pause();
    this.scene.launch("LevelUp", data);
  }

  // A ogni livello tutte le crocchette rimaste sulla mappa volano verso il gatto, appena la partita riprende.
  private pullAllKibbles() {
    for (const child of this.kibbles.getChildren()) {
      const k = child as Sprite;
      if (k.active) k.setData("pulled", true);
    }
  }

  private applyCard(id: string) {
    this.gainCard(id);
    this.drawHud();
    // più livelli in una volta: le scelte arrivano una dopo l'altra, le apre onResume
    this.scene.resume();
  }

  // gainCard: l'effetto di una carta, scelta al livello o trovata in una cassa.
  private gainCard(id: string) {
    if (id === "heal") {
      this.health = heal(this.health, FALLBACK.healAmount);
    } else if (id === "points") {
      this.points += FALLBACK.points;
    } else {
      this.levels[id] = (this.levels[id] ?? 0) + 1;
      const before = this.stats.maxHealthBonus;
      this.stats = computeStats(this.levels);
      const gained = this.stats.maxHealthBonus - before;
      if (gained > 0) this.health = heal({ ...this.health, max: CAT.maxHealth + this.stats.maxHealthBonus }, gained);
    }
  }

  // Ogni tanto un nemico eliminato lascia un supplì (dropsSnack), un po' di lato rispetto alla crocchetta.
  // Se a terra ce ne sono già SNACK.maxOnGround, quello nuovo prende il posto del più lontano dal gatto.
  private dropSnack(x: number, y: number) {
    if (!dropsSnack(this.snackRng(), SNACK.chance, this.elapsed, this.lastSnackAt, SNACK.minGapMs)) return;
    let snack = this.snacks.get(x, y, "suppli") as Sprite | null;
    if (!snack) {
      const onGround = (this.snacks.getChildren() as Sprite[]).filter((c) => c.active);
      snack = onGround[farthestIndex({ x: this.cat.x, y: this.cat.y }, onGround)] ?? null;
    }
    if (!snack) return;
    this.lastSnackAt = this.elapsed;
    this.snacksDropped++;
    snack.enableBody(true, x + SNACK.offset, y, true, true);
    snack.setSize(10, 8).setDepth(4).setVelocity(0, 0);
    snack.anims.play("suppli-brilla", true);
  }

  // Il supplì sta fermo. Quando il gatto ha fame (isHungry: gli mancano almeno SNACK.minMissing punti di vita)
  // ed è nel raggio della calamita, gli vola incontro come una crocchetta. Altrimenti resta a terra, per dopo.
  private moveSnacks() {
    const hungry = isHungry(this.health, SNACK.minMissing);
    const radius = KIBBLE.magnetRadius * this.stats.magnetMultiplier;
    const target = { x: this.cat.x, y: this.cat.y };
    for (const child of this.snacks.getChildren()) {
      const snack = child as Sprite;
      if (!snack.active) continue;
      if (!hungry || Phaser.Math.Distance.Between(snack.x, snack.y, target.x, target.y) > radius) {
        snack.setVelocity(0, 0);
        continue;
      }
      const v = chase({ x: snack.x, y: snack.y }, target, KIBBLE.pullSpeed);
      snack.setVelocity(v.x, v.y);
    }
  }

  // Il gatto tocca un supplì: se ha fame lo mangia e si cura, e sopra di lui sale per un attimo quanto ha curato.
  private eatSnack(snack: Sprite) {
    if (!snack.active || this.over || !isHungry(this.health, SNACK.minMissing)) return;
    snack.disableBody(true, true);
    this.snacksEaten++;
    const before = this.health.current;
    this.health = heal(this.health, SNACK.heal);
    this.drawHud();
    // quanto ha curato davvero: vicino alla vita massima è meno di SNACK.heal
    const gained = Math.round(this.health.current - before);
    const note = this.add.text(this.cat.x, this.cat.y - 12, `+${gained}`, { ...FONT, color: "#e23a4f", stroke: "#0e0c16", strokeThickness: 2 }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: note, y: note.y - 12, alpha: 0, duration: 700, onComplete: () => note.destroy() });
  }

  // Le casse: ne nasce una al suo momento, lontano dal gatto. Se ne aspettano già due, la prossima aspetta
  // che se ne prenda una: non si perde.
  private spawnChestOnSchedule() {
    const at = this.chestSchedule[this.chestsSpawned];
    if (at === undefined || this.elapsed < at || this.chests.countActive(true) >= CHEST.maxOnGround) return;
    const p = chestPoint({ x: this.cat.x, y: this.cat.y }, this.rng, CHEST.minDistance, CHEST.maxDistance);
    const chest = this.chests.get(p.x, p.y, "cassa") as Sprite | null;
    if (!chest) return;
    this.chestsSpawned++;
    chest.enableBody(true, p.x, p.y, true, true);
    // lo sprite esce dal pool: prima poteva essere la cassa tripla di un capo
    chest.setSize(14, 12).setDepth(4).setData("triple", false);
    chest.anims.play("cassa-brilla", true);
  }

  // Presa una cassa: un potere, a volte tre, dalle stesse carte della scelta al livello. Sono presi subito;
  // poi la partita si ferma e ChestScene mostra quali, finché non si tocca. Se la partita è già ferma (la scelta
  // di una carta aperta nello stesso istante, src/logic/halt.ts), la cassa resta a terra e si prende alla ripresa.
  private takeChest(chest: Sprite) {
    if (!chest.active || this.over || !this.halt.stop("Chest")) return;
    chest.disableBody(true, true);
    this.chestsTaken++;
    const levels = { ...this.levels };
    // la cassa del gabbiano reale è tripla di sicuro: con probabilità 1 il tiro è sempre sotto
    // il quadrifoglio alza la probabilità delle altre e il peso delle carte rare, come nella scelta al livello
    const tripleChance = chest.getData("triple") ? 1 : CHEST.tripleChance + this.stats.tripleChanceBonus;
    const weights = luckyWeights(CARD_WEIGHTS, this.stats.rareWeightBonus);
    const gained = openChest(CARDS, this.levels, this.rng, weights, FALLBACK_CARDS, tripleChance);
    for (const id of gained) this.gainCard(id);
    this.drawHud();
    this.joystick = null;
    this.joystickGfx.clear();
    const data: ChestData = { gained, levels };
    this.scene.pause();
    this.scene.launch("Chest", data);
  }

  // Chiusa la cassa la partita riprende (con la protezione di onResume); un livello arrivato insieme alla
  // cassa apre la sua scelta alla ripresa, in onResume.
  private onChestClosed() {
    this.scene.resume();
  }

  // La minimappa: il gatto al centro, i nemici come puntini, le casse in oro, sempre: sul bordo se sono
  // lontane, nella loro direzione. Hanno il contorno scuro e lampeggiano tra oro e bianco, per non perderle.
  private drawMinimap() {
    const g = this.minimap;
    const { x: cx, y: cy } = this.minimapCenter;
    const h = MINIMAP.half;
    const cat = { x: this.cat.x, y: this.cat.y };
    g.clear();
    g.fillStyle(0x0e0c16, 0.7).fillRect(cx - h, cy - h, h * 2, h * 2);
    g.lineStyle(1, 0xcfe0ff, 1).strokeRect(cx - h, cy - h, h * 2, h * 2);
    g.fillStyle(0x8a93a8, 1);
    for (const e of this.aliveEnemies()) {
      const p = toMinimap(cat, e, MINIMAP.range, h);
      if (p.inside) g.fillRect(cx + p.x, cy + p.y, 1, 1);
    }
    const blink = Math.floor(this.time.now / 250) % 2 === 0 ? 0xffc85a : 0xffffff;
    for (const c of this.chests.getChildren() as Sprite[]) {
      if (!c.active) continue;
      const p = toMinimap(cat, c, MINIMAP.range, h);
      // dentro il riquadro anche quando è sul bordo: il segno intero si vede sempre
      const x = Phaser.Math.Clamp(Math.round(cx + p.x), cx - h + 2, cx + h - 2);
      const y = Phaser.Math.Clamp(Math.round(cy + p.y), cy - h + 2, cy + h - 2);
      g.fillStyle(0x0e0c16, 1).fillRect(x - 2, y - 2, 5, 5);
      g.fillStyle(blink, 1).fillRect(x - 1, y - 1, 3, 3);
    }
    // i capi in rosso, sempre: sul bordo se sono lontani, come le casse
    for (const b of this.bosses) {
      const p = toMinimap(cat, b, MINIMAP.range, h);
      const x = Phaser.Math.Clamp(Math.round(cx + p.x), cx - h + 2, cx + h - 2);
      const y = Phaser.Math.Clamp(Math.round(cy + p.y), cy - h + 2, cy + h - 2);
      g.fillStyle(0x0e0c16, 1).fillRect(x - 2, y - 2, 5, 5);
      g.fillStyle(0xe23a4f, 1).fillRect(x - 1, y - 1, 3, 3);
    }
    g.fillStyle(0xf5841f, 1).fillRect(cx - 1, cy - 1, 3, 3);
  }

  // Le barre dei capi vivi, in basso al centro, con il nome sopra: quanta vita gli resta.
  private drawBossBars() {
    const g = this.bossBars;
    const { width, height } = this.scale;
    g.clear();
    this.bossNames.forEach((name, i) => {
      const boss = this.bosses[i];
      name.setVisible(!!boss);
      if (!boss) return;
      const kind = BOSSES[boss.getData("kind") as BossId];
      const max = bossHealth(kind.health, this.nightMinutes, BOSS.fullNightMinutes);
      const left = Phaser.Math.Clamp((boss.getData("hp") as number) / max, 0, 1);
      const x = width / 2 - BOSS_BAR.width / 2;
      const y = height - SAFE - 7 - i * 18;
      pin(name.setText(BOSS_TEXTS[kind.key].name), width / 2, height - SAFE - 9 - i * 18);
      g.fillStyle(0x0e0c16, 1).fillRect(x - 1, y - 1, BOSS_BAR.width + 2, BOSS_BAR.height + 2);
      g.fillStyle(0xe23a4f, 1).fillRect(x, y, Math.round(BOSS_BAR.width * left), BOSS_BAR.height);
    });
  }

  // La mappa grande: la partita si ferma e sopra compare MapScene, come la pausa.
  private openMap() {
    if (this.over || !this.halt.stop("Map")) return;
    this.joystick = null;
    this.joystickGfx.clear();
    const point = (s: Sprite) => ({ x: s.x, y: s.y });
    const data: MapData = {
      cat: point(this.cat),
      chests: (this.chests.getChildren() as Sprite[]).filter((c) => c.active).map(point),
      bosses: this.bosses.map(point),
      enemies: this.aliveEnemies().map(point),
    };
    this.scene.pause();
    this.scene.launch("Map", data);
  }

  // Un nemico appoggiato al gatto: colpisce se la sua pausa è finita e il tetto lo lascia (contactHit). Così una
  // folla fa più male di un nemico solo.
  private onTouch(enemy: Sprite) {
    if (this.over || this.invincible || !enemy.active) return;
    const damage = (enemy.getData("damage") as number | undefined) ?? PIGEON.damage;
    const readyAt = (enemy.getData("hitReadyAt") as number | undefined) ?? 0;
    const step = contactHit(this.health, readyAt, damage, this.elapsed, CAT.contactMs, CAT.hitGapMs);
    enemy.setData("hitReadyAt", step.readyAt);
    if (step.hit) this.afterHit(step.health);
  }

  // Un colpo dall'urlo del gabbiano reale: conta il tetto, come per i contatti.
  private hurt(damage: number) {
    if (this.over || this.invincible) return;
    const { health, hit } = takeHit(this.health, damage, this.elapsed, CAT.hitGapMs);
    if (hit) this.afterHit(health);
  }

  private afterHit(health: Health) {
    this.health = health;
    if (isDead(this.health)) this.loseLife();
    this.drawHud();
  }

  // Finita la barra il gatto perde una vita e riparte dallo stesso punto della notte, con la barra piena
  // e un attimo di invulnerabilità. Senza più vite, la partita finisce.
  private loseLife() {
    this.lives--;
    this.livesLost++;
    if (this.lives <= 0) {
      this.endRun(false);
      return;
    }
    this.health = { ...this.health, current: this.health.max, invulnerableUntil: this.elapsed + RUN.respawnInvulnerabilityMs };
    const { width, height } = this.scale;
    const note = pin(this.add.text(0, 0, TEXTS.lifeLost, { ...FONT, color: "#e23a4f", backgroundColor: "#0e0c16" }).setOrigin(0.5).setPadding(4, 3, 4, 3).setScrollFactor(0).setDepth(150), width / 2, height / 2 - 28);
    this.time.delayedCall(1200, () => note.destroy());
  }

  // La ripresa dopo una carta, una cassa, la pausa o la mappa: la partita torna libera, un attimo di protezione
  // sull'orologio della notte, e un livello che aspettava apre adesso la sua scelta.
  private onResume() {
    this.halt.release();
    if (this.over) return;
    this.health = protect(this.health, this.elapsed, CAT.resumeInvulnerabilityMs);
    if (this.pendingLevels > 0) this.time.delayedCall(50, () => this.openLevelUp());
  }

  // La pausa: la partita si ferma e sopra compare PauseScene. Non si apre sopra la scelta delle carte, la cassa o
  // la mappa.
  private openPause() {
    if (this.over || !this.halt.stop("Pause")) return;
    this.joystick = null;
    this.joystickGfx.clear();
    this.scene.pause();
    this.scene.launch("Pause");
  }

  // La fine: all'alba (dawn) o senza più vite. Il punteggio e il record li fa EndScene.
  private endRun(dawn: boolean) {
    if (this.over) return;
    this.over = true;
    if (this.debugText) this.writeDebugState(Math.round(this.game.loop.actualFps), this.enemies.countActive(true));
    this.time.timeScale = 1;
    this.physics.world.timeScale = 1;
    this.anims.globalTimeScale = 1;
    const result: EndData = {
      survivedMs: Math.min(this.elapsed, this.duration),
      kills: this.kills,
      points: this.points,
      livesLost: this.livesLost,
      dawn,
      level: this.xp.level,
      minutes: this.nightMinutes,
    };
    this.scene.stop("LevelUp");
    this.scene.stop("Pause");
    this.scene.stop("Map");
    this.scene.stop("Chest");
    this.scene.start("End", result);
  }

  // In alto a sinistra, lontano dall'angolo: la barra della vita, quella dell'esperienza, il livello e i cuori.
  private drawHud() {
    const g = this.hud;
    const w = 60;
    const life = Math.round((w - 2) * (this.health.current / this.health.max));
    const exp = Math.round((w - 2) * (this.xp.xp / xpToNext(this.xp.level)));
    g.clear();
    g.fillStyle(0x0e0c16, 1).fillRect(SAFE, SAFE, w, 6);
    g.fillStyle(0xe23a4f, 1).fillRect(SAFE + 1, SAFE + 1, life, 4);
    g.fillStyle(0x0e0c16, 1).fillRect(SAFE, SAFE + 8, w, 4);
    g.fillStyle(0xa6f05a, 1).fillRect(SAFE + 1, SAFE + 9, exp, 2);
    this.levelText.setText(`${TEXTS.level} ${this.xp.level}`);
    this.hearts.forEach((h, i) => h.setAlpha(i < this.lives ? 1 : 0.2));
  }

  private drawJoystick() {
    const g = this.joystickGfx;
    g.clear();
    if (!this.joystick) return;
    const { start } = this.joystick;
    const v = joystickVector(start, this.joystick.current, JOYSTICK_RADIUS);
    g.lineStyle(1, 0xffffff, 0.5).strokeCircle(start.x, start.y, JOYSTICK_RADIUS);
    g.fillStyle(0xffffff, 0.35).fillCircle(start.x + v.x * JOYSTICK_RADIUS, start.y + v.y * JOYSTICK_RADIUS, 9);
  }

  // Il pannello di debug, con ?debug nell'indirizzo: fotogrammi, nemici, e cinque pulsanti per provare in fretta.
  // Sta sotto la pausa e i nemici presi, sul lato destro.
  private createDebug() {
    const { width } = this.scale;
    const top = SAFE + PAUSE_SIZE + 24;
    this.debugText = this.add.text(width - SAFE, top, "", { ...FONT, align: "right" }).setOrigin(1, 0).setScrollFactor(0).setDepth(150);
    const button = (label: string, y: number, onTap: () => void) => {
      const t = this.add.text(width - SAFE, y, label, { ...FONT, backgroundColor: "#2c3550" }).setOrigin(1, 0).setPadding(3, 2, 3, 2).setScrollFactor(0).setDepth(150).setInteractive();
      t.on("pointerdown", (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        onTap();
      });
      return t;
    };
    const inv = button(TEXTS.debugInvincible, top + 22, () => {
      this.invincible = !this.invincible;
      inv.setColor(this.invincible ? "#ffc85a" : "#ffffff");
    });
    // un gruppo di ogni tipo, anche di quelli che a quest'ora della notte non ci sarebbero ancora
    button(TEXTS.debugSpawn, top + 38, () => {
      for (let i = 0; i < 3; i++) this.spawnGroup("piccione", 3);
      this.spawnGroup("zanzara", 6);
      this.spawnGroup("pantegana", 2);
      this.spawnGroup("cornacchia", 2);
    });
    // un capo a comando, a turno: il gabbiano, poi il gabbiano reale, poi di nuovo il gabbiano
    let nextBoss = 0;
    button(TEXTS.debugBoss, top + 70, () => this.spawnBoss(BOSS_ORDER[nextBoss++ % BOSS_ORDER.length]));
    // un livello di miagolio a ogni tocco, senza aspettare che esca la carta
    button(TEXTS.debugMeow, top + 86, () => this.gainCard("meow"));
    const fast = button(TEXTS.debugFast, top + 54, () => {
      const on = this.time.timeScale === 1;
      // Arcade conta il contrario: timeScale 0,5 vuol dire fisica due volte più veloce
      this.time.timeScale = on ? 4 : 1;
      this.physics.world.timeScale = on ? 0.25 : 1;
      this.anims.globalTimeScale = on ? 4 : 1;
      fast.setColor(on ? "#ffc85a" : "#ffffff");
    });
  }

  private updateDebug() {
    const alive = this.enemies.countActive(true);
    const fps = Math.round(this.game.loop.actualFps);
    this.debugText?.setText(`${fps} fps\n${alive} nemici`);
    this.writeDebugState(fps, alive);
  }

  // Con ?debug lo stato della partita si legge anche da fuori, sul canvas: serve alla partita automatica
  // che misura il bilanciamento (quante vite perse, a che livello, quanti nemici insieme, quanti sullo schermo,
  // quanti riportati vicino, quanti spinti via dal miagolio, a che livello è ogni carta, quando è nato e quando
  // è caduto ogni capo, quanti supplì sono caduti e quanti ne ha mangiati, e il mucchio: su cento nemici, quanti
  // ne hanno un altro quasi addosso; la massa: su cento nemici in vista, quanti stanno nella massa più grande).
  private writeDebugState(fps: number, alive: number) {
    const view = this.cameras.main.worldView;
    const inView = this.aliveEnemies().filter((e) => view.contains(e.x, e.y)).length;
    const pile = Math.round(crowding(this.crowd().map((e) => ({ x: e.x, y: e.y })), CROWD.overlapDistance) * 100);
    const seen = this.crowd().filter((e) => view.contains(e.x, e.y)).map((e) => ({ x: e.x, y: e.y }));
    const clump = seen.length ? Math.round((largestClump(seen, CROWD.clumpDistance) / seen.length) * 100) : 0;
    for (const b of this.bosses) {
      const log = b.getData("log") as BossLogEntry | null | undefined;
      if (log) log.vita = Math.round(b.getData("hp") as number);
    }
    this.game.canvas.dataset.stato = JSON.stringify({
      ms: Math.round(this.elapsed), vite: this.lives, vita: Math.round(this.health.current), livello: this.xp.level,
      presi: this.kills, vivi: alive, inVista: inView, richiami: this.recalls, spinti: this.pushes, carte: this.levels,
      capi: this.bossLog, suppli: { caduti: this.snacksDropped, mangiati: this.snacksEaten }, mucchio: pile, massa: clump, fps,
    });
  }
}
