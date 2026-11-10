// La scena della misura. Si accende solo con ?misura nell'indirizzo e gira sopra la scena del gioco.
// Serve a rispondere presto a una domanda: Phaser 4 regge tanti sprite sul telefono di prova?
import Phaser from "phaser";
import VirtualJoyStick from "phaser4-rex-plugins/plugins/virtualjoystick.js";
import { createMeasurePanel, type MeasurePanel } from "../debug/measurePanel";
import { createFrameMeter } from "../logic/frameMeter";
import { MEASURE_MAX, nextMeasureCount } from "../logic/measureParam";
import { formatJoystick, formatStats } from "../logic/measureText";

const FAKE_KEY = "segnaposto";
const FAKE_ANIM = "segnaposto-passo";
// I colori dello sprite finto, presi dalla palette Lampione: inchiostro, piccione, lampadina.
const INK = "#0e0c16";
const PIGEON = "#9a9cc0";
const BULB = "#fff4c2";
const JOYSTICK_RADIUS = 24;
const PANEL_EVERY_MS = 500; // il pannello si riscrive due volte al secondo, non a ogni fotogramma

export class MeasureScene extends Phaser.Scene {
  private count: number;
  private fakes!: Phaser.Physics.Arcade.Group;
  private joystick!: VirtualJoyStick;
  private panel!: MeasurePanel;
  private readonly meter = createFrameMeter();
  private frameStart = 0;
  private lastPanelUpdate = 0;

  constructor(count: number) {
    super({ key: "Measure", active: true });
    this.count = count;
  }

