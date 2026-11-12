// La mappa grande: si apre toccando la minimappa o con M, sopra la partita ferma, come la pausa.
// Mostra il gatto al centro, i piccioni e le casse del tesoro, anche quelle lontane (sul bordo, nella loro
// direzione). Si torna a giocare con un tocco, con M o con Esc.
import * as Phaser from "phaser";
import { TEXTS } from "../data/texts";
import type { Point } from "../logic/chest";
import { toMinimap } from "../logic/minimap";
import { FONT } from "./font";

// la mappa grande: 100 pixel dal centro al bordo, per 1000 pixel di mondo
const HALF = 100;
const RANGE = 1000;

export interface MapData {
  cat: Point;
  chests: Point[];
  enemies: Point[];
}

export class MapScene extends Phaser.Scene {
  constructor() {
    super("Map");
  }

  create(data: MapData) {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2 + 6;
    this.add.rectangle(0, 0, width, height, 0x0e0c16, 0.7).setOrigin(0, 0);
    this.add.text(cx, cy - HALF - 14, TEXTS.mapClose, { ...FONT, color: "#cfe0ff" }).setOrigin(0.5);
    const g = this.add.graphics();
    g.fillStyle(0x1c2133, 0.95).fillRect(cx - HALF, cy - HALF, HALF * 2, HALF * 2);
    g.lineStyle(1, 0xcfe0ff, 1).strokeRect(cx - HALF, cy - HALF, HALF * 2, HALF * 2);
    g.fillStyle(0x8a93a8, 1);
    for (const e of data.enemies) {
      const p = toMinimap(data.cat, e, RANGE, HALF);
      if (p.inside) g.fillRect(cx + p.x, cy + p.y, 1, 1);
    }
    g.fillStyle(0xffc85a, 1);
    for (const c of data.chests) {
      const p = toMinimap(data.cat, c, RANGE, HALF);
      g.fillRect(cx + p.x - 2, cy + p.y - 2, 4, 4);
    }
    g.fillStyle(0xf5841f, 1).fillRect(cx - 2, cy - 2, 4, 4);

    let done = false;
    const close = () => {
      if (done) return;
      done = true;
      this.scene.resume("Game");
      this.scene.stop();
    };
    // un attimo prima di accettare il tocco: il dito che ha aperto la mappa non deve chiuderla subito
    this.time.delayedCall(300, () => {
      this.input.on("pointerup", close);
      this.input.keyboard?.on("keydown-M", close);
      this.input.keyboard?.on("keydown-ESC", close);
    });
  }
}
