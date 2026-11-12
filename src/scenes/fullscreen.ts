// Lo schermo intero: sul PC la finestra del browser, con le sue barre, fa entrare la scena da 480x270
// solo 3 volte (1440x810 su un monitor 1920x1080); a schermo intero entra 4 volte esatte, come sul telefono.
// Si accende e si spegne con il pulsante del titolo o con F; Esc lo spegne anche (lo fa il browser).
// Nel gioco installato, aperto dall'icona, la pagina è già a tutto schermo: lì non serve (src/logic/fullscreenButton.ts).
// Quando la finestra cambia misura, main.ts ricalcola l'ingrandimento (adatta).
import * as Phaser from "phaser";
import { fullscreenButton, type FullscreenState } from "../logic/fullscreenButton";

// installed: aperto dall'icona del gioco installato. Se si è dentro lo schermo intero del gioco
// (document.fullscreenElement), non conta: il pulsante deve poter dire «esci».
function displayMode(m: string): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(`(display-mode: ${m})`).matches;
}

function installed(): boolean {
  if (document.fullscreenElement) return false;
  return displayMode("fullscreen") || displayMode("standalone");
}

export function fullscreenState(scene: Phaser.Scene): FullscreenState {
  return { available: scene.sys.game.device.fullscreen.available, installed: installed(), isFullscreen: scene.scale.isFullscreen };
}

// canFullscreen: il browser lo permette (l'iPhone, per esempio, no) e il gioco non è già a tutto schermo
export function canFullscreen(scene: Phaser.Scene): boolean {
  return fullscreenButton(fullscreenState(scene)) !== null;
}

export function toggleFullscreen(scene: Phaser.Scene) {
  if (!canFullscreen(scene)) return;
  if (scene.scale.isFullscreen) scene.scale.stopFullscreen();
  else scene.scale.startFullscreen();
}
