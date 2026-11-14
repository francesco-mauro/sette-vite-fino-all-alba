// I test del ritorno allo schermo intero quando si riprende dalla pausa.
// Francesco, 14 novembre 2026, su Esc che fa uscire dallo schermo intero e apre la pausa: «applica i due rimdi».
import { describe, expect, it } from "vitest";
import { RESTORE_WINDOW_MS, shouldRestoreFullscreen } from "../../src/logic/fullscreenRestore";

describe("riprendere rimette lo schermo intero", () => {
  it("se lo stesso Esc che ha aperto la pausa l'ha spento, un attimo prima", () => {
    expect(shouldRestoreFullscreen({ isFullscreen: false, pauseOpenedAt: 5000, lastExit: { at: 4990, byPlayer: false } })).toBe(true);
  });

  it("anche se il browser lo spegne un attimo dopo che la pausa è comparsa", () => {
    expect(shouldRestoreFullscreen({ isFullscreen: false, pauseOpenedAt: 5000, lastExit: { at: 5200, byPlayer: false } })).toBe(true);
  });

  it("non se l'ha spento il giocatore, con il pulsante o con F", () => {
    expect(shouldRestoreFullscreen({ isFullscreen: false, pauseOpenedAt: 5000, lastExit: { at: 5000, byPlayer: true } })).toBe(false);
  });

  it("non se Esc è stato tenuto premuto in pausa per uscire (dopo 2 secondi)", () => {
    expect(shouldRestoreFullscreen({ isFullscreen: false, pauseOpenedAt: 5000, lastExit: { at: 7000, byPlayer: false } })).toBe(false);
  });

  it("non se si giocava già nella finestra prima della pausa", () => {
    expect(shouldRestoreFullscreen({ isFullscreen: false, pauseOpenedAt: 60000, lastExit: { at: 1000, byPlayer: false } })).toBe(false);
    expect(shouldRestoreFullscreen({ isFullscreen: false, pauseOpenedAt: 5000, lastExit: null })).toBe(false);
  });

  it("non se è ancora a schermo intero", () => {
    expect(shouldRestoreFullscreen({ isFullscreen: true, pauseOpenedAt: 5000, lastExit: { at: 4990, byPlayer: false } })).toBe(false);
  });

  it("la finestra è più corta dei 2 secondi di Esc tenuto premuto", () => {
    expect(RESTORE_WINDOW_MS).toBeLessThan(2000);
  });
});
