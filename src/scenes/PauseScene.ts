// La pausa: una scena sopra la partita ferma. Si apre con Esc o P, con il pulsante in alto a destra,
// o da sola quando la scheda o l'app passano in secondo piano. Si riprende con un tocco o con Esc.
import * as Phaser from "phaser";
import { TEXTS } from "../data/texts";

const FONT = { fontFamily: "Silkscreen", fontSize: "8px", color: "#ffffff" };

export class PauseScene extends Phaser.Scene {
  constructor() {
    super("Pause");
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x0e0c16, 0.7).setOrigin(0, 0);
    this.add.text(width / 2, height / 2 - 24, TEXTS.paused, { ...FONT, fontSize: "16px" }).setOrigin(0.5);
    this.add.text(width / 2, height / 2, TEXTS.resume, { ...FONT, color: "#cfe0ff" }).setOrigin(0.5);
    const quit = this.add.text(width / 2, height / 2 + 32, TEXTS.quit, { ...FONT, backgroundColor: "#2c3550" }).setOrigin(0.5).setPadding(4, 3, 4, 3).setInteractive();

    let done = false;
    const resume = () => {
      if (done) return;
      done = true;
      this.scene.resume("Game");
      this.scene.stop();
    };
    quit.on("pointerup", (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      done = true;
      this.scene.stop("Game");
      this.scene.start("Title");
    });
    // un attimo prima di accettare il tocco: il dito che ha messo in pausa non deve riprendere subito
    this.time.delayedCall(300, () => {
      this.input.on("pointerup", resume);
      this.input.keyboard?.on("keydown-ESC", resume);
      this.input.keyboard?.on("keydown-P", resume);
    });
  }
}
