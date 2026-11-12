// Il titolo: Roma di notte, il nome del gioco e la scelta della notte, 5, 10 o 15 minuti, con il suo record.
// Sul telefono si tocca una notte e si gioca; sul computer 1, 2, 3 o le frecce per scegliere, spazio o invio per partire.
// Il tocco vale solo se il dito si appoggia e si alza sullo stesso pulsante (src/logic/tap.ts), come per le carte.
// In basso a sinistra la versione, in basso a destra il pulsante «aggiornamenti» (o U): chiede al server
// l'ultima versione e, se è nuova, la installa e riapre il gioco. In alto a sinistra «schermo intero» (o F),
// dove il browser lo permette.
//
// Contenuti:
// - create: sfondo, nome, scelta della notte, record, versione, aggiornamenti, schermo intero, tasti
// - select: la notte evidenziata e il suo record
// - checkUpdates: il pulsante degli aggiornamenti
// - start: parte la notte scelta
import * as Phaser from "phaser";
import { TEXTS } from "../data/texts";
import { NIGHTS, loadNight, saveNight } from "../logic/night";
import { loadRecord } from "../logic/record";
import { createTapGuard } from "../logic/tap";
import { updateStatus, versionLabel } from "../logic/version";
import { canFullscreen, toggleFullscreen } from "./fullscreen";
import { browserStorage } from "./storage";
import { applyUpdate, latestBuildId } from "./update";
import { FONT } from "./font";

const BUTTON_W = 64;
const BUTTON_H = 20;
const GAP = 10;
// dai bordi: sul telefono gli angoli sono arrotondati
const SAFE = 12;

export class TitleScene extends Phaser.Scene {
  private selected = 0;
  private buttons: Phaser.GameObjects.Rectangle[] = [];
  private labels: Phaser.GameObjects.Text[] = [];
  private recordText!: Phaser.GameObjects.Text;
  private started = false;
  private checking = false;
  private updateText!: Phaser.GameObjects.Text;

  constructor() {
    super("Title");
  }

  create() {
    const { width, height } = this.scale;
    const storage = browserStorage();
    this.buttons = [];
    this.labels = [];
    this.started = false;
    this.checking = false;
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

    // la versione e il pulsante degli aggiornamenti, piccoli negli angoli in basso
    const small = { ...FONT, color: "#cfe0ff", backgroundColor: "#0e0c16" };
    this.add.text(SAFE, height - SAFE, versionLabel(SETTE_VITE_BUILD), small).setOrigin(0, 1).setPadding(3, 2, 3, 2);
    const updateTap = createTapGuard();
    const updateButton = this.add.text(width - SAFE, height - SAFE, TEXTS.updates, { ...FONT, backgroundColor: "#2c3550" })
      .setOrigin(1, 1).setPadding(4, 4, 4, 4).setInteractive();
    updateButton.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (ready) updateTap.down(p.id, 0);
    });
    updateButton.on("pointerup", (p: Phaser.Input.Pointer) => {
      if (updateTap.up(p.id, 0)) void this.checkUpdates();
    });
    this.updateText = this.add.text(width - SAFE, height - SAFE - 22, "", small).setOrigin(1, 1).setPadding(3, 2, 3, 2).setVisible(false);

    // lo schermo intero, in alto a sinistra: sul PC la scena entra 4 volte invece di 3
    if (canFullscreen(this)) {
      const fullTap = createTapGuard();
      const fullButton = this.add.text(SAFE, SAFE, TEXTS.fullscreen, { ...FONT, backgroundColor: "#2c3550" })
        .setOrigin(0, 0).setPadding(4, 4, 4, 4).setInteractive();
      fullButton.on("pointerdown", (p: Phaser.Input.Pointer) => {
        if (ready) fullTap.down(p.id, 0);
      });
      fullButton.on("pointerup", (p: Phaser.Input.Pointer) => {
        if (fullTap.up(p.id, 0)) toggleFullscreen(this);
      });
    }

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
        if (e.key === "u" || e.key === "U") void this.checkUpdates();
        if (e.key === "f" || e.key === "F") toggleFullscreen(this);
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

  // checkUpdates: chiede al server l'ultima versione; se è nuova la installa e riapre il gioco
  private async checkUpdates() {
    if (this.checking || this.started) return;
    this.checking = true;
    this.updateText.setText(TEXTS.updateChecking).setVisible(true);
    const status = updateStatus(SETTE_VITE_BUILD.id, await latestBuildId());
    if (status === "nuova") {
      this.updateText.setText(TEXTS.updateFound);
      await applyUpdate();
      return;
    }
    this.updateText.setText(status === "aggiornato" ? TEXTS.updateNone : TEXTS.updateOffline);
    this.checking = false;
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
