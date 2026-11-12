// La scelta tra tre carte: una scena sopra la partita, che intanto è ferma e scurita.
// Riceve le tre carte già estratte (src/logic/cards.ts) e restituisce quella scelta con l'evento "card-picked".
// Sul telefono si tocca la carta; sul computer anche 1, 2, 3, oppure frecce e invio.
// Il tocco vale solo se il dito si appoggia sulla carta dopo che è comparsa (src/logic/tap.ts).
import * as Phaser from "phaser";
import { TEXTS } from "../data/texts";
import { createTapGuard, type TapGuard } from "../logic/tap";
import { CARD_W, FONT, drawCard } from "./cardView";

export interface LevelUpData {
  choices: string[];
  levels: Record<string, number>;
}

export class LevelUpScene extends Phaser.Scene {
  private choices: string[] = [];
  private frames: Phaser.GameObjects.Rectangle[] = [];
  private selected = 0;
  private ready = false;
  private levels: Record<string, number> = {};
  private tap: TapGuard = createTapGuard();

  constructor() {
    super("LevelUp");
  }

  init(data: LevelUpData) {
    this.choices = data.choices;
    this.selected = 0;
    this.frames = [];
    this.ready = false;
    this.levels = data.levels;
    this.tap = createTapGuard();
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x0e0c16, 0.7).setOrigin(0, 0);
    this.add.text(width / 2, 34, TEXTS.chooseCard, { ...FONT, fontSize: "16px" }).setOrigin(0.5);

    const gap = 16;
    const total = this.choices.length * CARD_W + (this.choices.length - 1) * gap;
    this.choices.forEach((id, i) => {
      const x = Math.round(width / 2 - total / 2 + i * (CARD_W + gap) + CARD_W / 2);
      this.drawCard(id, x, Math.round(height / 2 + 14), i);
    });
    this.highlight();

    // Un attimo prima di accettare la scelta, anche da tastiera: un tasto premuto mentre le carte compaiono non sceglie.
    this.time.delayedCall(400, () => (this.ready = true));
    const kb = this.input.keyboard;
    kb?.on("keydown", (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= String(this.choices.length)) this.pick(Number(e.key) - 1);
      if (e.key === "ArrowLeft") this.move(-1);
      if (e.key === "ArrowRight") this.move(1);
      if (e.key === "Enter" || e.key === " ") this.pick(this.selected);
    });
  }

  private drawCard(id: string, x: number, y: number, index: number) {
    const { frame } = drawCard(this, id, x, y, this.levels);
    this.frames.push(frame);

    frame.setInteractive();
    frame.on("pointerover", () => {
      this.selected = index;
      this.highlight();
    });
    // il dito che stava sul joystick quando si è saliti di livello non ha un "giù" qui: alzandolo non sceglie
    frame.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (this.ready) this.tap.down(p.id, index);
    });
    frame.on("pointerup", (p: Phaser.Input.Pointer) => {
      if (this.tap.up(p.id, index)) this.pick(index);
    });
  }

  private move(step: number) {
    this.selected = (this.selected + step + this.choices.length) % this.choices.length;
    this.highlight();
  }

  private highlight() {
    this.frames.forEach((f, i) => f.setFillStyle(i === this.selected ? 0x2c3550 : 0x1c2133, 1));
  }

  private pick(index: number) {
    if (!this.ready) return;
    this.ready = false;
    this.input.keyboard?.removeAllListeners();
    this.scene.get("Game").events.emit("card-picked", this.choices[index]);
    this.scene.stop();
  }
}
