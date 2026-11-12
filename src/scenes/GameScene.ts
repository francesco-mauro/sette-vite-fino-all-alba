// La scena di gioco: la notte intera. Il gatto si muove, i piccioni arrivano sempre più fitti, le armi partono
// da sole (graffio, coda a frusta, pelo che vola), le crocchette fanno salire di livello e a ogni livello si sceglie
// una carta (LevelUpScene). Il gatto ha sette vite; all'alba, dopo 15 minuti, si vince (EndScene).
// Le regole stanno in src/logic/ e sono testate; i numeri in src/data/; qui si disegna e si collega.
//
// Contenuti:
// - campi: lo stato della partita
// - create, createStill, createPlay: la scena ferma della misura o la partita
// - createAnimations, makeStreetTexture, createInput, createHud: animazioni, strada infinita, comandi, interfaccia
// - update e moveCat, moveEnemies, moveKibbles, expireFur, scrollWorld, spawnOnSchedule: un fotogramma di gioco
// - spawnGroup: i piccioni da fuori dello schermo
// - le armi: fireWeapons, scratch, tail, fur, furHit, damageEnemy, killEnemy
// - crescere: collect, openLevelUp, applyCard
// - vite, pausa e fine: onTouch, loseLife, openPause, endRun
// - l'interfaccia: drawHud, drawJoystick, createDebug, updateDebug
import * as Phaser from "phaser";
import { CARDS, FALLBACK_CARDS } from "../data/cards";
import {
  CARD_WEIGHTS, CAT, FALLBACK, FUR_LEVELS, KIBBLE, PIGEON, RUN, SCRATCH_LEVELS, SPAWN, TAIL_LEVELS,
} from "../data/balance";
import { TEXTS } from "../data/texts";
import { inArc } from "../logic/arc";
import { drawCards } from "../logic/cards";
import { formatClock } from "../logic/clock";
import { createHealth, heal, isDead, takeHit, type Health } from "../logic/health";
import { chase, joystickVector, keyboardVector, type Vec } from "../logic/movement";
import { addXp, xpToNext, type XpState } from "../logic/progression";
import { createRng, type Rng } from "../logic/rng";
import { spawnPoint } from "../logic/spawn";
import { computeStats, type Stats } from "../logic/stats";
import { nearestIndex } from "../logic/targeting";
import { spawnPlan } from "../logic/waves";
import type { EndData } from "./EndScene";
import type { LevelUpData } from "./LevelUpScene";

type Sprite = Phaser.Physics.Arcade.Sprite;

// Il joystick che compare sotto il pollice: quanto spingere per la velocità piena, in pixel della scena.
const JOYSTICK_RADIUS = 24;
// Distanza dai bordi per tutto ciò che sta fisso sullo schermo: sul telefono gli angoli sono arrotondati
// e in orizzontale c'è il foro della fotocamera (lezione della scritta di prova della tappa 1b).
const SAFE = 12;
// Il lampione si ripete ogni tanto, in un punto diverso di ogni riquadro di strada.
const LAMP_CHUNK = { width: 320, height: 240 };
const FONT = { fontFamily: "Silkscreen", fontSize: "8px", color: "#ffffff" };
// Il pulsante della pausa, in alto a destra: grande abbastanza per il pollice.
const PAUSE_SIZE = 18;