  // create: costruisce la misura, una volta sola.
  create() {
    this.createFakeTexture();

    // Gli sprite finti stanno in un gruppo con la fisica Arcade, come staranno i nemici veri:
    // ognuno ha una velocità e rimbalza sui bordi della scena.
    this.fakes = this.physics.add.group({
      defaultKey: FAKE_KEY,
      defaultFrame: 0,
      maxSize: MEASURE_MAX,
      collideWorldBounds: true,
      bounceX: 1,
      bounceY: 1,
    });

    // Il joystick di phaser4-rex-plugins, fermo in basso a sinistra. Per ora non muove niente:
    // qui si prova solo che con Phaser 4 si importa e risponde al tocco.
    // setDepth lo tiene sopra gli sprite finti, che nascono dopo e se no lo coprirebbero.
    const base = this.add.circle(0, 0, JOYSTICK_RADIUS, 0xffffff, 0.12).setStrokeStyle(1, 0xffffff, 0.4).setDepth(10);
    const thumb = this.add.circle(0, 0, 10, 0xffffff, 0.4).setDepth(11);
    this.joystick = new VirtualJoyStick(this, {
      x: 56,
      y: this.scale.height - 56,
      radius: JOYSTICK_RADIUS,
      base,
      thumb,
    });

    this.panel = createMeasurePanel({
      onNextCount: () => this.setFakeCount(nextMeasureCount(this.count)),
    });
    this.setFakeCount(this.count);

    // Il contatore ascolta il gioco intero, non solo questa scena:
    // PRE_STEP arriva prima che il fotogramma cominci, POST_RENDER dopo che è stato disegnato.
    const events = this.game.events;
    events.on(Phaser.Core.Events.PRE_STEP, this.onFrameStart, this);
    events.on(Phaser.Core.Events.POST_RENDER, this.onFrameEnd, this);
    events.on(Phaser.Core.Events.VISIBLE, this.onVisible, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      events.off(Phaser.Core.Events.PRE_STEP, this.onFrameStart, this);
      events.off(Phaser.Core.Events.POST_RENDER, this.onFrameEnd, this);
      events.off(Phaser.Core.Events.VISIBLE, this.onVisible, this);
      this.panel.destroy();
    });
  }

  // createFakeTexture: disegna dal codice lo sprite finto, due fotogrammi da 16x16 uno accanto all'altro.
  // Nel secondo il corpo è un pixel più in alto, così l'animazione lo fa saltellare.
  private createFakeTexture() {
    const texture = this.textures.createCanvas(FAKE_KEY, 32, 16);
    if (!texture) throw new Error(`la texture ${FAKE_KEY} esiste già`);
    const ctx = texture.getContext();
    for (const frame of [0, 1]) {
      const x = frame * 16;
      const y = 4 - frame;
      ctx.fillStyle = INK;
      ctx.fillRect(x + 3, y, 10, 10);
      ctx.fillStyle = PIGEON;
      ctx.fillRect(x + 4, y + 1, 8, 8);
      ctx.fillStyle = BULB;
      ctx.fillRect(x + 6, y + 3, 1, 2);
      ctx.fillRect(x + 9, y + 3, 1, 2);
      texture.add(frame, 0, x, 0, 16, 16);
    }
    texture.refresh();

    this.anims.create({
      key: FAKE_ANIM,
      frames: [
        { key: FAKE_KEY, frame: 0 },
        { key: FAKE_KEY, frame: 1 },
      ],
      frameRate: 4,
      repeat: -1,
    });
  }

  // setFakeCount: porta gli sprite finti al numero chiesto.
  // Quelli in più non si distruggono: si spengono e restano nel gruppo, pronti a tornare. È il pool di oggetti.
  private setFakeCount(target: number) {
    let active = this.fakes.countActive(true);
    while (active < target && this.spawnFake()) active++;
    for (const child of this.fakes.getChildren()) {
      if (active <= target) break;
      if (!child.active) continue;
      (child as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
      active--;
    }
    this.count = active;
    this.panel.setCount(active);
    this.meter.reset(); // i numeri di prima non valgono più
  }

  // spawnFake: accende uno sprite finto in un punto a caso, con una direzione e una velocità a caso.
  // Restituisce false se il gruppo è pieno.
  private spawnFake(): boolean {
    const x = Phaser.Math.Between(8, this.scale.width - 8);
    const y = Phaser.Math.Between(8, this.scale.height - 8);
    const fake = this.fakes.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
    if (!fake) return false;
    fake.enableBody(true, x, y, true, true);
    const direction = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speed = Phaser.Math.Between(20, 60); // pixel al secondo
    fake.setVelocity(Math.cos(direction) * speed, Math.sin(direction) * speed);
    fake.play({ key: FAKE_ANIM, startFrame: Phaser.Math.Between(0, 1) });
    return true;
  }

  // onFrameStart: segna l'ora in cui il fotogramma comincia.
  // Si usa performance.now() e non il tempo di Phaser, che è smussato e nasconderebbe i buchi.
  private onFrameStart() {
    this.frameStart = performance.now();
  }

  // onFrameEnd: a fotogramma disegnato registra quanto è durato il calcolo, e ogni tanto riscrive il pannello.
  private onFrameEnd() {
    const now = performance.now();
    this.meter.record(this.frameStart, now - this.frameStart);
    if (now - this.lastPanelUpdate < PANEL_EVERY_MS) return;
    this.lastPanelUpdate = now;
    this.panel.setLines([
      formatStats(this.meter.read(now)),
      this.describeScreen(),
      formatJoystick(this.joystick.force / JOYSTICK_RADIUS, this.joystick.angle),
    ]);
  }

  // onVisible: quando la scheda torna visibile il contatore riparte, se no la pausa conterebbe come un buco enorme.
  private onVisible() {
    this.meter.reset();
  }

  // describeScreen: la riga che dice in che condizioni si sta misurando.
  private describeScreen(): string {
    const dpr = window.devicePixelRatio || 1;
    const zoom = Math.round(this.scale.zoom * dpr);
    const renderer = this.game.renderer.type === Phaser.WEBGL ? "WebGL" : "Canvas";
    return `${this.count} sprite · scala ×${zoom} · ${renderer} · ${window.innerWidth}×${window.innerHeight} dpr ${dpr.toFixed(3)}`; // tre decimali: 2,875 e 2,88 danno ingrandimenti diversi
  }
}
