// Il titolo: Roma di notte, il nome del gioco, il record. Un tocco o lo spazio e si gioca.
import * as Phaser from "phaser";
import { TEXTS } from "../data/texts";
import { loadRecord } from "../logic/record";
import { browserStorage } from "./storage";

const FONT = { fontFamily: "Silkscreen", fontSize: "8px", color: "#ffffff" };

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title");
  }

  create() {
    const { width, height } = this.scale;
    this.add.image(0, 0, "titolo").setOrigin(0, 0);
    // il nome sta nel cielo, sopra la cupola, con un'ombra scura sotto per staccarlo dalle stelle
    this.add.text(width / 2 + 1, 37, TEXTS.title, { ...FONT, fontSize: "16px", color: "#0e0c16" }).setOrigin(0.5);
    this.add.text(width / 2, 36, TEXTS.title, { ...FONT, fontSize: "16px", color: "#ffc85a" }).setOrigin(0.5);

    const prompt = this.add.text(width / 2, height - 52, TEXTS.tapToPlay, { ...FONT, backgroundColor: "#0e0c16" }).setOrigin(0.5).setPadding(4, 3, 4, 3);
    this.tweens.add({ targets: prompt, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });
    const record = loadRecord(browserStorage());
    if (record > 0) {
      this.add.text(width / 2, height - 34, `${TEXTS.record} ${record}`, { ...FONT, color: "#cfe0ff", backgroundColor: "#0e0c16" }).setOrigin(0.5).setPadding(4, 2, 4, 2);
    }

    // Un segno sul canvas per la prova di fumo (tests/e2e): immagini caricate, titolo pronto.
    this.game.canvas.dataset.scena = "pronta";

    const start = () => this.scene.start("Game");
    this.time.delayedCall(300, () => {
      this.input.once("pointerdown", start);
      this.input.keyboard?.once("keydown-SPACE", start);
      this.input.keyboard?.once("keydown-ENTER", start);
    });
  }
}
