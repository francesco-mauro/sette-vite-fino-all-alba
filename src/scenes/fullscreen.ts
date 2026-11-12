// Lo schermo intero: sul PC la finestra del browser, con le sue barre, fa entrare la scena da 480x270
// solo 3 volte (1440x810 su un monitor 1920x1080); a schermo intero entra 4 volte esatte, come sul telefono.
// Si accende e si spegne con il pulsante del titolo o con F; Esc lo spegne anche (lo fa il browser).
// Quando la finestra cambia misura, main.ts ricalcola l'ingrandimento (adatta).
import * as Phaser from "phaser";

// canFullscreen: il browser lo permette (l'iPhone, per esempio, no)
export function canFullscreen(scene: Phaser.Scene): boolean {
  return scene.sys.game.device.fullscreen.available;
}

export function toggleFullscreen(scene: Phaser.Scene) {
  if (!canFullscreen(scene)) return;
  if (scene.scale.isFullscreen) scene.scale.stopFullscreen();
  else scene.scale.startFullscreen();
}
