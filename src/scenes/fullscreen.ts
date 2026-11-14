// Lo schermo intero: sul PC la finestra del browser, con le sue barre, fa entrare la scena da 480x270
// solo 3 volte (1440x810 su un monitor 1920x1080); a schermo intero entra 4 volte esatte, come sul telefono.
// Si accende e si spegne con il pulsante del titolo o con F; Esc lo spegne anche (lo fa il browser).
// Nel gioco installato, aperto dall'icona, la pagina è già a tutto schermo: lì non serve (src/logic/fullscreenButton.ts).
// Quando la finestra cambia misura, main.ts ricalcola l'ingrandimento (adatta).
// Esc (14 novembre 2026, Francesco: «applica i due rimdi»): dove il browser lo permette (Chrome, Edge) il gioco
// tiene Esc per sé a schermo intero, così Esc apre solo la pausa; per uscire si tiene premuto Esc 2 secondi
// (Keyboard Lock, wicg.github.io/keyboard-lock). Dove non si può, «riprendi» rimette lo schermo intero
// (src/logic/fullscreenRestore.ts, restoreAfterPause qui sotto).
import * as Phaser from "phaser";
import { fullscreenButton, type FullscreenState } from "../logic/fullscreenButton";
import { shouldRestoreFullscreen, type FullscreenExit } from "../logic/fullscreenRestore";

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

// Keyboard Lock: non è in tutti i browser (Firefox e Safari no), quindi si prova e basta.
interface KeyboardLock {
  lock(codes: string[]): Promise<void>;
  unlock(): void;
}
function keyboardLock(): KeyboardLock | undefined {
  const kb = (navigator as Navigator & { keyboard?: Partial<KeyboardLock> }).keyboard;
  return kb && typeof kb.lock === "function" && typeof kb.unlock === "function" ? (kb as KeyboardLock) : undefined;
}
function lockEscape() {
  try {
    keyboardLock()?.lock(["Escape"]).catch(() => undefined);
  } catch {
    // il browser dice di no: Esc resta del browser, e c'è restoreAfterPause
  }
}
function unlockEscape() {
  try {
    keyboardLock()?.unlock();
  } catch {
    // niente da sbloccare
  }
}

// L'ultima uscita dallo schermo intero, e se l'ha voluta il giocatore (pulsante o F).
let lastExit: FullscreenExit | null = null;
let playerLeaving = false;

// Da chiamare una volta, in main.ts: tiene nota delle uscite e toglie il blocco di Esc fuori dallo schermo intero.
export function watchFullscreen(game: Phaser.Game) {
  game.scale.on(Phaser.Scale.Events.ENTER_FULLSCREEN, () => {
    lastExit = null;
  });
  game.scale.on(Phaser.Scale.Events.LEAVE_FULLSCREEN, () => {
    lastExit = { at: performance.now(), byPlayer: playerLeaving };
    playerLeaving = false;
    unlockEscape();
  });
}

// Il blocco di Esc va chiesto prima di entrare (lo consiglia la specifica, per non mostrare due avvisi).
function enterFullscreen(scene: Phaser.Scene) {
  lockEscape();
  scene.scale.startFullscreen();
}

export function toggleFullscreen(scene: Phaser.Scene) {
  if (!canFullscreen(scene)) return;
  if (scene.scale.isFullscreen) {
    playerLeaving = true;
    scene.scale.stopFullscreen();
  } else enterFullscreen(scene);
}

// Il browser accende lo schermo intero solo dentro un gesto (un tocco, un clic, un tasto che non sia Esc).
// Dove il browser lo dice (navigator.userActivation) si prova solo se il gesto c'è: senza, la richiesta fallisce
// e lascia un errore nella pagina (provato il 14 novembre 2026: riprendere con Esc dopo 6 secondi fermi).
function gestureActive(): boolean {
  const ua = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation;
  return ua ? ua.isActive : true;
}

// Alla ripresa dalla pausa: se lo schermo intero l'ha spento lo stesso Esc che ha aperto la pausa, torna.
// Va chiamata dentro il tocco o il tasto di «riprendi». Con Esc di solito non torna (Esc non conta come gesto):
// si rientra con F o con il pulsante.
export function restoreAfterPause(scene: Phaser.Scene, pauseOpenedAt: number) {
  if (!canFullscreen(scene) || !gestureActive()) return;
  if (shouldRestoreFullscreen({ isFullscreen: scene.scale.isFullscreen, pauseOpenedAt, lastExit })) enterFullscreen(scene);
}
