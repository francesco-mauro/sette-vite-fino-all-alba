// La pausa: una scena sopra la partita ferma. Si apre con Esc o P, con il pulsante in alto a destra,
// o da sola quando la scheda o l'app passano in secondo piano.
// Al centro il pulsante grande «riprendi»; riprende anche un tocco in un punto qualsiasi, o Esc.
// «Esci dalla partita» è piccolo, in basso, e vale solo al secondo tocco (src/logic/confirm.ts):
// il primo chiede «sicuro?», così un tocco d'istinto non butta via la notte.
import * as Phaser from "phaser";
import { TEXTS } from "../data/texts";
import { createConfirm } from "../logic/confirm";
import { createTapGuard } from "../logic/tap";

const FONT = { fontFamily: "Silkscreen", fontSize: "8px", color: "#ffffff" };
// quanto resta aperta la domanda «sicuro?»
const CONFIRM_MS = 3000;

export class PauseScene extends Phaser.Scene {
  constructor() {
    super("Pause");
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x0e0c16, 0.7).setOrigin(0, 0);
    this.add.text(width / 2, height / 2 - 44, TEXTS.paused, { ...FONT, fontSize: "16px" }).setOrigin(0.5);
    // il pulsante grande: è solo un disegno, perché riprende un tocco in qualsiasi punto tranne «esci»
    this.add.text(width / 2, height / 2 - 6, TEXTS.resume, { ...FONT, fontSize: "16px", backgroundColor: "#2c3550" })
      .setOrigin(0.5).setPadding(14, 8, 14, 8);
    this.add.text(width / 2, height / 2 + 22, TEXTS.resumeKeys, { ...FONT, color: "#cfe0ff" }).setOrigin(0.5);
    const quit = this.add.text(width / 2, height - 28, TEXTS.quit, { ...FONT, color: "#cfe0ff", backgroundColor: "#1c2133" })
      .setOrigin(0.5).setPadding(4, 3, 4, 3).setInteractive();

    let done = false;
    const resume = () => {
      if (done) return;
      done = true;
      this.scene.resume("Game");
      this.scene.stop();
    };
    const confirm = createConfirm(CONFIRM_MS);
    // il tocco su «esci» vale solo se il dito si appoggia e si alza lì, dopo che la pausa è comparsa
    const quitTap = createTapGuard();
    let ready = false;
    let asks = 0;
    quit.on("pointerdown", (p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      if (ready) quitTap.down(p.id, 0);
    });
    quit.on("pointerup", (p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      if (done || !quitTap.up(p.id, 0)) return;
      if (confirm.press(this.time.now)) {
        done = true;
        this.scene.stop("Game");
        this.scene.start("Title");
        return;
      }
      // la domanda: «esci» diventa rosso e dice cosa fare; dopo CONFIRM_MS torna com'era
      const ask = ++asks;
      quit.setText(TEXTS.quitConfirm).setColor("#ffffff").setBackgroundColor("#e23a4f");
      this.time.delayedCall(CONFIRM_MS, () => {
        if (!done && ask === asks) quit.setText(TEXTS.quit).setColor("#cfe0ff").setBackgroundColor("#1c2133");
      });
    });
    // un attimo prima di accettare il tocco: il dito che ha messo in pausa non deve riprendere subito
    this.time.delayedCall(300, () => {
      ready = true;
      this.input.on("pointerup", resume);
      this.input.keyboard?.on("keydown-ESC", resume);
      this.input.keyboard?.on("keydown-P", resume);
    });
  }
}
