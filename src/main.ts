// Sette vite fino all'alba: il punto di partenza. Qui si crea il gioco Phaser e si sceglie come sta nello schermo.
import * as Phaser from "phaser";
import { parseMeasureParam } from "./logic/measureParam";
import { integerZoom } from "./logic/zoom";
import { GameScene } from "./scenes/GameScene";
import { LevelUpScene } from "./scenes/LevelUpScene";
import { MeasureScene } from "./scenes/MeasureScene";

// La scena vera è sempre 480x270 pixel (scelta della tappa 0). Poi si ingrandisce.
export const WIDTH = 480;
export const HEIGHT = 270;

// Con ?misura nell'indirizzo si accende la misura: una scena in più, sopra quella del gioco.
// Senza, measureCount è null e il gioco parte come sempre.
const measureCount = parseMeasureParam(location.search);

// Il carattere pixel (Silkscreen, in public/fonts/) va caricato prima che Phaser scriva un testo:
// Phaser disegna le scritte una volta sola, e senza il carattere userebbe quello di serie.
// Se non arriva (senza rete e senza copia salvata) il gioco parte lo stesso.
try {
  await document.fonts.load('8px "Silkscreen"');
} catch {
  // nessun problema: si usa il carattere di riserva
}

const game = new Phaser.Game({
  type: Phaser.AUTO, // WebGL se c'è, altrimenti Canvas
  parent: "gioco",
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: "#1c2133",
  pixelArt: true, // niente sfumature quando si ingrandisce: ogni pixel resta un quadratino netto
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.NONE, // l'ingrandimento lo decidiamo noi, sotto
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // La fisica Arcade di Phaser: muove il gatto e i nemici e sente quando si toccano.
  physics: { default: "arcade" },
  // La partita e, sopra, la scelta tra tre carte (parte solo quando si sale di livello).
  scene: measureCount === null ? [GameScene, LevelUpScene] : [GameScene, new MeasureScene(measureCount)],
  // Prima che parta la prima scena: con ?misura la scena di gioco resta ferma, come alla tappa 1a.
  callbacks: {
    preBoot: (g) => g.registry.set("misura", measureCount !== null),
  },
});

// L'ingrandimento intero nei pixel VERI dello schermo, non in quelli CSS.
// Sul telefono di prova (densità 2,875) 480x270 entra 4 volte esatte a tutto schermo: 1920x1080 pixel veri.
// Phaser.Scale.MAX_ZOOM conta i pixel CSS e lì darebbe 1, quindi il calcolo lo facciamo a mano,
// in src/logic/zoom.ts, che tiene conto anche delle misure arrotondate dal browser.
function adatta() {
  const dpr = window.devicePixelRatio || 1;
  const volte = integerZoom(innerWidth, innerHeight, dpr, WIDTH, HEIGHT);
  game.scale.setZoom(volte / dpr);
}
addEventListener("resize", adatta);
adatta();
