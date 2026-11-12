// Il generatore di numeri casuali con seme: con lo stesso seme escono sempre gli stessi numeri.
// Serve ai test, a riprodurre un bug, e domani a una sfida del giorno uguale per tutti.
// È mulberry32: poche righe, veloce, abbastanza buono per un gioco (non per la crittografia).

export type Rng = () => number;

// createRng: restituisce una funzione che, a ogni chiamata, dà il prossimo numero tra 0 (compreso) e 1 (escluso),
// come Math.random. Lo stato è un intero a 32 bit, mescolato con moltiplicazioni e scorrimenti di bit.
export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
