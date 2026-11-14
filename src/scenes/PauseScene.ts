// La pausa: una scena sopra la partita ferma. Si apre con Esc o P, con il pulsante in alto a destra,
// o da sola quando la scheda o l'app passano in secondo piano.
// Al centro il pulsante grande «riprendi»; riprende anche un tocco in un punto qualsiasi, o Esc.
// «Esci dalla partita» è piccolo, in basso, e vale solo al secondo tocco (src/logic/confirm.ts):
// il primo chiede «sicuro?», così un tocco d'istinto non butta via la notte.
// In alto a sinistra, come nel titolo, il pulsante dello schermo intero; anche F lo accende e lo spegne. Sul PC
// Esc fa uscire dallo schermo intero (lo fa il browser) e apre la pausa: da qui si rientra senza riprendere
// (Francesco, 13 novembre 2026: «se premo esc sis ese dallo schermo intero e ppoi non posso rinetrare»).
// Dal 14 novembre in Chrome ed Edge Esc resta al gioco (si esce tenendolo premuto 2 secondi), e altrove
// «riprendi» rimette lo schermo intero spento da quell'Esc (src/scenes/fullscreen.ts).
import * as Phaser from "phaser";
import { TEXTS } from "../data/texts";
import { createConfirm } from "../logic/confirm";
import { fullscreenButton } from "../logic/fullscreenButton";
import { createTapGuard } from "../logic/tap";
import { fullscreenState, restoreAfterPause, toggleFullscreen } from "./fullscreen";
import { FONT } from "./font";

// quanto resta aperta la domanda «sicuro?»
const CONFIRM_MS = 3000;
// il margine dai bordi, come nel titolo
const SAFE = 12;

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
    const openedAt = performance.now();
    const resume = () => {
      if (done) return;
      done = true;
      // se lo stesso Esc che ha aperto la pausa ha spento lo schermo intero, lo rimette. Il browser lo accetta
      // solo dentro un gesto: un tocco, un clic, P. Esc per le regole dei browser non conta come gesto, quindi
      // riprendere con Esc lo rimette solo se un gesto vero è arrivato da poco (in Chrome pochi secondi).
      restoreAfterPause(this, openedAt);
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
    this.createFullscreenButton(() => ready);
    // un attimo prima di accettare il tocco: il dito che ha messo in pausa non deve riprendere subito
    this.time.delayedCall(300, () => {
      ready = true;
      this.input.on("pointerup", resume);
      // Esc tenuto premuto (2 secondi per uscire dallo schermo intero) manda ripetizioni: non riprendono
      this.input.keyboard?.on("keydown-ESC", (e: KeyboardEvent) => {
        if (!e.repeat) resume();
      });
      this.input.keyboard?.on("keydown-P", resume);
      this.input.keyboard?.on("keydown-F", () => toggleFullscreen(this));
    });
  }

  // Il pulsante dello schermo intero, come nel titolo: il nome segue lo stato vero, e non c'è dove lo schermo
  // intero non serve (il gioco installato) o non si può (l'iPhone). Il suo tocco non riprende la partita.
  private createFullscreenButton(ready: () => boolean) {
    if (!fullscreenButton(fullscreenState(this))) return;
    const tap = createTapGuard();
    const button = this.add.text(SAFE, SAFE, "", { ...FONT, backgroundColor: "#2c3550" })
      .setOrigin(0, 0).setPadding(4, 4, 4, 4).setInteractive();
    const label = () => button.setText(fullscreenButton(fullscreenState(this)) === "exit" ? TEXTS.fullscreenExit : TEXTS.fullscreen);
    label();
    this.scale.on(Phaser.Scale.Events.ENTER_FULLSCREEN, label);
    this.scale.on(Phaser.Scale.Events.LEAVE_FULLSCREEN, label);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.ENTER_FULLSCREEN, label);
      this.scale.off(Phaser.Scale.Events.LEAVE_FULLSCREEN, label);
    });
    button.on("pointerdown", (p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      if (ready()) tap.down(p.id, 0);
    });
    button.on("pointerup", (p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      if (tap.up(p.id, 0)) toggleFullscreen(this);
    });
  }
}
