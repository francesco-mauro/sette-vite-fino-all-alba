// La scena di gioco. Tappa 2: il gatto si muove nella notte, i piccioni lo inseguono,
// il graffio parte da solo sul più vicino, e il gatto può finire la vita.
// Le regole (direzione, mira, danno, nascite) stanno in src/logic/ e sono testate; qui si disegna e si collega.
import * as Phaser from "phaser";
import { CAT, PIGEON, SCRATCH, SPAWN } from "../data/balance";
import { TEXTS } from "../data/texts";
import { createHealth, isDead, takeHit, type Health } from "../logic/health";
import { chase, joystickVector, keyboardVector, type Vec } from "../logic/movement";
import { spawnPoint } from "../logic/spawn";
import { nearestIndex } from "../logic/targeting";

type Sprite = Phaser.Physics.Arcade.Sprite;

// Il joystick che compare sotto il pollice: quanto spingere per la velocità piena, in pixel della scena.
const JOYSTICK_RADIUS = 24;
// Distanza dai bordi per tutto ciò che sta fisso sullo schermo: sul telefono gli angoli sono arrotondati
// e in orizzontale c'è il foro della fotocamera (lezione della scritta di prova della tappa 1b).
const SAFE = 12;
// Il lampione si ripete ogni tanto, in un punto diverso di ogni riquadro di strada.
const LAMP_CHUNK = { width: 320, height: 240 };
const FONT = { fontFamily: "Silkscreen", fontSize: "8px", color: "#ffffff" };

export class GameScene extends Phaser.Scene {
  private cat!: Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private scratches!: Phaser.GameObjects.Group;
  private ground!: Phaser.GameObjects.TileSprite;
  private lamps: Phaser.GameObjects.Image[] = [];
  private healthBar!: Phaser.GameObjects.Graphics;
  private joystickGfx!: Phaser.GameObjects.Graphics;
  private keys!: Record<"up" | "down" | "left" | "right" | "w" | "a" | "s" | "d", Phaser.Input.Keyboard.Key>;

