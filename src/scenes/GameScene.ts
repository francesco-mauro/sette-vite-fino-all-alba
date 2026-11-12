// La scena di gioco. Per la tappa 1a: il gatto fermo sui sampietrini, sotto un lampione.
import * as Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  // preload: carica le immagini prima che la scena parta.
  preload() {
    this.load.image("casella", "assets/casella.png");
    this.load.image("tombino", "assets/tombino.png");
    this.load.image("foglie", "assets/foglie.png");
    this.load.image("lampione", "assets/lampione.png");
    // il gatto è una striscia di 5 fotogrammi da 16x16: fermo, poi i quattro passi
    this.load.spritesheet("gatto", "assets/gatto.png", { frameWidth: 16, frameHeight: 16 });
  }

  // create: costruisce la scena, una volta sola.
  create() {
    const { width, height } = this.scale;

    // Il terreno: una casella di sampietrini ripetuta su tutta la scena, come una carta da parati.
    this.add.tileSprite(0, 0, width, height, "casella").setOrigin(0, 0);
    // qualche tombino e un po' di foglie, sempre negli stessi posti
    for (const [x, y] of [[96, 64], [352, 176], [224, 224]]) this.add.image(x, y, "tombino").setOrigin(0, 0);
    for (const [x, y] of [[48, 192], [416, 48], [304, 96]]) this.add.image(x, y, "foglie").setOrigin(0, 0);

    // Il lampione con la sua pozza di luce, il gatto ci sta dentro.
    this.add.image(width / 2 + 16, height / 2 - 16, "lampione");

    // Il gatto: fotogramma 0, quello fermo, al centro.
    this.add.sprite(width / 2, height / 2, "gatto", 0);

    // Un segno sul canvas per la prova di fumo (tests/e2e): la scena è costruita.
    this.game.canvas.dataset.scena = "pronta";
  }
}
