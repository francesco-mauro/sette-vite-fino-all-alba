// Sette vite fino all'alba: il punto di partenza. Qui si crea il gioco Phaser e si sceglie come sta nello schermo.
import Phaser from "phaser";
import { parseMeasureParam } from "./logic/measureParam";
import { GameScene } from "./scenes/GameScene";
import { MeasureScene } from "./scenes/MeasureScene";

// La scena vera è sempre 480x270 pixel (scelta della tappa 0). Poi si ingrandisce.
export const WIDTH = 480;
export const HEIGHT = 270;

// Con ?misura nell'indirizzo si accende la misura: una scena in più, sopra quella del gioco.
// Senza, measureCount è null e il gioco parte come sempre.
const measureCount = parseMeasureParam(location.search);

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
  // La fisica Arcade di Phaser. Per ora la usano solo gli sprite finti della misura,
  // dalla tappa 2 muoverà il gatto e i nemici.
  physics: { default: "arcade" },
  scene: measureCount === null ? [GameScene] : [GameScene, new MeasureScene(measureCount)],
});

// L'ingrandimento intero nei pixel VERI dello schermo, non in quelli CSS.
// Sul telefono di prova (densità 2,88) 480x270 entra 4 volte esatte: 1920x1080 pixel veri.
// Phaser.Scale.MAX_ZOOM conta i pixel CSS e lì darebbe 1, quindi il calcolo lo facciamo a mano.
function adatta() {
  const dpr = window.devicePixelRatio || 1;
  const volte = Math.max(1, Math.floor(Math.min((innerWidth * dpr) / WIDTH, (innerHeight * dpr) / HEIGHT)));
  game.scale.setZoom(volte / dpr);
}
addEventListener("resize", adatta);
adatta();
