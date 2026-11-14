// La cassa del tesoro aperta: una scena sopra la partita, che intanto è ferma.
// La cassa trema, si apre con un lampo e ne escono le carte vinte, una o tre, con icona, nome, livello
// e cosa fanno: sono le stesse carte della scelta al livello (cardView.ts), solo già scelte.
// I poteri sono già presi quando la scena compare (GameScene.takeChest): qui si guardano soltanto.
// Si continua con un tocco, o con spazio, invio o Esc; la partita riprende con un attimo di protezione.
import * as Phaser from "phaser";
import { TEXTS } from "../data/texts";
import { createTapGuard, type TapGuard } from "../logic/tap";
import { CARD_W, FONT, drawCard } from "./cardView";

export interface ChestData {
  gained: string[];
  // i livelli prima della cassa: ogni carta mostra il livello a cui porta
  levels: Record<string, number>;
}

// le carte che non hanno livelli: si usano e basta
const NO_LEVEL = new Set(["heal", "points"]);

export class ChestScene extends Phaser.Scene {
  private gained: string[] = [];
  private levels: Record<string, number> = {};
  private ready = false;
  private done = false;
  private tap: TapGuard = createTapGuard();

  constructor() {
    super("Chest");
  }

  init(data: ChestData) {
    this.gained = data.gained;
    this.levels = { ...data.levels };
    this.ready = false;
    this.done = false;
    this.tap = createTapGuard();
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x0e0c16, 0.7).setOrigin(0, 0);

    // la cassa trema, poi un lampo dorato e al suo posto le carte
    const chest = this.add.sprite(width / 2, height / 2, "cassa", 1).setScale(4);
    this.tweens.add({ targets: chest, angle: { from: -8, to: 8 }, duration: 70, yoyo: true, repeat: 3, onComplete: () => this.open(chest) });

    const kb = this.input.keyboard;
    // un tasto tenuto premuto (Esc per 2 secondi esce dallo schermo intero) manda ripetizioni: non chiudono
    kb?.on("keydown", (e: KeyboardEvent) => {
      if (!e.repeat && (e.key === " " || e.key === "Enter" || e.key === "Escape")) this.close();
    });
    // il dito che stava sul joystick quando si è presa la cassa non ha un "giù" qui: alzandolo non chiude
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (this.ready) this.tap.down(p.id, 0);
    });
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => {
      if (this.tap.up(p.id, 0)) this.close();
    });
  }

  private open(chest: Phaser.GameObjects.Sprite) {
    const { width, height } = this.scale;
    chest.destroy();
    const flash = this.add.rectangle(0, 0, width, height, 0xffc85a, 0.8).setOrigin(0, 0);
    this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });

    const title = this.gained.length > 1 ? TEXTS.chestTriple : TEXTS.chest;
    // sotto l'orologio della partita, sopra le carte
    this.add.text(width / 2, 58, title, { ...FONT, fontSize: "16px", color: "#ffc85a" }).setOrigin(0.5);

    const gap = 16;
    const total = this.gained.length * CARD_W + (this.gained.length - 1) * gap;
    const levels = { ...this.levels };
    this.gained.forEach((id, i) => {
      const x = Math.round(width / 2 - total / 2 + i * (CARD_W + gap) + CARD_W / 2);
      const card = this.add.container(x, Math.round(height / 2 + 14));
      card.add(drawCard(this, id, 0, 0, levels).parts);
      if (!NO_LEVEL.has(id)) levels[id] = (levels[id] ?? 0) + 1;
      // ogni carta esce dalla cassa: da piccola a grande, una dopo l'altra
      card.setScale(0);
      this.tweens.add({ targets: card, scale: 1, duration: 260, delay: 120 + i * 160, ease: "Back.easeOut" });
    });

    // un attimo dopo l'ultima carta si può continuare
    this.time.delayedCall(120 + this.gained.length * 160 + 400, () => {
      this.ready = true;
      this.add.text(width / 2, height - 14, TEXTS.chestContinue, { ...FONT, color: "#cfe0ff" }).setOrigin(0.5);
    });
  }

  private close() {
    if (!this.ready || this.done) return;
    this.done = true;
    this.input.keyboard?.removeAllListeners();
    this.scene.get("Game").events.emit("chest-closed");
    this.scene.stop();
  }
}
