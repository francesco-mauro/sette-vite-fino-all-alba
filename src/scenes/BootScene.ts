// Il caricamento: tutte le immagini una volta sola, con una barra, poi il titolo.
// Con ?misura si salta il titolo e parte la scena ferma della misura, come alla tappa 1a.
import * as Phaser from "phaser";
import { TEXTS } from "../data/texts";
import { FONT as BASE_FONT } from "./font";

const FONT = { ...BASE_FONT, color: "#cfe0ff" };

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 14, TEXTS.loading, FONT).setOrigin(0.5);
    const bar = this.add.graphics();
    this.load.on(Phaser.Loader.Events.PROGRESS, (p: number) => {
      bar.clear();
      bar.fillStyle(0x0e0c16, 1).fillRect(width / 2 - 61, height / 2 - 3, 122, 6);
      bar.fillStyle(0xffc85a, 1).fillRect(width / 2 - 60, height / 2 - 2, Math.round(120 * p), 4);
    });

    for (const key of ["casella", "tombino", "erba", "lampione", "vita", "uccisioni", "titolo", "alba"]) {
      this.load.image(key, `assets/${key}.png`);
    }
    // strisce di fotogrammi in fila
    this.load.spritesheet("gatto", "assets/gatto.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("piccione", "assets/piccione.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("zanzara", "assets/zanzara.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("pantegana", "assets/pantegana.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("cornacchia", "assets/cornacchia.png", { frameWidth: 16, frameHeight: 16 });
    // i due capi sono grandi il doppio
    this.load.spritesheet("gabbiano", "assets/gabbiano.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("gabbiano-reale", "assets/gabbiano-reale.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("crocchetta", "assets/crocchetta.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("cassa", "assets/cassa.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("suppli", "assets/suppli.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("graffio", "assets/graffio.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("coda", "assets/coda.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("pelo", "assets/pelo.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("miagolio", "assets/miagolio.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("carte", "assets/carte.png", { frameWidth: 16, frameHeight: 16 });
  }

  create() {
    this.scene.start(this.registry.get("misura") ? "Game" : "Title");
  }
}
