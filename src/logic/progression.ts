// I livelli: quante crocchette servono per salire, e cosa succede raccogliendone. Logica pura, senza Phaser.
import { LEVELS } from "../data/balance";

export interface XpState {
  level: number;
  // le crocchette raccolte dentro il livello attuale
  xp: number;
}

// xpToNext: quante crocchette servono per passare dal livello `level` al successivo.
// Cresce un po' a ogni livello: all'inizio si sale spesso, poi ogni livello chiede di più.
export function xpToNext(level: number): number {
  return LEVELS.first + LEVELS.growth * (level - 1);
}

// addXp: aggiunge crocchette e sale tutti i livelli che si riescono a pagare; il resto avanza nel livello nuovo.
export function addXp(state: XpState, amount: number): { state: XpState; levelsGained: number } {
  let { level, xp } = state;
  xp += amount;
  let levelsGained = 0;
  while (xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level++;
    levelsGained++;
  }
  return { state: { level, xp }, levelsGained };
}