export class GameScene extends Phaser.Scene {
  private cat!: Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private kibbles!: Phaser.Physics.Arcade.Group;
  private furs!: Phaser.Physics.Arcade.Group;
  private effects!: Phaser.GameObjects.Group;
  private ground!: Phaser.GameObjects.TileSprite;
  private lamps: Phaser.GameObjects.Image[] = [];
  private hud!: Phaser.GameObjects.Graphics;
  private hearts: Phaser.GameObjects.Image[] = [];
  private levelText!: Phaser.GameObjects.Text;
  private clockText!: Phaser.GameObjects.Text;
  private killsText!: Phaser.GameObjects.Text;
  private hintText: Phaser.GameObjects.Text | null = null;
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
  private pendingLevels = 0;
  // l'ultima direzione in cui il gatto si è mosso, in radianti: la coda a frusta colpisce da quella parte
  private facing = 0;
  private nextFire = { scratch: 0, tail: 0, fur: 0 };
  // il tempo di notte passato, in millisecondi di gioco: si ferma con la pausa e con la scelta delle carte
  private elapsed = 0;
  private duration = RUN.durationMs;
  private nextSpawnAt = 0;
  private points = 0;
  private kills = 0;
  private joystick: { pointerId: number; start: Vec; current: Vec } | null = null;
  private over = false;
  private invincible = false;
  private debugText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super("Game");
  }

  // create: costruisce la scena, una volta per partita.
  create() {
    this.over = false;
    this.health = createHealth(CAT.maxHealth);
    this.lives = RUN.lives;
    this.livesLost = 0;
    this.xp = { level: 1, xp: 0 };
    this.levels = {};
    this.stats = computeStats({});
    this.pendingLevels = 0;
    this.facing = 0;
    this.elapsed = 0;
    this.nextSpawnAt = 0;
    this.points = 0;
    this.kills = 0;
    this.joystick = null;
    this.lamps = [];
    this.hearts = [];
    this.debugText = null;
    this.hintText = null;
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
    for (const [x, y] of [[48, 192], [416, 48], [304, 96]]) this.add.image(x, y, "foglie").setOrigin(0, 0);
    this.add.image(width / 2 + 16, height / 2 - 16, "lampione");
    this.add.sprite(width / 2, height / 2, "gatto", 0);
  }

  private createPlay() {
    const { width, height } = this.scale;
    const params = new URLSearchParams(location.search);
    this.createAnimations();
    // Il seme: con ?seme=123 nell'indirizzo la partita estrae sempre le stesse carte e le stesse nascite.
    const seedParam = params.get("seme");
    this.rng = createRng(seedParam ? Number(seedParam) : Date.now());
    // La partita corta, per provare: con ?corta la notte dura 3 minuti invece di 15.
    this.duration = params.has("corta") ? RUN.shortDurationMs : RUN.durationMs;

    // Il terreno: una striscia di strada con tombino e foglie, ripetuta all'infinito.
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
    this.furs = this.physics.add.group({ maxSize: 60 });
    this.effects = this.add.group({ maxSize: 60 });

    this.physics.add.overlap(this.cat, this.enemies, (_c, enemy) => this.onTouch(enemy as Sprite));
    this.physics.add.overlap(this.cat, this.kibbles, (_c, kibble) => this.collect(kibble as Sprite));
    this.physics.add.overlap(this.furs, this.enemies, (fur, enemy) => this.furHit(fur as Sprite, enemy as Sprite));
    this.nextFire = { scratch: 0, tail: 0, fur: 0 };

    this.events.off("card-picked");
    this.events.on("card-picked", (id: string) => this.applyCard(id));
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
    this.anims.create({ key: "crocchetta-brilla", frames: strip("crocchetta", 0, 1), frameRate: 2, repeat: -1 });
    this.anims.create({ key: "graffio", frames: strip("graffio", 0, 2), frameRate: 15, repeat: 0 });
    this.anims.create({ key: "coda", frames: strip("coda", 0, 2), frameRate: 15, repeat: 0 });
    this.anims.create({ key: "pelo-vola", frames: strip("pelo", 0, 1), frameRate: 8, repeat: -1 });
  }

  // Disegna una volta sola la striscia di strada: sampietrini, un tombino e due mucchi di foglie.
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
    ctx.drawImage(img("foglie"), 2 * 16, 6 * 16);
    ctx.drawImage(img("foglie"), 10 * 16, 7 * 16);
    canvas.refresh();
    return key;
  }

  private createInput() {
    const kb = this.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys({
        up: "UP", down: "DOWN", left: "LEFT", right: "RIGHT", w: "W", a: "A", s: "S", d: "D",
      }) as typeof this.keys;
      kb.on("keydown-ESC", this.openPause, this);
      kb.on("keydown-P", this.openPause, this);
    }
    // Due dita insieme: uno sul joystick, l'altro libero per la pausa.
    this.input.addPointer(1);
    this.joystickGfx = this.add.graphics().setScrollFactor(0).setDepth(90);
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (this.over || this.joystick || p.x > this.scale.width / 2) return;
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
  // al centro; pausa e piccioni presi a destra; la riga dei primi secondi in basso.
  private createHud() {
    const { width, height } = this.scale;
    // un fondo scuro mezzo trasparente: barre e livello si leggono anche sopra la luce di un lampione
    this.add.rectangle(SAFE - 4, SAFE - 4, 96, 34, 0x0e0c16, 0.55).setOrigin(0, 0).setScrollFactor(0).setDepth(99);
    this.hud = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.levelText = this.add.text(SAFE + 64, SAFE - 1, "", FONT).setScrollFactor(0).setDepth(100);
    for (let i = 0; i < RUN.lives; i++) {
      this.hearts.push(this.add.image(SAFE + 5 + i * 11, SAFE + 21, "vita").setScrollFactor(0).setDepth(100));
    }
    this.clockText = this.add.text(width / 2, SAFE, "00:00", { ...FONT, fontSize: "16px" }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    const px = width - SAFE - PAUSE_SIZE;
    const pause = this.add.rectangle(px, SAFE, PAUSE_SIZE, PAUSE_SIZE, 0x0e0c16, 0.7).setOrigin(0, 0).setStrokeStyle(1, 0xcfe0ff).setScrollFactor(0).setDepth(100).setInteractive();
    this.add.rectangle(px + 6, SAFE + 5, 2, 8, 0xffffff).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
    this.add.rectangle(px + 10, SAFE + 5, 2, 8, 0xffffff).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
    pause.on("pointerdown", (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.openPause();
    });
    this.add.image(width - SAFE - 6, SAFE + PAUSE_SIZE + 12, "uccisioni").setScrollFactor(0).setDepth(100);
    this.killsText = this.add.text(width - SAFE - 16, SAFE + PAUSE_SIZE + 8, "0", FONT).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    this.hintText = this.add.text(width / 2, height - SAFE - 8, TEXTS.hint, { ...FONT, backgroundColor: "#0e0c16" }).setOrigin(0.5, 1).setPadding(4, 3, 4, 3).setScrollFactor(0).setDepth(100);
    this.drawHud();
  }

  update(_time: number, delta: number) {
    if (!this.cat || this.over) return;
    // L'orologio della scena, non quello del gioco: si ferma durante la scelta delle carte e la pausa e corre doppio
    // con «veloce», quindi armi, invulnerabilità e ciuffi restano d'accordo tra loro.
    const time = this.time.now;
    this.elapsed += delta * this.time.timeScale;
    if (this.elapsed >= this.duration) {
      this.endRun(true);
      return;
    }
    this.moveCat(time);
    this.moveEnemies();
    this.moveKibbles();
    this.expireFur(time);
    this.fireWeapons(time);
    this.spawnOnSchedule();
    this.scrollWorld();
    this.drawJoystick();
    this.clockText.setText(formatClock(this.elapsed));
    if (this.hintText && this.elapsed > RUN.hintMs) {
      this.hintText.destroy();
      this.hintText = null;
    }
    if (this.debugText) this.updateDebug();
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

  private moveEnemies() {
    const target = { x: this.cat.x, y: this.cat.y };
    for (const child of this.enemies.getChildren()) {
      const enemy = child as Sprite;
      if (!enemy.active) continue;
      const v = chase({ x: enemy.x, y: enemy.y }, target, PIGEON.speed);
      enemy.setVelocity(v.x, v.y);
      enemy.setFlipX(v.x < 0);
    }
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

  private expireFur(time: number) {
    for (const child of this.furs.getChildren()) {
      const f = child as Sprite;
      if (f.active && time > (f.getData("dieAt") as number)) f.disableBody(true, true);
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

  // Le ondate: quando arriva il momento nasce un gruppo, e il prossimo si fissa secondo quanta notte è passata.
  private spawnOnSchedule() {
    if (this.elapsed < this.nextSpawnAt) return;
    const plan = spawnPlan(this.elapsed / this.duration);
    this.spawnGroup(plan.groupSize);
    this.nextSpawnAt = this.elapsed + plan.intervalMs;
  }

  private spawnGroup(size: number) {
    if (this.over) return;
    const cam = this.cameras.main;
    const center = spawnPoint(
      { x: cam.midPoint.x, y: cam.midPoint.y },
      this.scale.width / 2,
      this.scale.height / 2,
      SPAWN.margin,
      this.rng,
    );
    for (let i = 0; i < size; i++) {
      const enemy = this.enemies.get(center.x + (i % 3) * 14, center.y + Math.floor(i / 3) * 12, PIGEON.key) as Sprite | null;
      if (!enemy) return;
      enemy.enableBody(true, enemy.x, enemy.y, true, true);
      enemy.setSize(PIGEON.body.width, PIGEON.body.height).setAlpha(1).setDepth(5);
      enemy.setData("hp", PIGEON.health);
      enemy.anims.play("piccione-cammina", true);
    }
  }

  // Ogni arma ha il suo orologio: quando arriva il suo momento parte, e il prossimo colpo si sposta avanti.
  private fireWeapons(time: number) {
    const w = this.stats.weapons;
    if (w.scratch > 0 && time >= this.nextFire.scratch) {
      const lv = SCRATCH_LEVELS[Math.min(w.scratch, SCRATCH_LEVELS.length) - 1];
      this.scratch(lv);
      this.nextFire.scratch = time + lv.cooldownMs;
    }
    if (w.tail > 0 && time >= this.nextFire.tail) {
      const lv = TAIL_LEVELS[Math.min(w.tail, TAIL_LEVELS.length) - 1];
      this.tail(lv);
      this.nextFire.tail = time + lv.cooldownMs;
    }
    if (w.fur > 0 && time >= this.nextFire.fur) {
      const lv = FUR_LEVELS[Math.min(w.fur, FUR_LEVELS.length) - 1];
      this.fur(lv, time);
      this.nextFire.fur = time + lv.cooldownMs;
    }
  }

  private aliveEnemies(): Sprite[] {
    return this.enemies.getChildren().filter((c) => c.active) as Sprite[];
  }

  private playEffect(key: string, x: number, y: number, rotation = 0, scale = 1) {
    const fx = this.effects.get(x, y, key) as Phaser.GameObjects.Sprite | null;
    if (!fx) return;
    fx.setActive(true).setVisible(true).setDepth(20).setRotation(rotation).setScale(scale);
    fx.play(key);
    fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.effects.killAndHide(fx));
  }

  // Il graffio: colpisce il nemico più vicino, se è abbastanza vicino.
  private scratch(lv: (typeof SCRATCH_LEVELS)[number]) {
    const alive = this.aliveEnemies();
    const i = nearestIndex({ x: this.cat.x, y: this.cat.y }, alive, lv.range);
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

  // Il pelo che vola: ciuffi in tutte le direzioni, a raggiera, partendo da un angolo sempre diverso.
  private fur(lv: (typeof FUR_LEVELS)[number], time: number) {
    const start = this.rng() * Math.PI * 2;
    for (let i = 0; i < lv.count; i++) {
      const angle = start + (i * Math.PI * 2) / lv.count;
      const f = this.furs.get(this.cat.x, this.cat.y, "pelo") as Sprite | null;
      if (!f) return;
      f.enableBody(true, this.cat.x, this.cat.y, true, true);
      f.setSize(10, 10).setDepth(15).setRotation(angle);
      f.setVelocity(Math.cos(angle) * lv.speed, Math.sin(angle) * lv.speed);
      f.setData("dieAt", time + lv.lifeMs).setData("damage", lv.damage);
      f.anims.play("pelo-vola", true);
    }
  }

  private furHit(fur: Sprite, enemy: Sprite) {
    if (!fur.active || !enemy.active) return;
    fur.disableBody(true, true);
    this.damageEnemy(enemy, fur.getData("damage") as number);
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

  // Un piccione eliminato lascia una crocchetta dove cade.
  private killEnemy(enemy: Sprite) {
    const { x, y } = enemy;
    enemy.disableBody(true, true);
    this.kills++;
    this.killsText.setText(String(this.kills));
    const k = this.kibbles.get(x, y, "crocchetta") as Sprite | null;
    if (!k) return;
    k.enableBody(true, x, y, true, true);
    k.setSize(8, 8).setDepth(4).setVelocity(0, 0).setData("pulled", false);
    k.anims.play("crocchetta-brilla", true);
  }

  private collect(kibble: Sprite) {
    if (!kibble.active || this.over) return;
    kibble.disableBody(true, true);
    const { state, levelsGained } = addXp(this.xp, KIBBLE.xp);
    this.xp = state;
    this.pendingLevels += levelsGained;
    this.drawHud();
    if (this.pendingLevels > 0 && !this.scene.isActive("LevelUp")) this.openLevelUp();
  }

  // Si sale di livello: la partita si ferma e sopra compare la scelta tra tre carte.
  private openLevelUp() {
    if (this.over) return;
    this.pendingLevels--;
    this.joystick = null;
    this.joystickGfx.clear();
    const choices = drawCards(CARDS, this.levels, this.rng, CARD_WEIGHTS, FALLBACK_CARDS);
    const data: LevelUpData = { choices, levels: { ...this.levels } };
    this.scene.pause();
    this.scene.launch("LevelUp", data);
  }

  private applyCard(id: string) {
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
    this.drawHud();
    this.scene.resume();
    // più livelli in una volta: le scelte arrivano una dopo l'altra
    if (this.pendingLevels > 0) this.time.delayedCall(50, () => this.openLevelUp());
  }

  private onTouch(enemy: Sprite) {
    if (this.over || this.invincible || !enemy.active) return;
    const { health, hit } = takeHit(this.health, PIGEON.damage, this.time.now, CAT.invulnerabilityMs);
    if (!hit) return;
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
    this.health = { ...this.health, current: this.health.max, invulnerableUntil: this.time.now + RUN.respawnInvulnerabilityMs };
    const { width, height } = this.scale;
    const note = this.add.text(width / 2, height / 2 - 28, TEXTS.lifeLost, { ...FONT, color: "#e23a4f", backgroundColor: "#0e0c16" }).setOrigin(0.5).setPadding(4, 3, 4, 3).setScrollFactor(0).setDepth(150);
    this.time.delayedCall(1200, () => note.destroy());
  }

  // La pausa: la partita si ferma e sopra compare PauseScene. Non si apre sopra la scelta delle carte.
  private openPause() {
    if (this.over || !this.scene.isActive() || this.scene.isActive("LevelUp") || this.scene.isActive("Pause")) return;
    this.joystick = null;
    this.joystickGfx.clear();
    this.scene.pause();
    this.scene.launch("Pause");
  }

  // La fine: all'alba (dawn) o senza più vite. Il punteggio e il record li fa EndScene.
  private endRun(dawn: boolean) {
    if (this.over) return;
    this.over = true;
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
    };
    this.scene.stop("LevelUp");
    this.scene.stop("Pause");
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

  // Il pannello di debug, con ?debug nell'indirizzo: fotogrammi, nemici, e tre pulsanti per provare in fretta.
  // Sta sotto la pausa e i piccioni presi, sul lato destro.
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
    button(TEXTS.debugSpawn, top + 38, () => {
      for (let i = 0; i < 7; i++) this.spawnGroup(3);
    });
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
    this.debugText?.setText(`${Math.round(this.game.loop.actualFps)} fps\n${alive} nemici`);
  }
}
