// La fine della partita: l'alba se il gatto è arrivato a fine notte, se no la notte scura.
// Il punteggio, il record (salvato nel browser) e i numeri della partita. Un tocco e si torna al titolo.
import * as Phaser from "phaser";
import { TEXTS } from "../data/texts";
import { formatClock } from "../logic/clock";
import { saveRecord } from "../logic/record";
import { computeScore, type RunResult } from "../shared/score";
import { browserStorage } from "./storage";

const FONT = { fontFamily: "Silkscreen", fontSize: "8px", color: "#ffffff" };

export interface EndData extends RunResult {
  level: number;
}

export class EndScene extends Phaser.Scene {
  private result!: EndData;

  constructor() {
    super("End");
  }

  init(data: EndData) {
    this.result = data;
  }

  create() {
    const { width, height } = this.scale;
    const r = this.result;
    const score = computeScore(r);
    const { record, isNew } = saveRecord(browserStorage(), score);

    if (r.dawn) {
      this.add.image(0, 0, "alba").setOrigin(0, 0);
    } else {
      this.add.image(0, 0, "titolo").setOrigin(0, 0);
    }
    this.add.rectangle(width / 2, 104, 300, 132, 0x0e0c16, 0.8);
    const title = r.dawn ? TEXTS.dawnTitle : TEXTS.gameOverTitle;
    this.add.text(width / 2, 52, title, { ...FONT, fontSize: "16px", color: r.dawn ? "#ffc85a" : "#ffffff" }).setOrigin(0.5);
    if (r.dawn) this.add.text(width / 2, 68, TEXTS.dawnLine, { ...FONT, color: "#cfe0ff" }).setOrigin(0.5);

    const lines = [
      `${TEXTS.score} ${score}`,
      `${TEXTS.time} ${formatClock(r.survivedMs)}   ${TEXTS.kills} ${r.kills}   ${TEXTS.level} ${r.level}`,
      isNew ? TEXTS.newRecord : `${TEXTS.record} ${record}`,
    ];
    lines.forEach((line, i) => {
      const color = i === 2 && isNew ? "#a6f05a" : "#ffffff";
      this.add.text(width / 2, 92 + i * 18, line, { ...FONT, color }).setOrigin(0.5);
    });

    const prompt = this.add.text(width / 2, height - 30, TEXTS.backToTitle, { ...FONT, backgroundColor: "#0e0c16" }).setOrigin(0.5).setPadding(4, 3, 4, 3);
    this.tweens.add({ targets: prompt, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });
    this.game.canvas.dataset.scena = "fine";

    // un secondo prima di accettare il tocco: il dito che stava giocando non deve saltare il punteggio
    const back = () => this.scene.start("Title");
    this.time.delayedCall(1000, () => {
      this.input.once("pointerup", back);
      this.input.keyboard?.once("keydown-SPACE", back);
    });
  }
}