  private health: Health = createHealth(CAT.maxHealth);
  private joystick: { pointerId: number; start: Vec; current: Vec } | null = null;
  private over = false;
  private invincible = false;
  private debugText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super("Game");
  }

  // preload: carica le immagini prima che la scena parta.
  preload() {
    this.load.image("casella", "assets/casella.png");
    this.load.image("tombino", "assets/tombino.png");
    this.load.image("foglie", "assets/foglie.png");
    this.load.image("lampione", "assets/lampione.png");
    // strisce di fotogrammi in fila: il gatto (fermo e quattro passi), il piccione (due passi), il graffio (tre)
    this.load.spritesheet("gatto", "assets/gatto.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("piccione", "assets/piccione.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("graffio", "assets/graffio.png", { frameWidth: 32, frameHeight: 32 });
  }

  // create: costruisce la scena, una volta per partita.
  create() {
    this.over = false;
    this.health = createHealth(CAT.maxHealth);
    this.joystick = null;
    this.lamps = [];
    this.debugText = null;

    if (this.registry.get("misura")) {
      this.createStill();
    } else {
      this.createPlay();
    }

    // Un segno sul canvas per la prova di fumo (tests/e2e): la scena è costruita.
    this.game.canvas.dataset.scena = "pronta";
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
    this.createAnimations();

    // Il terreno: una striscia di strada con tombino e foglie, ripetuta all'infinito.
    // È fisso sullo schermo e scorre il disegno, invece di muoversi: così la strada non finisce mai.
    this.ground = this.add.tileSprite(0, 0, width, height, this.makeStreetTexture()).setOrigin(0, 0).setScrollFactor(0);
    for (let i = 0; i < 9; i++) this.lamps.push(this.add.image(0, 0, "lampione"));

    this.cat = this.physics.add.sprite(0, 0, "gatto", 0);
    this.cat.setSize(10, 10).setDepth(10);
    this.cameras.main.startFollow(this.cat, true);

    // Il pool dei nemici: un gruppo con un tetto. I piccioni si prendono con get() e si rimettono via
    // con disableBody, senza crearli e distruggerli ogni volta.
    this.enemies = this.physics.add.group({ maxSize: SPAWN.maxEnemies });
    this.scratches = this.add.group({ maxSize: 40 });

    this.physics.add.overlap(this.cat, this.enemies, (_cat, enemy) => this.onTouch(enemy as Sprite));

    this.time.addEvent({ delay: SCRATCH.cooldownMs, loop: true, callback: this.scratch, callbackScope: this });
    this.time.addEvent({ delay: SPAWN.intervalMs, loop: true, callback: () => this.spawnGroup(SPAWN.groupSize) });
    this.spawnGroup(SPAWN.groupSize);

    this.createInput();
    this.healthBar = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.drawHealth();
    if (new URLSearchParams(location.search).has("debug")) this.createDebug();
  }

  private createAnimations() {
    if (this.anims.exists("gatto-cammina")) return;
    this.anims.create({ key: "gatto-cammina", frames: this.anims.generateFrameNumbers("gatto", { start: 1, end: 4 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: "piccione-cammina", frames: this.anims.generateFrameNumbers("piccione", { start: 0, end: 1 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: "graffio", frames: this.anims.generateFrameNumbers("graffio", { start: 0, end: 2 }), frameRate: 15, repeat: 0 });
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
    }
    // Due dita insieme: uno sul joystick, l'altro libero per i pulsanti.
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

  update(time: number) {
    if (!this.cat || this.over) return;
    this.moveCat(time);
    this.moveEnemies();
    this.scrollWorld();
    this.drawJoystick();
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
    this.cat.setVelocity(dir.x * CAT.speed, dir.y * CAT.speed);
    if (dir.x !== 0 || dir.y !== 0) {
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

  private spawnGroup(size: number) {
    if (this.over) return;
    const cam = this.cameras.main;
    const center = spawnPoint(
      { x: cam.midPoint.x, y: cam.midPoint.y },
      this.scale.width / 2,
      this.scale.height / 2,
      SPAWN.margin,
      Math.random,
    );
    for (let i = 0; i < size; i++) {
      const enemy = this.enemies.get(center.x + (i % 2) * 14, center.y + Math.floor(i / 2) * 12, PIGEON.key) as Sprite | null;
      if (!enemy) return;
      enemy.enableBody(true, enemy.x, enemy.y, true, true);
      enemy.setSize(PIGEON.body.width, PIGEON.body.height).setAlpha(1).setDepth(5);
      enemy.setData("hp", PIGEON.health);
      enemy.anims.play("piccione-cammina", true);
    }
  }

  // Il graffio: ogni secondo colpisce il nemico più vicino, se è abbastanza vicino.
  private scratch() {
    if (this.over) return;
    const alive = this.enemies.getChildren().filter((c) => c.active) as Sprite[];
    const i = nearestIndex({ x: this.cat.x, y: this.cat.y }, alive, SCRATCH.range);
    if (i === -1) return;
    const enemy = alive[i];
    const fx = this.scratches.get(enemy.x, enemy.y, "graffio") as Phaser.GameObjects.Sprite | null;
    if (fx) {
      fx.setActive(true).setVisible(true).setDepth(20);
      fx.play("graffio");
      fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.scratches.killAndHide(fx));
    }
    this.damageEnemy(enemy, SCRATCH.damage);
  }

  private damageEnemy(enemy: Sprite, damage: number) {
    const hp = (enemy.getData("hp") as number) - damage;
    enemy.setData("hp", hp);
    if (hp <= 0) {
      enemy.disableBody(true, true);
      return;
    }
    enemy.setAlpha(0.5);
    this.time.delayedCall(80, () => enemy.active && enemy.setAlpha(1));
  }

  private onTouch(enemy: Sprite) {
    if (this.over || this.invincible || !enemy.active) return;
    const { health, hit } = takeHit(this.health, PIGEON.damage, this.time.now, CAT.invulnerabilityMs);
    if (!hit) return;
    this.health = health;
    this.drawHealth();
    if (isDead(this.health)) this.gameOver();
  }

  private drawHealth() {
    const g = this.healthBar;
    const w = 60;
    const fill = Math.round((w - 2) * (this.health.current / this.health.max));
    g.clear();
    g.fillStyle(0x0e0c16, 1).fillRect(SAFE, SAFE, w, 6);
    g.fillStyle(0xe23a4f, 1).fillRect(SAFE + 1, SAFE + 1, fill, 4);
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

  private gameOver() {
    this.over = true;
    this.joystick = null;
    this.joystickGfx.clear();
    this.physics.pause();
    this.cat.anims.stop();
    this.cat.setAlpha(1);
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x0e0c16, 0.6).setOrigin(0, 0).setScrollFactor(0).setDepth(200);
    this.add.text(width / 2, height / 2 - 12, TEXTS.gameOverTitle, { ...FONT, fontSize: "16px" }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.add.text(width / 2, height / 2 + 12, TEXTS.gameOverRetry, FONT).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    // un attimo prima di accettare il tocco, così un dito ancora sullo schermo non riparte subito
    this.time.delayedCall(600, () => {
      this.input.once("pointerdown", () => this.restart());
      this.input.keyboard?.once("keydown-SPACE", () => this.restart());
    });
  }

  private restart() {
    this.physics.resume();
    this.time.timeScale = 1;
    this.physics.world.timeScale = 1;
    this.anims.globalTimeScale = 1;
    this.scene.restart();
  }

  // Il pannello di debug, con ?debug nell'indirizzo: fotogrammi, nemici, e tre pulsanti per provare in fretta.
  private createDebug() {
    const { width } = this.scale;
    this.debugText = this.add.text(width - SAFE, SAFE, "", { ...FONT, align: "right" }).setOrigin(1, 0).setScrollFactor(0).setDepth(150);
    const button = (label: string, y: number, onTap: () => void) => {
      const t = this.add.text(width - SAFE, y, label, { ...FONT, backgroundColor: "#2c3550" }).setOrigin(1, 0).setPadding(3, 2, 3, 2).setScrollFactor(0).setDepth(150).setInteractive();
      t.on("pointerdown", (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        onTap();
      });
      return t;
    };
    const inv = button(TEXTS.debugInvincible, SAFE + 24, () => {
      this.invincible = !this.invincible;
      inv.setColor(this.invincible ? "#ffc85a" : "#ffffff");
    });
    button(TEXTS.debugSpawn, SAFE + 40, () => {
      for (let i = 0; i < 7; i++) this.spawnGroup(3);
    });
    const fast = button(TEXTS.debugFast, SAFE + 56, () => {
      const on = this.time.timeScale === 1;
      // Arcade conta il contrario: timeScale 0,5 vuol dire fisica due volte più veloce
      this.time.timeScale = on ? 2 : 1;
      this.physics.world.timeScale = on ? 0.5 : 1;
      this.anims.globalTimeScale = on ? 2 : 1;
      fast.setColor(on ? "#ffc85a" : "#ffffff");
    });
  }

  private updateDebug() {
    const alive = this.enemies.countActive(true);
    this.debugText?.setText(`${Math.round(this.game.loop.actualFps)} fps\n${alive} nemici`);
  }
}
