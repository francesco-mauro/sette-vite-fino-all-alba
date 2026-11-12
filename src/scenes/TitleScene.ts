// Il titolo: Roma di notte, il nome del gioco e la scelta della notte, 5, 10 o 15 minuti, con il suo record.
// Sul telefono si tocca una notte e si gioca; sul computer 1, 2, 3 o le frecce per scegliere, spazio o invio per partire.
// Il tocco vale solo se il dito si appoggia e si alza sullo stesso pulsante (src/logic/tap.ts), come per le carte.
import * as Phaser from "phaser";
import { TEXTS } from "../data/texts";
import { NIGHTS, loadNight, saveNight } from "../logic/night";
import { loadRecord } from "../logic/record";
import { createTapGuard } from "../logic/tap";
import { browserStorage } from "./storage";

const FONT = { fontFamily: "Silkscreen", fontSize: "8px", color: "#ffffff" };
const BUTTON_W = 64;
const BUTTON_H = 20;
const GAP = 10;

export class TitleScene extends Phaser.Scene {
  private selected = 0;
  private buttons: Phaser.GameObjects.Rectangle[] = [];
  private labels: Phaser.GameObjects.Text[] = [];
  private recordText!: Phaser.GameObjects.Text;
  private started = false;

  constructor() {
    super("Title");
  }

  create() {
    const { width, height } = this.scale;
    const storage = browserStorage();
    this.buttons = [];
    this.labels = [];
    this.started = false;
    this.selected = Math.max(0, (NIGHTS as readonly number[]).indexOf(loadNight(storage)));

    this.add.image(0, 0, "titolo").setOrigin(0, 0);
    // il nome sta nel cielo, sopra la cupola, con un'ombra scura sotto per staccarlo dalle stelle
    this.add.text(width / 2 + 1, 37, TEXTS.title, { ...FONT, fontSize: "16px", color: "#0e0c16" }).setOrigin(0.5);
    this.add.text(width / 2, 36, TEXTS.title, { ...FONT, fontSize: "16px", color: "#ffc85a" }).setOrigin(0.5);

    this.add.text(width / 2, height - 74, TEXTS.chooseNight, { ...FONT, backgroundColor: "#0e0c16" }).setOrigin(0.5).setPadding(4, 3, 4, 3);
    const tap = createTapGuard();
    let ready = false;
    const total = NIGHTS.length * BUTTON_W + (NIGHTS.length - 1) * GAP;
    NIGHTS.forEach((minutes, i) => {
      const x = Math.round(width / 2 - total / 2 + i * (BUTTON_W + GAP) + BUTTON_W / 2);
      const y = height - 50;
      const button = this.add.rectangle(x, y, BUTTON_W, BUTTON_H, 0x0e0c16, 0.85).setStrokeStyle(1, 0xcfe0ff).setInteractive();
      this.buttons.push(button);
      this.labels.push(this.add.text(x, y, `${minutes} ${TEXTS.minutes}`, FONT).setOrigin(0.5));
      button.on("pointerover", () => this.select(i));
      button.on("pointerdown", (p: Phaser.Input.Pointer) => {
        if (ready) tap.down(p.id, i);
      });
      button.on("pointerup", (p: Phaser.Input.Pointer) => {
        if (tap.up(p.id, i)) this.start(i);
      });
    });
    this.recordText = this.add.text(width / 2, height - 28, "", { ...FONT, color: "#cfe0ff", backgroundColor: "#0e0c16" }).setOrigin(0.5).setPadding(4, 2, 4, 2);
    this.select(this.selected);

    // Un segno sul canvas per la prova di fumo (tests/e2e): immagini caricate, titolo pronto.
    this.game.canvas.dataset.scena = "pronta";

    this.time.delayedCall(300, () => {
      ready = true;
      this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
        const n = Number(e.key);
        if (n >= 1 && n <= NIGHTS.length) this.start(n - 1);
        if (e.key === "ArrowLeft") this.select((this.selected + NIGHTS.length - 1) % NIGHTS.length);
        if (e.key === "ArrowRight") this.select((this.selected + 1) % NIGHTS.length);
        if (e.key === " " || e.key === "Enter") this.start(this.selected);
      });
    });
  }

  // select: evidenzia una notte e mostra il suo record
  private select(index: number) {
    this.selected = index;
    this.buttons.forEach((b, i) => b.setStrokeStyle(i === index ? 2 : 1, i === index ? 0xffc85a : 0xcfe0ff));
    this.labels.forEach((t, i) => t.setColor(i === index ? "#ffc85a" : "#ffffff"));
    const minutes = NIGHTS[index];
    const record = loadRecord(browserStorage(), minutes);
    this.recordText.setText(record > 0 ? `${TEXTS.record} ${minutes} ${TEXTS.minutes}: ${record}` : "");
    this.recordText.setVisible(record > 0);
  }

  // start: ricorda la scelta e parte con quella notte
  private start(index: number) {
    if (this.started) return;
    this.started = true;
    this.input.keyboard?.removeAllListeners();
    const minutes = NIGHTS[index];
    saveNight(browserStorage(), minutes);
    this.scene.start("Game", { minutes });
  }
}
