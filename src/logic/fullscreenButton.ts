// Il pulsante dello schermo intero nel titolo: cosa deve dire, o se non deve esserci.
// Nel gioco installato sul telefono la pagina è già a tutto schermo (il manifest dice fullscreen):
// lì il pulsante non farebbe niente di visibile, quindi non compare. Logica pura.

export interface FullscreenState {
  // il browser permette lo schermo intero
  available: boolean;
  // il gioco è aperto dall'icona, già a tutto schermo
  installed: boolean;
  // adesso si è a schermo intero
  isFullscreen: boolean;
}

// fullscreenButton: "enter" per entrare, "exit" per uscire, null se il pulsante non va mostrato
export function fullscreenButton(s: FullscreenState): "enter" | "exit" | null {
  if (!s.available || s.installed) return null;
  return s.isFullscreen ? "exit" : "enter";
}
