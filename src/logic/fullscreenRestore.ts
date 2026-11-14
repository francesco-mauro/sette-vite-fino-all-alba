// Il ritorno allo schermo intero quando si riprende dalla pausa. Logica pura.
// Sul PC Esc fa uscire dallo schermo intero (lo fa il browser) e apre la pausa. Dove il browser lo permette
// (Chrome, Edge) il gioco tiene Esc per sé (src/scenes/fullscreen.ts); altrove, o quando non riesce,
// «riprendi» rimette lo schermo intero se lo ha spento lo stesso Esc che ha aperto la pausa.
// Francesco, 14 novembre 2026: «applica i due rimdi».

// Quanto vicini devono essere lo spegnimento e l'apertura della pausa per contare come lo stesso Esc.
// Più corto dei 2 secondi di Esc tenuto premuto, che è il modo voluto per uscire quando Esc è del gioco.
export const RESTORE_WINDOW_MS = 1000;

export interface FullscreenExit {
  // quando si è spento, sullo stesso orologio di pauseOpenedAt (performance.now)
  at: number;
  // l'ha spento il giocatore, con il pulsante o con F
  byPlayer: boolean;
}

export interface RestoreState {
  isFullscreen: boolean;
  pauseOpenedAt: number;
  lastExit: FullscreenExit | null;
}

export function shouldRestoreFullscreen(s: RestoreState): boolean {
  if (s.isFullscreen || !s.lastExit || s.lastExit.byPlayer) return false;
  return Math.abs(s.lastExit.at - s.pauseOpenedAt) <= RESTORE_WINDOW_MS;
}
